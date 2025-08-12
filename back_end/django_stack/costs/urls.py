from django.urls import path
from .views import EstimateView, HealthView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("estimate/", EstimateView.as_view(), name="estimate"),
]