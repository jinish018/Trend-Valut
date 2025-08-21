from rest_framework import serializers
from .models import Collection, CollectionItem

class CollectionItemSerializer(serializers.ModelSerializer):
    live_data = serializers.SerializerMethodField()

    class Meta:
        model = CollectionItem
        fields = ['id', 'coin_id', 'coin_name', 'coin_symbol', 'order_priority', 'added_at', 'live_data']

    def get_live_data(self, obj):
        # This will be populated by the view when needed
        return getattr(obj, '_live_data', None)

class CollectionSerializer(serializers.ModelSerializer):
    items = CollectionItemSerializer(many=True, read_only=True)
    items_count = serializers.ReadOnlyField()

    class Meta:
        model = Collection
        fields = ['id', 'name', 'description', 'is_featured', 'items_count', 
                 'created_at', 'updated_at', 'items']

class CollectionListSerializer(serializers.ModelSerializer):
    items_count = serializers.ReadOnlyField()

    class Meta:
        model = Collection
        fields = ['id', 'name', 'description', 'is_featured', 'items_count', 'created_at']
