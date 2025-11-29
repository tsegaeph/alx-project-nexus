from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

# -----------------------------
# SIGNUP SERIALIZER
# -----------------------------
class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=[('seller', 'seller'), ('customer', 'customer')], write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)

        if role == 'seller':
            user.is_seller = True
            user.is_customer = False
            user.save()
            # auto-create SellerInfo on signup
        else:
            user.is_customer = True
            user.is_seller = False
            user.save()

        return user


# -----------------------------
# LOGIN SERIALIZER
# -----------------------------
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# -----------------------------
# USER SERIALIZER (for /api/me/)
# -----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'is_seller',
            'is_customer'
        ]
