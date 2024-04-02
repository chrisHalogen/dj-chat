# from typing import Any


# class JWTAuthMiddleware:
#     def __init__(self, app):
#         self.app = app

#     async def __call__(self, scope, recieve, send):
#         headers_dict = dict(scope["headers"])
#         print(headers_dict)

#         return await self.app(scope, recieve, send)
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_params = dict(
            (k.decode(), v.decode())
            for k, v in [
                param.split(b"=") for param in scope["query_string"].split(b"&")
            ]
        )
        if "token" in query_params:
            access_token = query_params["token"]
            user = await self.get_user(access_token)
            # print("Access Token = ", access_token)
            if user is not None:
                scope["user"] = user
                scope["token"] = access_token
        return await self.app(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        try:
            # print("Before Auth")
            # user = JWTAuthentication().authenticate({"token": token})
            access_token_obj = AccessToken(token)
            # print(access_token_obj)
            user_id = access_token_obj["user_id"]
            user = User.objects.get(id=user_id)

            if user is not None:
                return user
        except:
            pass
        return AnonymousUser()
