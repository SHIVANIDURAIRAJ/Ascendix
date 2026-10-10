from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .company_eligibility_service import CompanyEligibilityService


def _is_admin_request(request) -> bool:
    role_header = str(request.headers.get("X-User-Role", "")).upper()
    user_is_admin = getattr(request.user, "is_admin", False)
    return bool(user_is_admin or role_header in ("ADMIN", "FACULTY"))


class CompanyListView(APIView):
    """
    GET  /api/companies/
      - For Admin (`?scope=admin`): returns all companies (Draft, Published, Unpublished) and dashboard counts.
      - For Student: returns all Published company opportunities with personalized student eligibility.
    POST /api/companies/
      - Admin/Faculty only: creates a new company with academic, technical (mandatory/preferred), and optional criteria.
    """

    def get(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing user identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        scope = str(request.query_params.get("scope", "")).lower()
        if scope == "admin":
            if not _is_admin_request(request):
                return Response(
                    {"success": False, "error": "Forbidden: Admin/Faculty privileges required."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            try:
                data = CompanyEligibilityService.list_admin_companies()
                return Response(
                    {
                        "success": True,
                        "message": "Admin company directory retrieved.",
                        "data": data,
                    },
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                return Response(
                    {"success": False, "error": f"Failed to load admin companies: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        try:
            data = CompanyEligibilityService.evaluate_all_companies(user_id, trigger_source="companies_list")
            return Response(
                {
                    "success": True,
                    "message": "Published company opportunities and personalized eligibility retrieved.",
                    "data": data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to evaluate company opportunities: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        user_email = getattr(request.user, "email", "") or request.headers.get("X-User-Email", "")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing user identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not _is_admin_request(request):
            return Response(
                {
                    "success": False,
                    "error": "Forbidden: Only Admin/Faculty users can create company opportunities.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            created = CompanyEligibilityService.create_company(
                request.data,
                admin_user_id=user_id,
                admin_email=user_email,
            )
            return Response(
                {
                    "success": True,
                    "message": f"Company '{created['company_name']}' ({created['role']}) created successfully.",
                    "data": created,
                },
                status=status.HTTP_201_CREATED,
            )
        except ValueError as ve:
            return Response(
                {"success": False, "error": str(ve)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to create company: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CompanyEligibilityView(APIView):
    """
    GET /api/companies/eligibility/
    Evaluates and returns personalized company eligibility across Resume + Profile + Target Role + Skill Gap
    for all Admin-published companies.
    """

    def get(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            data = CompanyEligibilityService.evaluate_all_companies(user_id, trigger_source="eligibility_check")
            return Response(
                {
                    "success": True,
                    "message": "Personalized company eligibility evaluated.",
                    "data": data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to compute company eligibility: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CompanyDetailView(APIView):
    """
    GET    /api/companies/<company_id>/ — View company details and student eligibility (or raw Admin details)
    PUT    /api/companies/<company_id>/ — Admin only: Edit company requirements
    DELETE /api/companies/<company_id>/ — Admin only: Delete company
    """

    def get(self, request, company_id):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing user identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        is_admin = _is_admin_request(request)
        try:
            detail = CompanyEligibilityService.get_company_detail_for_student(
                user_id, company_id, is_admin=is_admin
            )
            if not detail:
                return Response(
                    {"success": False, "error": f"Company opportunity '{company_id}' not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {
                    "success": True,
                    "data": detail,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to retrieve company details: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, company_id):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing user identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not _is_admin_request(request):
            return Response(
                {"success": False, "error": "Forbidden: Only Admin/Faculty users can edit companies."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            updated = CompanyEligibilityService.update_company(company_id, request.data, admin_user_id=user_id)
            if not updated:
                return Response(
                    {"success": False, "error": f"Company '{company_id}' not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {
                    "success": True,
                    "message": f"Company '{updated['company_name']}' updated successfully.",
                    "data": updated,
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as ve:
            return Response(
                {"success": False, "error": str(ve)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to update company: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, company_id):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing user identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not _is_admin_request(request):
            return Response(
                {"success": False, "error": "Forbidden: Only Admin/Faculty users can delete companies."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            deleted = CompanyEligibilityService.delete_company(company_id)
            if not deleted:
                return Response(
                    {"success": False, "error": f"Company '{company_id}' not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {
                    "success": True,
                    "message": "Company opportunity deleted successfully.",
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to delete company: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CompanyPublishView(APIView):
    """
    PATCH /api/companies/<company_id>/publish/
    Admin/Faculty only: Publishes, unpublishes, or updates the status of a company.
    """

    def patch(self, request, company_id):
        return self._toggle_publish(request, company_id)

    def post(self, request, company_id):
        return self._toggle_publish(request, company_id)

    def _toggle_publish(self, request, company_id):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing user identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not _is_admin_request(request):
            return Response(
                {"success": False, "error": "Forbidden: Only Admin/Faculty users can publish/unpublish companies."},
                status=status.HTTP_403_FORBIDDEN,
            )

        target_status = request.data.get("status") if isinstance(request.data, dict) else None
        try:
            updated = CompanyEligibilityService.set_company_status(company_id, target_status=target_status)
            if not updated:
                return Response(
                    {"success": False, "error": f"Company '{company_id}' not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            return Response(
                {
                    "success": True,
                    "message": f"Company '{updated['company_name']}' status changed to {updated['status']}.",
                    "data": updated,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to change company status: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NotificationListView(APIView):
    """
    GET /api/notifications/
    Retrieves personalized eligibility notifications for the authenticated student.
    """

    def get(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            notif_data = CompanyEligibilityService.get_student_notifications(user_id)
            return Response(
                {
                    "success": True,
                    "unread_count": notif_data["unread_count"],
                    "notifications": notif_data["notifications"],
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to load notifications: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NotificationMarkReadView(APIView):
    """
    PATCH /api/notifications/<notification_id>/read/
    Marks a single notification as read.
    """

    def patch(self, request, notification_id):
        return self._mark_read(request, notification_id)

    def post(self, request, notification_id):
        return self._mark_read(request, notification_id)

    def _mark_read(self, request, notification_id):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            CompanyEligibilityService.mark_notification_read(user_id, notification_id)
            notif_data = CompanyEligibilityService.get_student_notifications(user_id)
            return Response(
                {
                    "success": True,
                    "message": "Notification marked as read.",
                    "data": {
                        "unread_count": notif_data["unread_count"],
                    },
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to update notification: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NotificationMarkAllReadView(APIView):
    """
    PATCH /api/notifications/read-all/
    Marks all unread notifications for the student as read.
    """

    def patch(self, request):
        return self._mark_all(request)

    def post(self, request):
        return self._mark_all(request)

    def _mark_all(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "error": "Unauthorized: Missing student identity."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            count = CompanyEligibilityService.mark_all_notifications_read(user_id)
            return Response(
                {
                    "success": True,
                    "message": f"Marked {count} notifications as read.",
                    "data": {
                        "unread_count": 0,
                        "marked_count": count,
                    },
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"success": False, "error": f"Failed to mark notifications as read: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
