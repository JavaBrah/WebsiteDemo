# state_data/views.py - Minimal working version
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def state_list_simple(request):
    """Simple hardcoded state list for testing"""
    try:
        # Return hardcoded data to test the endpoint
        states_data = [
            {
                'id': 1,
                'state_code': 'ME',
                'state_name': 'Maine',
                'cost_of_living_index': 98.0,
                'housing_index': 89.0,
                'utilities_index': 108.0,
                'grocery_index': 102.0,
                'transportation_index': 95.0,
                'state_income_tax_min': 5.8,
                'state_income_tax_max': 7.15,
                'sales_tax_rate': 5.5,
                'property_tax_rate': 1.35,
                'is_maine': True,
                'has_no_state_income_tax': False
            },
            {
                'id': 2,
                'state_code': 'TX',
                'state_name': 'Texas',
                'cost_of_living_index': 93.0,
                'housing_index': 88.0,
                'utilities_index': 102.0,
                'grocery_index': 96.0,
                'transportation_index': 94.0,
                'state_income_tax_min': 0.0,
                'state_income_tax_max': 0.0,
                'sales_tax_rate': 6.25,
                'property_tax_rate': 1.81,
                'is_maine': False,
                'has_no_state_income_tax': True
            },
            {
                'id': 3,
                'state_code': 'CA',
                'state_name': 'California',
                'cost_of_living_index': 138.0,
                'housing_index': 173.0,
                'utilities_index': 103.0,
                'grocery_index': 112.0,
                'transportation_index': 131.0,
                'state_income_tax_min': 1.0,
                'state_income_tax_max': 13.3,
                'sales_tax_rate': 7.25,
                'property_tax_rate': 0.75,
                'is_maine': False,
                'has_no_state_income_tax': False
            },
            {
                'id': 4,
                'state_code': 'NY',
                'state_name': 'New York',
                'cost_of_living_index': 139.0,
                'housing_index': 164.0,
                'utilities_index': 118.0,
                'grocery_index': 108.0,
                'transportation_index': 104.0,
                'state_income_tax_min': 4.0,
                'state_income_tax_max': 10.9,
                'sales_tax_rate': 4.0,
                'property_tax_rate': 1.69,
                'is_maine': False,
                'has_no_state_income_tax': False
            },
            {
                'id': 5,
                'state_code': 'FL',
                'state_name': 'Florida',
                'cost_of_living_index': 99.0,
                'housing_index': 102.0,
                'utilities_index': 101.0,
                'grocery_index': 103.0,
                'transportation_index': 101.0,
                'state_income_tax_min': 0.0,
                'state_income_tax_max': 0.0,
                'sales_tax_rate': 6.0,
                'property_tax_rate': 0.97,
                'is_maine': False,
                'has_no_state_income_tax': True
            }
        ]
        
        return Response(states_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Log the error and return a simple error response
        print(f"Error in state_list_simple: {str(e)}")
        return Response(
            {'error': 'Unable to load states data', 'details': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )