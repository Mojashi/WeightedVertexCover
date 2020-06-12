"""vertexcover URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include

from vertexcover.views import TwitterLogin, twitterCallBack, logoutView

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include('game.urls')),
    # url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^auth/twitter$', TwitterLogin.as_view()),
    url(r'^callback', twitterCallBack),
    url(r'^logout$', logoutView),
    url('', include('frontend.urls')),
]