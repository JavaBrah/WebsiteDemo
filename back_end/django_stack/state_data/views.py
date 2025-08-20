# state_data/views.py - Replace your current views.py with this
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import StateData
from .serializers import StateDataSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def state_list_simple(request):
    """List all states from database"""
    try:
        # Get all states from database
        states = StateData.objects.all().order_by('state_name')
        serializer = StateDataSerializer(states, many=True)
        
        print(f"Found {states.count()} states in database")  # Debug log
        
        if states.count() == 0:
            # If no states in database, return sample data for testing
            sample_states = [
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
                }
            ]
            print("No states in database, returning sample data")
            return Response(sample_states, status=status.HTTP_200_OK)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in state_list_simple: {str(e)}")
        return Response(
            {'error': 'Unable to load states data', 'details': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def states_comparison_data(request):
    """Get comparison data between states"""
    origin_state_id = request.GET.get('origin')
    destination_state_id = request.GET.get('destination', None)
    
    if not origin_state_id:
        return Response({'error': 'Origin state is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        origin_state = StateData.objects.get(pk=origin_state_id)
        
        # Default to Maine if no destination specified
        if destination_state_id:
            destination_state = StateData.objects.get(pk=destination_state_id)
        else:
            destination_state = StateData.objects.get(state_code='ME')
        
        # Calculate ratios
        housing_ratio = destination_state.housing_index / origin_state.housing_index
        utilities_ratio = destination_state.utilities_index / origin_state.utilities_index
        grocery_ratio = destination_state.grocery_index / origin_state.grocery_index
        transportation_ratio = destination_state.transportation_index / origin_state.transportation_index
        overall_col_ratio = destination_state.cost_of_living_index / origin_state.cost_of_living_index
        
        return Response({
            'origin_state': StateDataSerializer(origin_state).data,
            'destination_state': StateDataSerializer(destination_state).data,
            'comparison_ratios': {
                'housing': round(housing_ratio, 3),
                'utilities': round(utilities_ratio, 3),
                'groceries': round(grocery_ratio, 3),
                'transportation': round(transportation_ratio, 3),
                'overall_cost_of_living': round(overall_col_ratio, 3),
            },
            'percentage_changes': {
                'housing': round((housing_ratio - 1) * 100, 1),
                'utilities': round((utilities_ratio - 1) * 100, 1),
                'groceries': round((grocery_ratio - 1) * 100, 1),
                'transportation': round((transportation_ratio - 1) * 100, 1),
                'overall_cost_of_living': round((overall_col_ratio - 1) * 100, 1),
            }
        })
        
    except StateData.DoesNotExist:
        return Response({'error': 'State not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)