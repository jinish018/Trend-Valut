from rest_framework import serializers
from .models import Portfolio, PortfolioItem, Transaction
from decimal import Decimal

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_type', 'quantity', 'price', 'total_amount', 
                 'fee', 'exchange', 'transaction_date', 'notes', 'created_at']

class PortfolioItemSerializer(serializers.ModelSerializer):
    current_value = serializers.ReadOnlyField()
    total_invested = serializers.ReadOnlyField()
    profit_loss = serializers.ReadOnlyField()
    profit_loss_percentage = serializers.ReadOnlyField()
    transactions = TransactionSerializer(many=True, read_only=True)

    class Meta:
        model = PortfolioItem
        fields = ['id', 'coin_id', 'coin_name', 'coin_symbol', 'quantity', 
                 'average_buy_price', 'current_price', 'current_value', 
                 'total_invested', 'profit_loss', 'profit_loss_percentage',
                 'last_updated', 'added_at', 'notes', 'transactions']

class PortfolioSerializer(serializers.ModelSerializer):
    items = PortfolioItemSerializer(many=True, read_only=True)
    total_value = serializers.ReadOnlyField()
    total_invested = serializers.ReadOnlyField()
    profit_loss = serializers.ReadOnlyField()
    profit_loss_percentage = serializers.ReadOnlyField()
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = ['id', 'name', 'items', 'total_value', 'total_invested', 
                 'profit_loss', 'profit_loss_percentage', 'items_count',
                 'created_at', 'updated_at']

    def get_items_count(self, obj):
        return obj.items.count()

class AddPortfolioItemSerializer(serializers.Serializer):
    coin_id = serializers.CharField(max_length=100)
    coin_name = serializers.CharField(max_length=100)
    coin_symbol = serializers.CharField(max_length=10)
    quantity = serializers.DecimalField(max_digits=20, decimal_places=8)
    buy_price = serializers.DecimalField(max_digits=20, decimal_places=8)
    transaction_date = serializers.DateTimeField()
    exchange = serializers.CharField(max_length=100, required=False, allow_blank=True)
    fee = serializers.DecimalField(max_digits=20, decimal_places=8, default=0)
    notes = serializers.CharField(required=False, allow_blank=True)

class UpdatePortfolioItemSerializer(serializers.Serializer):
    quantity = serializers.DecimalField(max_digits=20, decimal_places=8, required=False)
    average_buy_price = serializers.DecimalField(max_digits=20, decimal_places=8, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
