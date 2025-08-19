# state_data/urls.py

from django.urls import path
from . import views

app_name = 'state_data'

urlpatterns = [
    path('', views.StateDataListView.as_view(), name='state-list'),
    path('<int:pk>/', views.StateDataDetailView.as_view(), name='state-detail'),
    path('maine/', views.MaineDataView.as_view(), name='maine-data'),
    path('veteran-benefits/', views.VeteranBenefitListView.as_view(), name='veteran-benefits'),
]