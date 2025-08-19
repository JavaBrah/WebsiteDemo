# calculations/urls.py

from django.urls import path
from . import views

app_name = 'calculations'

urlpatterns = [
    # Authentication
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/login/', views.CustomAuthToken.as_view(), name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Calculations
    path('', views.CostCalculationListCreateView.as_view(), name='calculation-list-create'),
    path('<int:pk>/', views.CostCalculationDetailView.as_view(), name='calculation-detail'),
    path('<int:pk>/duplicate/', views.CostCalculationDuplicateView.as_view(), name='calculation-duplicate'),
    path('<int:pk>/toggle-favorite/', views.toggle_calculation_favorite, name='toggle-favorite'),
    
    # Calculation Notes
    path('<int:calculation_pk>/notes/', views.CalculationNoteListCreateView.as_view(), name='calculation-notes'),
    path('<int:calculation_pk>/notes/<int:pk>/', views.CalculationNoteDetailView.as_view(), name='calculation-note-detail'),
    
    # Dashboard & Utilities
    path('dashboard/', views.user_dashboard_data, name='dashboard'),
    path('compare-states/', views.states_comparison_data, name='compare-states'),
]