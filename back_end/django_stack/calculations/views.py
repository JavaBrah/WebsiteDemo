# calculations/views.py

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import models  # ADDED: Missing import for models.Avg
from django.shortcuts import get_object_or_404  # ADDED: Missing import
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import CostCalculation, UserProfile, CalculationNote
from state_data.models import StateData
from .serializers import (
    CostCalculationSerializer, CostCalculationSummarySerializer,
    UserProfileSerializer, UserRegistrationSerializer, 
    CalculationNoteSerializer, StateDataSerializer
)

# Authentication Views
class CustomAuthToken(ObtainAuthToken):
    """Custom auth token view that returns user data along with token"""
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': UserProfileSerializer(profile).data
        })

class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create user profile
        profile = UserProfile.objects.create(user=user)
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'profile': UserProfileSerializer(profile).data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def logout_view(request):
    """Logout endpoint that deletes the auth token"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'})
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

# User Profile Views
class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

# State Data Views
class StateDataListView(generics.ListAPIView):
    """List all states with their cost of living data"""
    queryset = StateData.objects.all()
    serializer_class = StateDataSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['state_name', 'state_code']
    ordering_fields = ['state_name', 'cost_of_living_index']
    ordering = ['state_name']

class StateDataDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific state"""
    queryset = StateData.objects.all()
    serializer_class = StateDataSerializer
    permission_classes = [permissions.AllowAny]

# Cost Calculation Views
class CostCalculationListCreateView(generics.ListCreateAPIView):
    """List user's calculations and create new ones"""
    serializer_class = CostCalculationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_favorite', 'origin_state', 'destination_state']
    search_fields = ['calculation_name']
    ordering_fields = ['created_at', 'updated_at', 'total_monthly_savings']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        return CostCalculation.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CostCalculationSummarySerializer
        return CostCalculationSerializer

class CostCalculationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific calculation"""
    serializer_class = CostCalculationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CostCalculation.objects.filter(user=self.request.user)

class CostCalculationDuplicateView(generics.CreateAPIView):
    """Duplicate an existing calculation"""
    serializer_class = CostCalculationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # FIXED: Use proper get_object_or_404 import
        original_calculation = get_object_or_404(
            CostCalculation.objects.filter(user=request.user),
            pk=kwargs['pk']
        )
        
        # Create a copy with modified name
        calculation_data = CostCalculationSerializer(original_calculation).data
        calculation_data['calculation_name'] = f"Copy of {calculation_data['calculation_name']}"
        calculation_data['is_favorite'] = False
        
        # Remove read-only fields
        for field in ['id', 'user', 'created_at', 'updated_at', 'notes']:
            calculation_data.pop(field, None)
        
        serializer = self.get_serializer(data=calculation_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Calculation Notes Views
class CalculationNoteListCreateView(generics.ListCreateAPIView):
    """List and create notes for a calculation"""
    serializer_class = CalculationNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        calculation_id = self.kwargs['calculation_pk']
        return CalculationNote.objects.filter(
            calculation_id=calculation_id,
            calculation__user=self.request.user
        )
    
    def perform_create(self, serializer):
        calculation_id = self.kwargs['calculation_pk']
        # FIXED: Use proper get_object_or_404 import
        calculation = get_object_or_404(
            CostCalculation.objects.filter(user=self.request.user),
            pk=calculation_id
        )
        serializer.save(calculation=calculation)

class CalculationNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific note"""
    serializer_class = CalculationNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        calculation_id = self.kwargs['calculation_pk']
        return CalculationNote.objects.filter(
            calculation_id=calculation_id,
            calculation__user=self.request.user
        )

# Utility Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard_data(request):
    """Get dashboard summary data for the user"""
    user = request.user
    calculations = CostCalculation.objects.filter(user=user)
    
    # Calculate summary statistics
    total_calculations = calculations.count()
    favorite_calculations = calculations.filter(is_favorite=True).count()
    
    # FIXED: Use proper models.Avg import
    avg_monthly_savings = calculations.aggregate(
        models.Avg('total_monthly_savings')
    )['total_monthly_savings__avg'] or 0
    
    # Recent calculations
    recent_calculations = calculations.order_by('-updated_at')[:5]
    
    # Best and worst savings scenarios
    best_savings = calculations.order_by('-total_monthly_savings').first()
    worst_savings = calculations.order_by('total_monthly_savings').first()
    
    return Response({
        'total_calculations': total_calculations,
        'favorite_calculations': favorite_calculations,
        'average_monthly_savings': round(avg_monthly_savings, 2),
        'average_annual_savings': round(avg_monthly_savings * 12, 2),
        'recent_calculations': CostCalculationSummarySerializer(recent_calculations, many=True).data,
        'best_savings_scenario': CostCalculationSummarySerializer(best_savings).data if best_savings else None,
        'worst_savings_scenario': CostCalculationSummarySerializer(worst_savings).data if worst_savings else None,
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_calculation_favorite(request, pk):
    """Toggle the favorite status of a calculation"""
    # FIXED: Use proper get_object_or_404 import
    calculation = get_object_or_404(
        CostCalculation.objects.filter(user=request.user),
        pk=pk
    )
    
    calculation.is_favorite = not calculation.is_favorite
    calculation.save()
    
    return Response({
        'id': calculation.id,
        'is_favorite': calculation.is_favorite,
        'message': f"Calculation {'added to' if calculation.is_favorite else 'removed from'} favorites"
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
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
    
    # Add these to your calculations/views.py

class CostCalculationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific calculation"""
    serializer_class = CostCalculationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CostCalculation.objects.filter(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a calculation with proper response"""
        instance = self.get_object()
        calculation_name = instance.calculation_name
        self.perform_destroy(instance)
        return Response({
            'message': f'Calculation "{calculation_name}" deleted successfully'
        }, status=status.HTTP_200_OK)

class CostCalculationDuplicateView(generics.CreateAPIView):
    """Duplicate an existing calculation"""
    serializer_class = CostCalculationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        original_calculation = get_object_or_404(
            CostCalculation.objects.filter(user=request.user),
            pk=kwargs['pk']
        )
        
        # Create a copy with modified name
        calculation_data = CostCalculationSerializer(original_calculation).data
        calculation_data['calculation_name'] = f"Copy of {calculation_data['calculation_name']}"
        calculation_data['is_favorite'] = False
        
        # Remove read-only fields
        for field in ['id', 'user', 'created_at', 'updated_at', 'notes']:
            calculation_data.pop(field, None)
        
        serializer = self.get_serializer(data=calculation_data)
        serializer.is_valid(raise_exception=True)
        new_calculation = serializer.save()
        
        return Response({
            'message': f'Calculation duplicated successfully',
            'calculation': serializer.data
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_calculation_favorite(request, pk):
    """Toggle the favorite status of a calculation"""
    calculation = get_object_or_404(
        CostCalculation.objects.filter(user=request.user),
        pk=pk
    )
    
    calculation.is_favorite = not calculation.is_favorite
    calculation.save()
    
    return Response({
        'id': calculation.id,
        'is_favorite': calculation.is_favorite,
        'message': f"Calculation {'added to' if calculation.is_favorite else 'removed from'} favorites"
    })