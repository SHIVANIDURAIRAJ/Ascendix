from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.authentication import GatewayAuthentication
from apps.assessments.services import AssessmentService

class AssessmentTopicsView(APIView):
    authentication_classes = [GatewayAuthentication]

    def get(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "message": "User identification missing"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            topics = AssessmentService.get_topics(user_id)
            return Response({
                "success": True,
                "count": len(topics),
                "data": topics
            })
        except Exception as e:
            return Response(
                {"success": False, "message": f"Failed to retrieve assessment topics: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AssessmentQuizView(APIView):
    authentication_classes = [GatewayAuthentication]

    def get(self, request, topic_id):
        try:
            quiz, err = AssessmentService.get_quiz(topic_id)
            if err:
                return Response(
                    {"success": False, "message": err},
                    status=status.HTTP_404_NOT_FOUND
                )
            return Response({
                "success": True,
                "data": quiz
            })
        except Exception as e:
            return Response(
                {"success": False, "message": f"Failed to load quiz: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AssessmentSubmitView(APIView):
    authentication_classes = [GatewayAuthentication]

    def post(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "message": "User identification missing"},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data or {}
        topic_id = data.get("topic_id")
        answers = data.get("answers", {})
        time_spent_seconds = data.get("time_spent_seconds", 0)

        if not topic_id:
            return Response(
                {"success": False, "message": "topic_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result, err = AssessmentService.submit_quiz(
                user_id=user_id,
                topic_id=topic_id,
                answers=answers,
                time_spent_seconds=time_spent_seconds
            )
            if err:
                return Response(
                    {"success": False, "message": err},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response({
                "success": True,
                "message": "Assessment submitted and skills calibrated successfully.",
                "data": result
            })
        except Exception as e:
            return Response(
                {"success": False, "message": f"Failed to submit assessment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AssessmentHistoryView(APIView):
    authentication_classes = [GatewayAuthentication]

    def get(self, request):
        user_id = getattr(request.user, "user_id", None) or request.headers.get("X-User-Id")
        if not user_id:
            return Response(
                {"success": False, "message": "User identification missing"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            history = AssessmentService.get_history(user_id)
            return Response({
                "success": True,
                "count": len(history),
                "data": history
            })
        except Exception as e:
            return Response(
                {"success": False, "message": f"Failed to retrieve assessment history: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
