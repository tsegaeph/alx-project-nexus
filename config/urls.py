from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from products.views import ProductViewSet, CategoryViewSet
from orders.views import CartViewSet, OrderViewSet
from accounts.views import SignupView, LoginView, UserMeView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenRefreshView
from django.views.decorators.csrf import csrf_exempt

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'categories', CategoryViewSet, basename='categories')

orders_router = DefaultRouter()
orders_router.register(r'cart', CartViewSet, basename='cart')
orders_router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include(orders_router.urls)),
    path('api/accounts/', include('accounts.urls')),


    path('api/register/', csrf_exempt(SignupView.as_view()), name='register'),
    path('api/login/', csrf_exempt(LoginView.as_view()), name='login'),
    path('api/me/', UserMeView.as_view(), name='me'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

#from django.conf import settings
#from django.conf.urls.static import static
#if settings.DEBUG:
#    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
