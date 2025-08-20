# state_data/urls.py - temporary minimal version

from django.urls import path
from . import views

app_name = 'state_data'

urlpatterns = [
    # Temporary simple endpoint
    path('', views.state_list_simple, name='state-list-simple'),
    
    # Comment out the complex views for now
    # path('', views.StateDataListView.as_view(), name='state-list'),
    # path('<int:pk>/', views.StateDataDetailView.as_view(), name='state-detail'),
    # path('maine/', views.MaineDataView.as_view(), name='maine-data'),
    # path('veteran-benefits/', views.VeteranBenefitListView.as_view(), name='veteran-benefits'),
]