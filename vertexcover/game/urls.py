
from rest_framework import routers
from .views import UserViewSet, ProblemViewSet,SubmissionViewSet, submit, getMyInfo, setUserName

from django.conf.urls import url, include

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'problems', ProblemViewSet)
router.register(r'submissions', SubmissionViewSet)
urlpatterns = [
    url(r'^users/me/$', getMyInfo),
    url(r'^submit', submit),
    url(r'^setname', setUserName),
]
urlpatterns += router.urls