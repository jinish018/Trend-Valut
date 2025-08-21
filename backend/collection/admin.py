from django.contrib import admin
from .models import Collection, CollectionItem

class CollectionItemInline(admin.TabularInline):
    model = CollectionItem
    extra = 0
    fields = ('coin_id', 'coin_name', 'coin_symbol', 'order_priority')

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_featured', 'items_count', 'order_priority', 'created_at')
    list_filter = ('is_featured', 'created_at')
    search_fields = ('name', 'description')
    inlines = [CollectionItemInline]

@admin.register(CollectionItem)
class CollectionItemAdmin(admin.ModelAdmin):
    list_display = ('coin_name', 'coin_symbol', 'collection', 'order_priority', 'added_at')
    list_filter = ('collection', 'added_at')
    search_fields = ('coin_name', 'coin_symbol', 'coin_id')
