from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "healthy",
        "service": "Ascendix Django Domain Engine",
        "version": "1.0.0"
    })

from apps.companies.urls import notification_urlpatterns

urlpatterns = [
    path('api/health/', health_check, name='health-check'),
    path('api/profile/', include('apps.profiles.urls')),
    path('api/resume/', include('apps.resumes.urls')),
    path('api/roles/', include('apps.roles.urls')),
    path('api/skill-gap/', include('apps.gaps.urls')),
    path('api/roadmap/', include('apps.roadmaps.urls')),
    path('api/assessments/', include('apps.assessments.urls')),
    path('api/readiness/', include('apps.readiness.urls')),
    path('api/companies/', include('apps.companies.urls')),
    path('api/notifications/', include((notification_urlpatterns, 'notifications'))),
]
