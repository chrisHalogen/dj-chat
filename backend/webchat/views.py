from django.shortcuts import render
from rest_framework import viewsets
from .models import Conversation
from .serializer import MessageSerializer
from rest_framework.response import Response
from .schemas import list_message_docs
from rest_framework.exceptions import ValidationError
from rest_framework import status


class MessageViewSet(viewsets.ViewSet):
    @list_message_docs
    def list(self, request):
        channel_id = request.query_params.get("channel_id")
        if not channel_id:
            raise ValidationError("ID of the Channel is Absent")

        try:
            conversation = Conversation.objects.get(channel_id=channel_id)
        except Conversation.DoesNotExist:
            return Response([], status=status.HTTP_404_NOT_FOUND)

        message = conversation.message.all()
        serializer = MessageSerializer(message, many=True)

        return Response(serializer.data)
