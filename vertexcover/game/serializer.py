from rest_framework import serializers
from .models import User, Problem, Submission

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)
        #print(self.fields)

class UserSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','twitter_screenname','twitter_pic_url','has_changed_username','solvedCount', 'solvedProblems','submissions')
        
    def create(self, validated_data):
        return User.objects.create_user(request_data=validated_data)

class ProblemSerializer(DynamicFieldsModelSerializer):
    solvedCount = serializers.SerializerMethodField()
    submissionCount = serializers.SerializerMethodField()
    nOfVertices = serializers.SerializerMethodField()
    class Meta:
        model = Problem
        fields = ('id','solvedCount','submissionCount','nOfVertices','OPT','problem','solvers','submissions')
    def get_solvedCount(self, obj):
        return obj.solvers.count()
    def get_submissionCount(self, obj):
        return obj.submissions.count()
    def get_nOfVertices(self, obj):
        return len(obj.problem['vertices'])

class SubmissionSerializer(DynamicFieldsModelSerializer):
    user = serializers.SerializerMethodField()
    problem = serializers.SerializerMethodField()
    class Meta:
        model = Submission
        fields = ('id','user', 'problem', 'solution', 'score', 'is_best','submitted_at',)
    def get_user(self, obj):
        ret = UserSerializer(obj.user, fields = ('id','username','twitter_screenname','twitter_pic_url')).data
        return ret
    def get_problem(self, obj):
        ret = ProblemSerializer(obj.problem, fields = ('id','OPT')).data
        return ret