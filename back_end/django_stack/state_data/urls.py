# state_data/urls.py
from django.urls import path
from . import views

app_name = 'state_data'

urlpatterns = [
    # List all states
    path('', views.state_list_simple, name='state-list-simple'),
    
    # Compare states  
    path('compare/', views.states_comparison_data, name='states-comparison'),
]