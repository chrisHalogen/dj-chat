from django.shortcuts import render
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
from .models import Account
from rest_framework.response import Response
from .serializers import AccountSerializer
from .schemas import retrieve_user_docs
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTOPS, RegisterSerializer
from rest_framework.decorators import APIView
from rest_framework import status


class AccountViewSet(viewsets.ViewSet):
    queryset = Account.objects.all()
    permission_classes = [IsAuthenticated]

    @retrieve_user_docs
    def list(self, request):
        user_id = request.query_params.get("user_id")
        queryset = Account.objects.get(id=user_id)
        serializer = AccountSerializer(queryset)
        return Response(serializer.data)


class JWTSetCookieMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        # token = response.data.get("refresh")
        # # print(token)
        # response.set_cookie("hello", "hello", samesite="Lax")

        """
        "ACCESS_TOKEN_NAME": "access_token",
        "REFRESH_TOKEN_NAME": "refresh_token",
        "JWT_COOKIE_SAMESITE": "Lax",
        """

        if response.data.get("access"):
            response.set_cookie(
                settings.SIMPLE_JWT["ACCESS_TOKEN_NAME"],
                response.data("access"),
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                httponly=True,
                samesite=settings.SIMPLE_JWT["JWT_COOKIE_SAMESITE"],
            )

        if response.data.get("refresh"):
            response.set_cookie(
                settings.SIMPLE_JWT["REFRESH_TOKEN_NAME"],
                response.data("refresh"),
                max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                httponly=True,
                samesite=settings.SIMPLE_JWT["JWT_COOKIE_SAMESITE"],
            )

        return super().finalize_response(request, response, *args, **kwargs)


class JWTCookieTokenObtainPairView(JWTSetCookieMixin, TokenObtainPairView):
    pass


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTOPS


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data["username"]
            forbidden_usernames = ["admin", "root", "superuser"]

            if username in forbidden_usernames:
                return Response(
                    {"error": "username not allowed"}, status=status.HTTP_409_CONFLICT
                )

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        errors = serializer.errors
        if "username" in errors and "non_field_errors" not in errors:
            return Response(
                {"error": "username already exists"}, status=status.HTTP_409_CONFLICT
            )

        return Response(errors, status=status.HTTP_409_CONFLICT)
