from django.shortcuts import render

# Create your views here.
# state_data/views.py

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import requests
from django.conf import settings
from django.utils import timezone

from .models import StateData, VeteranBenefit
from calculations.serializers import StateDataSerializer, VeteranBenefitSerializer

class StateDataListView(generics.ListAPIView):
    """List all states with their cost of living data"""
    queryset = StateData.objects.all()
    serializer_class = StateDataSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['state_name', 'state_code']
    ordering_fields = ['state_name', 'cost_of_living_index', 'housing_index']
    ordering = ['state_name']
    filterset_fields = ['has_no_state_income_tax']

class StateDataDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific state"""
    queryset = StateData.objects.all()
    serializer_class = StateDataSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add veteran benefits if available
        try:
            veteran_benefits = instance.veteran_benefits
            data['veteran_benefits'] = VeteranBenefitSerializer(veteran_benefits).data
        except VeteranBenefit.DoesNotExist:
            data['veteran_benefits'] = None
        
        return Response(data)

class MaineDataView(generics.RetrieveAPIView):
    """Get Maine-specific data"""
    serializer_class = StateDataSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        try:
            return StateData.objects.get(state_code='ME')
        except StateData.DoesNotExist:
            # Create Maine data if it doesn't exist with default values
            return StateData.objects.create(
                state_code='ME',
                state_name='Maine',
                cost_of_living_index=98.0,  # Slightly below national average
                housing_index=89.0,
                utilities_index=108.0,
                grocery_index=102.0,
                transportation_index=95.0,
                state_income_tax_min=5.8,
                state_income_tax_max=7.15,
                sales_tax_rate=5.5,
                property_tax_rate=1.35,
                data_source='Default values - needs update from BLS API'
            )

class VeteranBenefitListView(generics.ListAPIView):
    """List veteran benefits for all states"""
    queryset = VeteranBenefit.objects.all()
    serializer_class = VeteranBenefitSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = [
        'property_tax_exemption', 
        'military_retirement_exempt',
        'vehicle_registration_discount'
    ]

# API Integration Views
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def update_state_data_from_bls(request):
    """Update state cost of living data from Bureau of Labor Statistics API"""
    
    if not settings.BLS_API_KEY:
        return Response({
            'error': 'BLS API key not configured'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # BLS API endpoint for Consumer Price Index data
    bls_url = 'https://api.bls.gov/publicAPI/v2/timeseries/data/'
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    # This is a simplified example - you'd need to map BLS series IDs to states
    # and cost categories. The actual implementation would be more complex.
    
    updated_states = []
    errors = []
    
    for state in StateData.objects.all():
        try:
            # Example: Update cost of living index from BLS data
            # In reality, you'd need to make multiple API calls for different data series
            
            payload = {
                "seriesid": [f"CUUR0000SA0"],  # National CPI - you'd use state-specific series
                "startyear": "2023",
                "endyear": "2024",
                "registrationkey": settings.BLS_API_KEY
            }
            
            response = requests.post(bls_url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Process BLS data and update state
                # This is simplified - actual implementation would parse the JSON response
                # and update the appropriate fields based on the data series
                
                state.last_updated = timezone.now()
                state.data_source = 'BLS API'
                state.save()
                
                updated_states.append(state.state_name)
            else:
                errors.append(f"{state.state_name}: API error {response.status_code}")
                
        except Exception as e:
            errors.append(f"{state.state_name}: {str(e)}")
    
    return Response({
        'message': f'Updated {len(updated_states)} states',
        'updated_states': updated_states,
        'errors': errors
    })

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def update_tax_data(request):
    """Update state tax data from external tax API"""
    
    # This would integrate with a tax data API
    # For now, we'll just return a placeholder response
    
    return Response({
        'message': 'Tax data update functionality would be implemented here',
        'note': 'This would integrate with tax APIs like TaxJar or similar services'
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def cost_comparison_preview(request):
    """Get a quick preview of cost differences between two states"""
    
    origin_state_code = request.GET.get('origin')
    destination_state_code = request.GET.get('destination', 'ME')
    
    if not origin_state_code:
        return Response({
            'error': 'Origin state code is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        origin_state = StateData.objects.get(state_code=origin_state_code.upper())
        destination_state = StateData.objects.get(state_code=destination_state_code.upper())
        
        # Calculate basic comparison ratios
        housing_change = ((destination_state.housing_index / origin_state.housing_index) - 1) * 100
        utilities_change = ((destination_state.utilities_index / origin_state.utilities_index) - 1) * 100
        groceries_change = ((destination_state.grocery_index / origin_state.grocery_index) - 1) * 100
        transportation_change = ((destination_state.transportation_index / origin_state.transportation_index) - 1) * 100
        overall_change = ((destination_state.cost_of_living_index / origin_state.cost_of_living_index) - 1) * 100
        
        # Tax comparison
        origin_max_tax = origin_state.state_income_tax_max
        destination_max_tax = destination_state.state_income_tax_max
        tax_change = destination_max_tax - origin_max_tax
        
        return Response({
            'origin_state': {
                'name': origin_state.state_name,
                'code': origin_state.state_code
            },
            'destination_state': {
                'name': destination_state.state_name,
                'code': destination_state.state_code
            },
            'cost_changes': {
                'housing': round(housing_change, 1),
                'utilities': round(utilities_change, 1),
                'groceries': round(groceries_change, 1),
                'transportation': round(transportation_change, 1),
                'overall': round(overall_change, 1)
            },
            'tax_comparison': {
                'origin_max_rate': origin_max_tax,
                'destination_max_rate': destination_max_tax,
                'difference': round(tax_change, 2)
            },
            'summary': {
                'generally_cheaper': overall_change < 0,
                'biggest_savings_category': min([
                    ('housing', housing_change),
                    ('utilities', utilities_change),
                    ('groceries', groceries_change),
                    ('transportation', transportation_change)
                ], key=lambda x: x[1])[0] if overall_change < 0 else None,
                'biggest_increase_category': max([
                    ('housing', housing_change),
                    ('utilities', utilities_change),
                    ('groceries', groceries_change),
                    ('transportation', transportation_change)
                ], key=lambda x: x[1])[0] if overall_change > 0 else None
            }
        })
        
    except StateData.DoesNotExist:
        return Response({
            'error': 'One or both states not found'
        }, status=status.HTTP_404_NOT_FOUND)