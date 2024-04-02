from rest_framework.serializers import ModelSerializer
from .models import Account
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.exceptions import InvalidToken


class AccountSerializer(ModelSerializer):
    class Meta:
        model = Account
        fields = ["username"]


class CustomTOPS(TokenObtainPairSerializer):
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user_id"] = self.user.id
        return data


class RegisterSerializer(ModelSerializer):
    class Meta:
        model = Account
        fields = ("username", "password")

    def is_valid(self, raise_exception=False):
        valid = super().is_valid(raise_exception=raise_exception)

        if valid:
            username = self.validated_data["username"]
            if Account.objects.filter(username=username).exists():
                valid = False

        return valid

    def create(self, validated_data):
        user = Account.objects.create_user(**validated_data)
        return user
