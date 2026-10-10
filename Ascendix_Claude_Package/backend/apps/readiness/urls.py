from django.urls import path
from apps.readiness.views import ReadinessScoreView

urlpatterns = [
    path('', ReadinessScoreView.as_view(), name='readiness-score'),
]
