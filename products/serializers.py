from rest_framework import serializers
from .models import Product, Category, ProductImage
from cloudinary.uploader import upload as cloudinary_upload

class CategorySerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Category
        fields = ['id', 'owner', 'name', 'description', 'created_at']

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)  # Ensure URL is returned

    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ProductSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    seller_id = serializers.IntegerField(source='owner.id', read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=Category.objects.all(),
        source='category'
    )
    category = CategorySerializer(read_only=True)

    images = ProductImageSerializer(many=True, read_only=True)

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'owner', 'seller_id',
            'category', 'category_id',
            'name', 'short_description', 'description',
            'price', 'weight', 'dimensions',
            'main_image', 'images', 'uploaded_images',
            'created_at', 'seller_phone', 'shipping_fee', 'tax_rate'
        ]

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        product = Product.objects.create(**validated_data)

        for img in uploaded_images:
            ProductImage.objects.create(product=product, image=img)

        return product
