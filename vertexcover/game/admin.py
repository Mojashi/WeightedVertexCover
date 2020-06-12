from django.contrib import admin
from .models import User, Problem, Submission
# Register your models here.



@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass

@admin.register(Problem)
class Problem(admin.ModelAdmin):
    pass

@admin.register(Submission)
class Submission(admin.ModelAdmin):
    pass