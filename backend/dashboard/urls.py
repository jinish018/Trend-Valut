from django.urls import path
from . import views

urlpatterns = [
    path('highlights/', views.get_highlights, name='highlights'),
    path('coins/', views.get_all_coins, name='all_coins'),
    path('coins/<str:coin_id>/', views.get_coin_details, name='coin_details'),
    path('coins/<str:coin_id>/history/', views.get_coin_history, name='coin_history'),
    path('global-stats/', views.get_global_stats, name='global_stats'),
    path('search/', views.search_coins, name='search_coins'),
]
