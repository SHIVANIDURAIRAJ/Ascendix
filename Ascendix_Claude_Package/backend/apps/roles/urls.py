from django.urls import path
from .views import TargetRolesListView, SelectTargetRoleView

urlpatterns = [
    path('', TargetRolesListView.as_view(), name='roles-list'),
    path('select/', SelectTargetRoleView.as_view(), name='roles-select'),
]
