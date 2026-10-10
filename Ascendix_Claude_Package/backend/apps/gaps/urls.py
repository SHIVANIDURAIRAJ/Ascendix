from django.urls import path
from .views import SkillGapView

urlpatterns = [
    path('', SkillGapView.as_view(), name='skill-gap'),
]
