from django.db import models
from django.contrib.postgres.fields import ArrayField, JSONField
import datetime

from django.contrib.auth import get_user_model
from django.db import models
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser, _user_has_perm
)
from django.core import validators
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone

from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from rest_framework.authentication import get_authorization_header
import jwt

class AccountManager(BaseUserManager):
    def create_user(self, username, twitter_screenname, twitter_id, password, **kwargs):
        now = timezone.now()
        user = self.model(
            username=username,
            twitter_screenname = twitter_screenname,
            twitter_id=twitter_id,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username,twitter_screenname, password, **extra_fields):
        user = self.create_user(username, twitter_screenname, password, username)
        user.is_admin = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    password = models.CharField(max_length=100, unique=True)
    username = models.CharField(max_length=100, unique=True)
    has_changed_username = models.BooleanField(default=False)
    twitter_screenname = models.CharField(max_length=100,unique=True)
    twitter_pic_url = models.CharField(max_length=100, default="https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png")

    solvedProblems = models.ManyToManyField('game.Problem',related_name='solvers')
    solvedCount = models.IntegerField(default=0)
    is_admin    = models.BooleanField(default=False)
    is_staff    = models.BooleanField(default=False)
    twitter_id = models.CharField(max_length=100, unique=True, null=True)
    objects = AccountManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['password', 'twitter_screenname']

    def user_has_perm(self,user, perm, obj):
        return _user_has_perm(user, perm, obj)

    def has_perm(self, perm, obj=None):
        return _user_has_perm(self, perm, obj=obj)

    def has_module_perms(self, app_label):
        return self.is_admin

    @property
    def is_superuser(self):
        return self.is_admin

    class Meta:
        db_table = 'api_user'
        swappable = 'AUTH_USER_MODEL'

class Problem(models.Model):
    problem = JSONField() # {weights:[3,4,56,6,4,2], edges:{{"from":2, "to":3},{"from":2, "to":3},{"from":2, "to":3},}}
    OPT = models.IntegerField(default=-1)
    OPTSolution = ArrayField(models.IntegerField())

class Submission(models.Model):
    is_best = models.BooleanField(default=False)
    user = models.ForeignKey(get_user_model(), related_name='submissions', on_delete=models.SET_NULL, null=True)
    problem = models.ForeignKey(Problem, related_name='submissions', on_delete=models.CASCADE, null=False)
    solution = ArrayField(models.IntegerField())
    score = models.IntegerField()
    submitted_at = models.DateTimeField(auto_now_add=True)
