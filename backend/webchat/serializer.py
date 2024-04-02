from rest_framework.serializers import ModelSerializer
from .models import Message
from rest_framework import serializers


class MessageSerializer(ModelSerializer):
    sender = serializers.StringRelatedField()

    class Meta:
        model = Message
        exclude = ["conversation"]
