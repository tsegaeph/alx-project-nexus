from rest_framework import viewsets, permissions, decorators, response
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from .permissions import IsSellerOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'owner').prefetch_related('images').all()
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['category']
    ordering_fields = ['price', 'name', 'created_at']
    search_fields = ['name', 'short_description', 'description']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # Custom action: GET /api/products/my/
    @decorators.action(detail=False, methods=['get'], url_path='my', permission_classes=[permissions.IsAuthenticated])
    def my_products(self, request):
        # Start with the queryset filtered by the current seller
        queryset = self.get_queryset().filter(owner=request.user)
        
        # 🔑 FIX: MANUALLY APPLY SEARCH FILTER TO THE CUSTOM ACTION
        # Instantiate the SearchFilter
        search_filter = SearchFilter()
        
        # Apply the search filter using the configured search_fields from the ViewSet
        queryset = search_filter.filter_queryset(request, queryset, self)
        
        # NOTE: If you also want sorting/ordering applied, you would include it here:
        # ordering_filter = OrderingFilter()
        # queryset = ordering_filter.filter_queryset(request, queryset, self)


        if request.query_params.get('dashboard_all', 'false').lower() == 'true':
            # Skip pagination for the dashboard count
            serializer = self.get_serializer(queryset, many=True)
            return response.Response(serializer.data)

        # Standard Pagination Logic (required for product listing page)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.select_related('owner').all() 
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show categories owned by the current user
        return Category.objects.filter(owner=self.request.user).select_related('owner')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # Custom action: GET /api/categories/my/
    @decorators.action(detail=False, methods=['get'], url_path='my', permission_classes=[permissions.IsAuthenticated])
    def my_categories(self, request):
        queryset = self.get_queryset() 
        
        if request.query_params.get('dashboard_all', 'false').lower() == 'true':
            serializer = self.get_serializer(queryset, many=True)
            return response.Response(serializer.data)

        out = []
        for cat in queryset:
            products_qs = Product.objects.filter(category=cat)
            out.append({
                'id': cat.id,
                'name': cat.name,
                'description': cat.description,
                'icon': cat.icon if hasattr(cat, 'icon') else None,
                'product_count': products_qs.count(),
                'products': ProductSerializer(products_qs, many=True).data,
            })
        return response.Response(out)