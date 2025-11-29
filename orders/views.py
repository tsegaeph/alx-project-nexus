from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal
from .models import CartItem, Order, OrderItem, SellerIncome
from .serializers import CartItemSerializer, OrderSerializer, SellerOrderSerializer
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from django.utils import timezone
from django.utils.timezone import now
from django.db.models import Sum 

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(customer=self.request.user).select_related('product')

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        CartItem.objects.filter(customer=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # If seller → return orders that include seller’s products
        if hasattr(user, "is_seller") and user.is_seller:
            return Order.objects.filter(
                items__product__owner=user
            ).distinct().prefetch_related('items__product', 'customer')

        # For normal customers → only their orders
        return Order.objects.filter(
            customer=user
        ).prefetch_related('items__product')

    
    def create(self, request, *args, **kwargs):
        user = request.user
        cart_items = CartItem.objects.filter(customer=user)
        if not cart_items.exists():
            return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        phone = request.data.get('phone')
        address = request.data.get('address')
        if not phone or not address:
            return Response({'detail': 'Phone and address are required'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = sum(ci.product.price * ci.quantity for ci in cart_items)
        shipping = 0
        tax = round(subtotal * Decimal('0.05'), 2)
        total = subtotal + shipping + tax

        order = Order.objects.create(
            customer=user,
            phone=phone,
            address=address,
            subtotal=subtotal,
            shipping=shipping,
            tax=tax,
            total=total
        )

        # ✔ Create actual OrderItem rows
        for ci in cart_items:
            OrderItem.objects.create(
                order=order,
                product=ci.product,
                quantity=ci.quantity,
                price=ci.product.price
            )

        # ✔ Clear cart after creating order
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    
    # Seller-facing orders: list orders that contain seller's products
    @action(detail=False, methods=['get'], url_path='my', serializer_class=SellerOrderSerializer)
    def my_orders(self, request):
        user = request.user
        orders = Order.objects.filter(items__product__owner=user).distinct().prefetch_related('items__product', 'customer')
        serializer = self.get_serializer(orders, many=True, context={'request': request})
        return Response(serializer.data)

    # mark delivered (seller)
    @action(detail=True, methods=['patch'], url_path='mark_delivered', serializer_class=SellerOrderSerializer)
    def mark_delivered(self, request, pk=None):
        order = self.get_object()
        user = request.user

        # Seller's items in this order
        seller_items = order.items.filter(product__owner=user)

        if not seller_items.exists():
            return Response({'detail': 'No permission for this order'}, status=status.HTTP_403_FORBIDDEN)

        # Mark only THIS seller's items delivered
        seller_items.update(delivered=True)

        # Compute income for this seller
        seller_amount = sum(ci.product.price * ci.quantity for ci in seller_items)
        
        # ✅ FIX: This SellerIncome creation correctly records income upon delivery
        SellerIncome.objects.get_or_create(
            seller=user,
            order=order,
            defaults={'amount': seller_amount}
        )

        # Update overall order status if all items delivered
        if not order.items.filter(delivered=False).exists():
            order.status = 'delivered'
            order.save()

        return Response(self.get_serializer(order, context={'request': request}).data, status=status.HTTP_200_OK)

    # income aggregation endpoint for seller
    @action(detail=False, methods=['get'], url_path='income')
    def income(self, request):
        user = request.user
        rng = request.query_params.get('range', 'monthly')
        # Setting a sensible default for days/periods to avoid excessive querying
        days = int(request.query_params.get('days', 30)) 

        qs = SellerIncome.objects.filter(seller=user)

        # Grouping for chart data
        if rng == 'daily':
            agg = qs.annotate(period=TruncDay('created_at')).values('period').annotate(total=Sum('amount')).order_by('period')
        elif rng == 'weekly':
            agg = qs.annotate(period=TruncWeek('created_at')).values('period').annotate(total=Sum('amount')).order_by('period')
        else:  # monthly
            agg = qs.annotate(period=TruncMonth('created_at')).values('period').annotate(total=Sum('amount')).order_by('period')
        
        # Limit aggregation results (optional, but good practice)
        agg = agg[:days]

        labels = []
        values = []
        total_income = Decimal('0.00') # This will be the total for the displayed range

        for row in agg:
            period = row['period']
            total = row['total'] or Decimal('0.00')
            labels.append(period.isoformat() if hasattr(period, 'isoformat') else str(period))
            values.append(float(total))
            total_income += total

        # Lifetime total
        lifetime = qs.aggregate(sum_all=Sum('amount'))['sum_all'] or Decimal('0.00')

        today = now().date()
        today_income = qs.filter(created_at__date=today).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        return Response({
            'labels': labels,
            'values': values,
            'today': float(today_income), # Use 'today' key for the daily card
            'lifetime_total': float(lifetime)
        })