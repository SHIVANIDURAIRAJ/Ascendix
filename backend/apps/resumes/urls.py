from django.urls import path
from .views import ResumeUploadView, LatestResumeView

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('latest/', LatestResumeView.as_view(), name='resume-latest'),
]
