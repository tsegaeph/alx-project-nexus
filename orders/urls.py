from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet, SellerOrderViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'orders/my', SellerOrderViewSet, basename='seller-orders')

urlpatterns = [
    path('', include(router.urls)),
]
