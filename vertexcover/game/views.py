from django.shortcuts import render
import django_filters.rest_framework
from rest_framework import viewsets, filters, generics
from .models import User, Problem, Submission
from .serializer import UserSerializer, ProblemSerializer, SubmissionSerializer
import json
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404, render
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import api_view,authentication_classes,permission_classes
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.core import management
import random


class  UserViewSet(viewsets.ReadOnlyModelViewSet):
    class RankingPagination(PageNumberPagination):
        page_size = 10
        page_size_query_param = 'page_size'
        max_page_size = 100

    permission_classes = [AllowAny]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.OrderingFilter]
    pagination_class = RankingPagination

    def get_serializer(self, *args, **kwargs):
        if 'fields[]' in self.request.query_params:
            kwargs['fields'] = self.request.query_params.getlist('fields[]')
        else:
            if self.action == 'list':
                kwargs['fields'] = ['id','username','twitter_screenname','twitter_pic_url','solvedCount']
            if self.action == 'retrieve':
                kwargs['fields'] = ['id','username','twitter_screenname','twitter_pic_url','solvedCount', 'solvedProblems', 'submissions']
        return super().get_serializer(*args, **kwargs)


class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    class ProblemPagination(PageNumberPagination):
        page_size = 30
        page_size_query_param = 'page_size'
        max_page_size = 100
        def get_paginated_response(self, data):
            return Response({
                'page_number':self.page.number,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'count': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'results': data
            })

    permission_classes = [AllowAny]
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    pagination_class = ProblemPagination
    filter_backends = [filters.OrderingFilter]

    ordering_fields = ('id', 'solvedCount', 'numOfVertices')

    def get_serializer(self, *args, **kwargs):
        if 'fields[]' in self.request.query_params:
            kwargs['fields'] = self.request.query_params.getlist('fields[]')
        else:
            if self.action == 'list':
                kwargs['fields'] = ['id','solvedCount','submissionCount','nOfVertices','OPT']
            if self.action == 'retrieve':
                kwargs['fields'] = ['id','solvedCount','submissionCount','OPT','problem','solvers','submissions']
        return super().get_serializer(*args, **kwargs)


class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    class SubmissionsPagination(PageNumberPagination):
        page_size = 10
        page_size_query_param = 'page_size'
        max_page_size = 100

    class IsOwnerOrAdmin(permissions.BasePermission):
        def has_object_permission(self, request, view, obj):
            return obj.user == request.user or request.user.is_admin
    queryset = Submission.objects.all()
    def get_queryset(self):
        queryset = Submission.objects.all()
        is_best = self.request.query_params.get('is_best', None)
        userid = self.request.query_params.get('userid', None)
        problemid = self.request.query_params.get('problemid', None)
        if userid is not None:
            queryset = queryset.filter(user=userid)
        if problemid is not None:
            queryset = queryset.filter(problem=problemid)
        if is_best is not None:
            queryset = queryset.filter(is_best=is_best)
        return queryset
    permission_classes_by_action = {'list': [AllowAny],
                                    'retrieve': [IsOwnerOrAdmin]}

    serializer_class = SubmissionSerializer
    pagination_class = SubmissionsPagination
    filter_backends = [filters.OrderingFilter]

    ordering_fields = ('submitted_at', 'score')


    def get_serializer(self, *args, **kwargs):
        if 'fields[]' in self.request.query_params:
            kwargs['fields'] = self.request.query_params.getlist('fields[]')
        else:
            if self.action == 'list':
                kwargs['fields'] = ['id','user', 'problem', 'score', 'submitted_at',]
            if self.action == 'retrieve':
                kwargs['fields'] = ['id','user', 'problem', 'solution', 'score', 'submitted_at',]
        return super().get_serializer(*args, **kwargs)
    def get_permissions(self):
        try:
            # return permission_classes depending on `action` 
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError: 
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]

def isValidSolution(problem, solution):
    for v in solution:
        if type(v) != int or 0 > v or len(problem.problem['vertices']) <= v:
            return False
    for edge in problem.problem['edges']:
        if edge['from'] not in solution and edge['to'] not in solution:
            return False
    return True

def calcScore(problem, solution):
    if not isValidSolution(problem, solution):
        raise Exception
    score = 0
    for v in solution:
        score += problem.problem['vertices'][v]['weight']
    return score

@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def submit(request, format=None):
    print('submit from '+ str(request.user.id))
    try:
        print(request.data)
        datas = request.data
        problem = Problem.objects.get(id=datas['problem_id'])
        user = request.user
        assert(user.id is not None)
        solution = datas['solution']
        score = calcScore(problem, solution)

    except (Exception ,KeyError, Problem.DoesNotExist):
        return JsonResponse({'status':'fail'})

    else:
        submission = Submission(user=user, problem=problem, solution=solution, score=score)
        submission.save()

        if problem.OPT == score:
            print("optimal!")
            user.solvedProblems.add(problem)
            user.solvedCount = user.solvedProblems.count()
            user.save()

        befBests = user.submissions.filter(is_best=True).filter(problem=problem).order_by('-score')
            
        while befBests.count() > 1:
            print("ERROR!!!! BESTS ARE TOO MANY problem:" + str(problem.id) + " user:" + user.username)
            b = befBests[0]
            b.is_best = False
            b.save()
            befBests = user.submissions.filter(is_best=True).filter(problem=problem).order_by('-score')
            
        bestSub = None
        if befBests.exists():
            bestSub = befBests[0]

        if bestSub == None or bestSub.score > score:
            submission.is_best = True

            if bestSub:
                bestSub.is_best = False
                bestSub.save()

        submission.save()

        if user.solvedCount == Problem.objects.count():
            print("ALL PROBLEMS ARE SOLVED!!!")
            management.call_command('addProblem', 1, 10, 71, 1, 5 ,100 if random.random() < 0.5 else 10)
            print("NEW PROBLEMS APPEARED")

        return JsonResponse({'status':'success', 'score':score})

@api_view(['GET'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def getMyInfo(request):
    serializer = UserSerializer(request.user)
    
    return JsonResponse(serializer.data)

@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def setUserName(request):
    user = request.user
    datas = request.data
    username = datas['new_username']

    if user.username != username and User.objects.filter(username=username).exists():
        return JsonResponse({'status':'fail', 'reason':'The username is already in use'})

    if len(username) > 13:
        return JsonResponse({'status':'fail', 'reason':'The username is too long'})

    if len(username) == 0:
        return JsonResponse({'status':'fail', 'reason':'Usename musn\'t be empty string'})

    user.username = username
    user.has_changed_username = True
    user.save()
    
    return JsonResponse({'status':'success', 'username':user.username})