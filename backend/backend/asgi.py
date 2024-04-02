# Mind the order of imports and declarations
import os
from channels.routing import ProtocolTypeRouter, URLRouter


from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django_application = get_asgi_application()
from . import urls
from webchat.middleware import JWTAuthMiddleware


application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JWTAuthMiddleware(URLRouter(urls.websocket_urlpatterns)),
    }
)
