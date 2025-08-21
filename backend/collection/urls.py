from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_collections, name='collections'),
    path('<int:collection_id>/', views.get_collection_details, name='collection_details'),
    path('featured/', views.get_featured_collections, name='featured_collections'),
    path('create-defaults/', views.create_default_collections, name='create_default_collections'),
]
