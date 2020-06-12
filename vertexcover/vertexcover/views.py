
from allauth.socialaccount.providers.twitter.views import TwitterOAuthAdapter
from rest_auth.registration.views import SocialLoginView
from rest_auth.social_serializers import TwitterLoginSerializer
from rest_framework.permissions import AllowAny
import json
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404, render

from allauth.socialaccount.models import SocialApp
import random
import time
from hashlib import sha1
import hmac
import requests
from urllib.parse import quote
import base64
from requests_oauthlib import OAuth1Session
from urllib.parse import parse_qsl
from django.template import loader
from django.http import Http404
from game.models import User
from urllib.parse import parse_qsl
from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.sites.models import Site

def get_pic_url(API_KEY,API_SECRET,TOKEN_SECRET, user_id):
    REQUEST_URL = 'https://api.twitter.com/1.1/users/show.json'
    REQUEST_METHOD = 'GET'
    SIGNATURE_METHOD = 'HMAC-SHA1'
    twitter_api = OAuth1Session(API_KEY, API_SECRET)
    response = twitter_api.get(REQUEST_URL, params={'user_id': user_id})
    
    #print(response.text)
    try:
        dic = json.loads(response.text)
        print(dic['profile_image_url_https'])
        return dic['profile_image_url_https']
    except Exception:
        return "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"

def get_auth_url(API_KEY,API_SECRET,TOKEN_SECRET, req):
    REQUEST_URL = 'https://api.twitter.com/oauth/request_token'
    REQUEST_METHOD = 'POST'
    CALLBACK_URL = req.scheme + "://" + req._get_raw_host() + "/callback/"
    SIGNATURE_METHOD = 'HMAC-SHA1'
    print(CALLBACK_URL)
    twitter_api = OAuth1Session(API_KEY, API_SECRET)
    response = twitter_api.post(REQUEST_URL, params={'oauth_callback': CALLBACK_URL})
    
    #print("https://api.twitter.com/oauth/authenticate?"+response.content.decode().split('&')[0])
    return "https://api.twitter.com/oauth/authenticate?"+response.content.decode().split('&')[0]

def get_access_token(API_KEY,API_SECRET,TOKEN_SECRET,oauth_token,oauth_verifier):
    REQUEST_URL = 'https://api.twitter.com/oauth/access_token'
    REQUEST_METHOD = 'POST'
    SIGNATURE_METHOD = 'HMAC-SHA1'

    twitter_api = OAuth1Session(API_KEY, API_SECRET)
    print('oauth_verifier'+":"+ oauth_verifier)
    response = twitter_api.post(REQUEST_URL, params={'oauth_token':oauth_token,'oauth_verifier': oauth_verifier})
    
    print(dict(parse_qsl(response.content.decode())))
    return dict(parse_qsl(response.content.decode()))


class TwitterLogin(SocialLoginView):
    permission_classes = [AllowAny]
    serializer_class = TwitterLoginSerializer
    adapter_class = TwitterOAuthAdapter

    def get(self, request):
        twprovider = get_object_or_404(SocialApp, provider="twitter")
        url = get_auth_url(twprovider.client_id, twprovider.secret, twprovider.key, request)
        print(url)
        return JsonResponse({'url':url})

def twitterCallBack(request):
    if request.method == 'GET':
        context = {"oauth_token":request.GET.get("oauth_token"),
        "oauth_verifier":request.GET.get("oauth_verifier")}
        if context['oauth_token'] == None or context['oauth_token'] == None:
            raise Http404("Invalid request")
        twprovider = get_object_or_404(SocialApp, provider="twitter")
        res = get_access_token(twprovider.client_id, twprovider.secret, twprovider.key, request.GET.get("oauth_token"), request.GET.get("oauth_verifier"))
        
        if not User.objects.filter(twitter_id=res['user_id']).exists():
            print('not exist')
            User.objects.create_user(res['screen_name'],res['screen_name'], res['user_id'], res['oauth_token'] + "&" + res['oauth_token_secret'])
        else:
            print("exist")
            
        user = User.objects.get(twitter_id=res['user_id'])
        login(request, user, backend=settings.AUTHENTICATION_BACKENDS[0])
        user.twitter_screenname = res['screen_name']
        picurl = get_pic_url(twprovider.client_id, twprovider.secret, twprovider.key, res['user_id'])
        user.twitter_pic_url = picurl
        user.save()

        return render(request, 'vertexcover/callback.html', context)
    else:
        raise Http404("This method isn't allowed")
    
def logoutView(request):
    try:
        logout(request)
    except Exception:
        return JsonResponse({'status':'failed'})
    else:
        return JsonResponse({'status':'sccess'})
    