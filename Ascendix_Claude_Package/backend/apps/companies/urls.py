from django.urls import path
from .views import (
    CompanyListView,
    CompanyEligibilityView,
    CompanyDetailView,
    CompanyPublishView,
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
)

company_urlpatterns = [
    path("", CompanyListView.as_view(), name="company-list"),
    path("eligibility/", CompanyEligibilityView.as_view(), name="company-eligibility"),
    path("<str:company_id>/publish/", CompanyPublishView.as_view(), name="company-publish"),
    path("<str:company_id>/", CompanyDetailView.as_view(), name="company-detail"),
]

urlpatterns = company_urlpatterns

notification_urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("read-all/", NotificationMarkAllReadView.as_view(), name="notification-read-all"),
    path("<str:notification_id>/read/", NotificationMarkReadView.as_view(), name="notification-mark-read"),
]
