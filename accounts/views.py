from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .serializers import (
    UserSignupSerializer,
    UserLoginSerializer,
    UserSerializer,
)

User = get_user_model()

# -----------------------------
# SIGNUP
# -----------------------------
@method_decorator(csrf_exempt, name='dispatch')
class SignupView(generics.CreateAPIView):
    serializer_class = UserSignupSerializer
    permission_classes = []
    authentication_classes = []


# -----------------------------
# LOGIN
# -----------------------------
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = []
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=401)

        user = authenticate(request, username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=401)

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "is_seller": user.is_seller,
                "is_customer": user.is_customer,
            }
        })


# -----------------------------
# CURRENT USER (PROFILE)
# -----------------------------
class UserMeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# -----------------------------
# SELLER INFO
# -----------------------------
class SellerInfoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        seller_id = request.query_params.get("seller_id")

        if seller_id:
            try:
                seller = User.objects.get(id=int(seller_id), is_seller=True)
            except (User.DoesNotExist, ValueError):
                return Response({"detail": "Invalid seller id"}, status=400)

            info, created = SellerInfo.objects.get_or_create(seller=seller)
            serializer = SellerInfoSerializer(info)
            return Response(serializer.data, status=200)

        if not request.user.is_seller:
            return Response({"detail": "seller_id is required"}, status=400)

        info, created = SellerInfo.objects.get_or_create(seller=request.user)
        serializer = SellerInfoSerializer(info)
        return Response(serializer.data, status=200)

    def post(self, request):
        if not request.user.is_seller:
            return Response({"detail": "Only sellers can update this info"}, status=403)

        info, created = SellerInfo.objects.get_or_create(seller=request.user)
        serializer = SellerInfoSerializer(info, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=200)
