from django.urls import path
from .views import SellerInfoView

urlpatterns = [
    path('seller-info/', SellerInfoView.as_view(), name='seller-info'),
]
