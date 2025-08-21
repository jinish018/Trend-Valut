from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_portfolio, name='portfolio'),
    path('add/', views.add_portfolio_item, name='add_portfolio_item'),
    path('item/<int:item_id>/update/', views.update_portfolio_item, name='update_portfolio_item'),
    path('item/<int:item_id>/delete/', views.delete_portfolio_item, name='delete_portfolio_item'),
    path('performance/', views.get_portfolio_performance, name='portfolio_performance'),
]
