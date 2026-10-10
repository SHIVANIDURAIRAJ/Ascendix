from django.urls import path
from apps.assessments.views import (
    AssessmentTopicsView,
    AssessmentQuizView,
    AssessmentSubmitView,
    AssessmentHistoryView,
)

urlpatterns = [
    path('topics/', AssessmentTopicsView.as_view(), name='assessment-topics'),
    path('quiz/<str:topic_id>/', AssessmentQuizView.as_view(), name='assessment-quiz'),
    path('submit/', AssessmentSubmitView.as_view(), name='assessment-submit'),
    path('history/', AssessmentHistoryView.as_view(), name='assessment-history'),
]
