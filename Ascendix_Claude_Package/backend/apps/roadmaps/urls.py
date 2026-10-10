from django.urls import path
from .views import RoadmapView, ToggleTaskCompletionView

urlpatterns = [
    path('', RoadmapView.as_view(), name='roadmap-view'),
    path('tasks/<str:task_id>/', ToggleTaskCompletionView.as_view(), name='task-toggle-patch'),
    path('tasks/<str:task_id>/toggle/', ToggleTaskCompletionView.as_view(), name='task-toggle-post'),
]
