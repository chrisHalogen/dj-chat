from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from .serializers import AccountSerializer

retrieve_user_docs = extend_schema(
    responses=AccountSerializer(),
    parameters=[
        OpenApiParameter(
            name="user_id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="ID of the User",
        )
    ],
)
