from rest_framework import serializers
from .models import CartItem, Order, OrderItem
from products.serializers import ProductSerializer
from products.models import Product

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        write_only=True,
        source='product'
    )
    price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price']

    def get_price(self, obj):
        return obj.product.price

    def create(self, validated_data):
        customer = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)
        item, created = CartItem.objects.get_or_create(customer=customer, product=product, defaults={'quantity': quantity})
        if not created:
            item.quantity += quantity
            item.save()
        return item

# --- NEW: Serializer for the permanent Order Items ---
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price','delivered']

class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True, read_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    customer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'items',
            'phone', 'address',
            'subtotal', 'shipping', 'tax', 'total',
            'status', 'created_at'
        ]
        read_only_fields = ['customer', 'subtotal', 'shipping', 'tax', 'total', 'status', 'created_at']

class SellerOrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    quantity = serializers.IntegerField()
    delivered = serializers.BooleanField(read_only=True)

    class Meta:
        model = OrderItem 
        fields = ['id', 'product', 'quantity', 'delivered']

class SellerOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'phone', 'address', 'items', 'total', 'status', 'created_at', 'total_items']

    def get_items(self, obj):
        user = self.context['request'].user
        # Filter items in this order that belong to the logged-in seller
        seller_items = [item for item in obj.items.all() if item.product.owner == user]
        return SellerOrderItemSerializer(seller_items, many=True).data

    def get_total_items(self, obj):
        user = self.context['request'].user
        return sum(item.quantity for item in obj.items.all() if item.product.owner == user)