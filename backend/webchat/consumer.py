from channels.generic.websocket import WebsocketConsumer, JsonWebsocketConsumer
import json
from asgiref.sync import async_to_sync
from .models import Conversation, Message
from django.contrib.auth import get_user_model
from server.models import Server

User = get_user_model()


# JsonWebSocketConsumer will parse the messages automatically
class WebChatConsumer(JsonWebsocketConsumer):

    # Declaring a room name here first
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_id = None
        self.user = None
        self.is_member = False

    # Accept connection then use the async to sync to assign the user to the right room connection
    def connect(self):
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            self.close(code=4001)
            return
        self.accept()

        self.channel_id = self.scope["url_route"]["kwargs"]["channelId"]
        self.server_id = self.scope["url_route"]["kwargs"]["serverId"]

        server = Server.objects.get(id=self.server_id)

        server.is_member = server.member.filter(id=self.user.id).exists()

        async_to_sync(self.channel_layer.group_add)(self.channel_id, self.channel_name)

    def receive_json(self, content):
        # print(self.is_member)
        if not self.is_member:
            return

        channel_id = self.channel_id
        sender = self.user
        message = content["message"]

        conversation, object = Conversation.objects.get_or_create(channel_id=channel_id)

        new_message = Message.objects.create(
            conversation=conversation, sender=sender, content=message
        )

        # When you recieve a message, the push out to the right group
        async_to_sync(self.channel_layer.group_send)(
            self.channel_id,
            {
                "type": "chat.message",
                "new_message": {
                    "id": new_message.id,
                    "sender": new_message.sender.username,
                    "content": new_message.content,
                    "timestamp": new_message.timestamp.isoformat(),
                },
            },
        )

    # When a message of type chat.message is recieved by the consumer, it triggers this method
    def chat_message(self, event):
        self.send_json(event)

    def disconnect(self, close_code):
        # Called when the socket closes
        # remove the user from the conversation
        async_to_sync(self.channel_layer.group_discard)(
            self.channel_id, self.channel_name
        )
        super().disconnect(close_code)


# Single User consumer
class MyConsumer(WebsocketConsumer):

    def connect(self):
        self.accept()

    def receive(self, text_data=None, bytes_data=None):
        # print(text_data)
        self.send(text_data=f"Your sent the message: {text_data['text']}")

    def disconnect(self, close_code):
        # Called when the socket closes
        pass
