from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

class Portfolio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio')
    name = models.CharField(max_length=100, default='My Portfolio')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Portfolio"

    @property
    def total_value(self):
        """Calculate total portfolio value in USD"""
        return sum(item.current_value for item in self.items.all())

    @property
    def total_invested(self):
        """Calculate total amount invested"""
        return sum(item.total_invested for item in self.items.all())

    @property
    def profit_loss(self):
        """Calculate total profit/loss"""
        return self.total_value - self.total_invested

    @property
    def profit_loss_percentage(self):
        """Calculate profit/loss percentage"""
        if self.total_invested > 0:
            return ((self.total_value - self.total_invested) / self.total_invested) * 100
        return 0

class PortfolioItem(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='items')
    coin_id = models.CharField(max_length=100)
    coin_name = models.CharField(max_length=100)
    coin_symbol = models.CharField(max_length=10)
    quantity = models.DecimalField(max_digits=20, decimal_places=8)
    average_buy_price = models.DecimalField(max_digits=20, decimal_places=8)
    current_price = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    added_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ['portfolio', 'coin_id']

    def __str__(self):
        return f"{self.quantity} {self.coin_symbol} in {self.portfolio.name}"

    @property
    def current_value(self):
        """Current value of holdings"""
        return self.quantity * self.current_price

    @property
    def total_invested(self):
        """Total amount invested"""
        return self.quantity * self.average_buy_price

    @property
    def profit_loss(self):
        """Profit/loss for this item"""
        return self.current_value - self.total_invested

    @property
    def profit_loss_percentage(self):
        """Profit/loss percentage for this item"""
        if self.total_invested > 0:
            return ((self.current_value - self.total_invested) / self.total_invested) * 100
        return 0

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('buy', 'Buy'),
        ('sell', 'Sell'),
    ]
    
    portfolio_item = models.ForeignKey(PortfolioItem, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=4, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=20, decimal_places=8)
    price = models.DecimalField(max_digits=20, decimal_places=8)
    total_amount = models.DecimalField(max_digits=20, decimal_places=2)
    fee = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    exchange = models.CharField(max_length=100, blank=True, null=True)
    transaction_date = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-transaction_date']

    def __str__(self):
        return f"{self.transaction_type.upper()} {self.quantity} {self.portfolio_item.coin_symbol}"

    def save(self, *args, **kwargs):
        # Calculate total amount if not provided
        if not self.total_amount:
            self.total_amount = self.quantity * self.price
        super().save(*args, **kwargs)
