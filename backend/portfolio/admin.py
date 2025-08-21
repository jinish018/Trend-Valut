from django.contrib import admin
from .models import Portfolio, PortfolioItem, Transaction

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'created_at', 'total_value')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'user__username', 'name')

@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ('coin_symbol', 'coin_name', 'quantity', 'current_price', 'portfolio')
    list_filter = ('coin_symbol', 'added_at')
    search_fields = ('coin_name', 'coin_symbol', 'portfolio__user__email')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('portfolio_item', 'transaction_type', 'quantity', 'price', 'transaction_date')
    list_filter = ('transaction_type', 'transaction_date', 'exchange')
    search_fields = ('portfolio_item__coin_name', 'exchange')
