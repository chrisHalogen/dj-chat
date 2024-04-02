from django.contrib import admin
from django.urls import path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from server.views import ServerListViewSet, CategoryListViewset
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from webchat.consumer import WebChatConsumer
from server.views import create_seed_data, ServerMembershipViewSet
from webchat.views import MessageViewSet
from account.views import AccountViewSet, CustomTokenObtainPairView, RegisterView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register("api/server/select", ServerListViewSet)
router.register("api/server/category", CategoryListViewset)
router.register("api/messages", MessageViewSet, basename="message")
router.register("api/account", AccountViewSet)
router.register(
    r"api/membership/(?P<server_id>\d+)/membership",
    ServerMembershipViewSet,
    basename="membership",
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # YOUR PATTERNS
    path("api/docs/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Optional UI:
    path(
        "api/docs/schema/ui/",
        SpectacularSwaggerView.as_view(),
        name="swagger-ui",
    ),
    path("api/import-channels/", create_seed_data),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/register/", RegisterView.as_view()),
] + router.urls

websocket_urlpatterns = [
    path("<str:serverId>/<str:channelId>/", WebChatConsumer.as_asgi())
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
