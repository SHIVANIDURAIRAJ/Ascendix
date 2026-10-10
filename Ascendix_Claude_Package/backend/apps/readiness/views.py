from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.authentication import GatewayAuthentication
from apps.readiness.services import ReadinessService

class ReadinessScoreView(APIView):
    authentication_classes = [GatewayAuthentication]

    def get(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "message": "User identification missing"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            readiness_data = ReadinessService.calculate_readiness_score(user_id)
            return Response({
                "success": True,
                "message": "Placement Readiness Score computed successfully.",
                "data": readiness_data
            })
        except Exception as e:
            return Response(
                {"success": False, "message": f"Failed to compute readiness score: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
