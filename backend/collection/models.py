from django.db import models

class Collection(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    is_featured = models.BooleanField(default=False)
    order_priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-order_priority', 'name']

    def __str__(self):
        return self.name

    @property
    def items_count(self):
        return self.items.count()

class CollectionItem(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name='items')
    coin_id = models.CharField(max_length=100)
    coin_name = models.CharField(max_length=100)
    coin_symbol = models.CharField(max_length=10)
    order_priority = models.IntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['collection', 'coin_id']
        ordering = ['-order_priority', 'coin_name']

    def __str__(self):
        return f"{self.coin_name} in {self.collection.name}"
