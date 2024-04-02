from rest_framework import viewsets
from .models import *
from .serializer import *
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from django.db.models import Count
from .schema import server_list_docs
from drf_spectacular.utils import extend_schema
from .seed_data import channels_data
from django.http import JsonResponse
from account.models import Account
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework import status


class ServerMembershipViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request, server_id):
        server = get_object_or_404(Server, id=server_id)
        user = request.user

        if server.member.filter(id=user.id).exists():
            return Response(
                {"error": "User is already a member"}, status=status.HTTP_409_CONFLICT
            )

        server.member.add(user)
        return Response(
            {"message": "User joined server successfully"}, status=status.HTTP_200_OK
        )

    # def destroy(self, request, server_id):
    #     pass

    @action(detail=False, methods=["DELETE"])
    def remove_member(self, request, server_id):
        server = get_object_or_404(Server, id=server_id)
        user = request.user

        if not server.member.filter(id=user.id).exists():
            return Response(
                {"error": "User is already not a member"},
                status=status.HTTP_409_CONFLICT,
            )

        if server.owner == user:
            return Response(
                {"error": "Owner Cannot be removed"}, status=status.HTTP_400_BAD_REQUEST
            )

        server.member.remove(user)
        return Response(
            {"message": "User removed from server"}, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["GET"])
    def is_member(self, request, server_id):
        server = get_object_or_404(Server, id=server_id)
        user = request.user

        is_member = server.member.filter(id=user.id).exists()

        return Response({"is_member": is_member})


def create_seed_data(request):
    try:
        for entry in channels_data["channels"]:
            # print(entry)

            c = Channel.objects.create(
                name=entry["name"],
                topic=entry["topic"],
                server=Server.objects.get(name__icontains=entry["server"]),
                owner=Account.objects.get(id=1),
            )

            c.save()
        return JsonResponse({"data": "success"})
    except Exception as e:
        return JsonResponse({"data": f"error - {e}"})


class CategoryListViewset(viewsets.ViewSet):
    queryset = Category.objects.all()

    # Not adding any query parameters. Just telling swagger UI that
    @extend_schema(responses=CategorySerializer)
    def list(self, request):
        serializer = CategorySerializer(self.queryset, many=True)
        return Response(serializer.data)


# Define the ServerListViewSet viewset class.
class ServerListViewSet(viewsets.ViewSet):
    # Set the queryset to include all Server objects.
    queryset = Server.objects.all()

    # Define the list method to handle GET requests.
    @server_list_docs
    def list(self, request):
        """
        Retrieves a list of servers based on optional query parameters.

        Args:
            request (Request): The request object containing the query parameters.

        Returns:
            Response: A response containing the serialized server data.

        Raises:
            AuthenticationFailed: If the request is filtered by user or server ID and the user is not authenticated.
            ValidationError: If the server with the specified ID is not found or if there is a value error.

        This method retrieves a list of servers based on the provided query parameters. It accepts the following
        optional query parameters:

        - category (str): Filter the servers by category.
        - qty (int): Limit the number of servers returned.
        - by_user (bool): Filter the servers by the authenticated user if set to True.
        - by_serverid (int): Filter the servers by the specified server ID.
        - with_num_members (bool): Annotate the queryset with the number of members if set to True.

        If the request includes the 'by_user' or 'by_serverid' query parameters and the user is not authenticated,
        an AuthenticationFailed exception is raised.

        If the 'by_serverid' query parameter is provided, the method attempts to filter the queryset by the specified
        server ID. If the server with the specified ID is not found, a ValidationError is raised.

        Example:
            To retrieve a list of servers filtered by category 'example_category' and limited to 10 servers:
            GET /servers/?category=example_category&qty=10
        """

        # Get query parameters from the request.
        category = request.query_params.get("category")
        qty = request.query_params.get("qty")
        by_user = request.query_params.get("by_user") == "true"
        by_serverid = qty = request.query_params.get("by_serverid")
        with_num_members = request.query_params.get("with_num_members") == "true"

        # Check if the request is filtered by user or server ID and user is not authenticated.
        # if by_user or by_serverid and not request.user.is_authenticated:
        #     raise AuthenticationFailed()

        # Filter the queryset by category if category is provided in the request.
        if category:
            self.queryset = self.queryset.filter(category__name__icontains=category)

        # Filter the queryset by the authenticated user's ID if by_user is True.
        if by_user:
            user_id = request.user.id
            self.queryset = self.queryset.filter(member=user_id)

        # Annotate the queryset with the number of members if with_num_members is True.
        if with_num_members:
            self.queryset = self.queryset.annotate(num_members=Count("member"))

        # Filter the queryset by server ID if by_serverid is provided in the request.
        if by_serverid:
            # if not request.user.is_authenticated:
            #     raise AuthenticationFailed()

            try:
                self.queryset = self.queryset.filter(id=by_serverid)

                # Raise a ValidationError if the server with the specified ID is not found.
                if not self.queryset.exists():
                    raise ValidationError(
                        detail=f"Server with the ID of {by_serverid} not found"
                    )
            except ValueError:
                raise ValidationError(detail=f"Server value error")

        # Limit the queryset to the specified quantity if qty is provided.
        if qty:
            self.queryset = self.queryset[: int(qty)]

        # Serialize the queryset and return the data in a Response object.
        serializer = ServerSerializer(
            self.queryset, many=True, context={"num_members": with_num_members}
        )
        return Response(serializer.data)
