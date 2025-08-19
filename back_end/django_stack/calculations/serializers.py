# calculations/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CostCalculation, UserProfile, CalculationNote
from state_data.models import StateData, VeteranBenefit

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class StateDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StateData
        fields = [
            'id', 'state_code', 'state_name', 'cost_of_living_index',
            'housing_index', 'utilities_index', 'grocery_index', 'transportation_index',
            'state_income_tax_min', 'state_income_tax_max', 'sales_tax_rate', 
            'property_tax_rate', 'is_maine', 'has_no_state_income_tax'
        ]

class VeteranBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = VeteranBenefit
        fields = [
            'property_tax_exemption', 'property_tax_exemption_amount',
            'military_retirement_exempt', 'disability_compensation_exempt',
            'vehicle_registration_discount', 'hunting_fishing_license_free',
            'homestead_exemption', 'notes'
        ]

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    current_state = StateDataSerializer(read_only=True)
    current_state_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'is_veteran', 'service_branch', 'current_state', 'current_state_id',
            'receives_disability_compensation', 'disability_rating', 
            'receives_military_retirement', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class CalculationNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculationNote
        fields = ['id', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']

class CostCalculationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    origin_state = StateDataSerializer(read_only=True)
    destination_state = StateDataSerializer(read_only=True)
    origin_state_id = serializers.IntegerField(write_only=True)
    destination_state_id = serializers.IntegerField(write_only=True, required=False)
    notes = CalculationNoteSerializer(many=True, read_only=True)
    total_current_monthly_expenses = serializers.ReadOnlyField()
    
    class Meta:
        model = CostCalculation
        fields = [
            'id', 'calculation_name', 'user', 'origin_state', 'destination_state',
            'origin_state_id', 'destination_state_id',
            
            # Current expenses
            'current_rent', 'current_utilities', 'current_groceries',
            'current_transportation', 'current_healthcare', 'current_entertainment',
            'total_current_monthly_expenses',
            
            # Income
            'gross_annual_income', 'military_retirement_income', 'disability_compensation_income',
            
            # Calculated results
            'estimated_maine_rent', 'estimated_maine_utilities', 'estimated_maine_groceries',
            'estimated_maine_transportation', 'origin_state_tax', 'maine_state_tax',
            'total_monthly_savings', 'total_annual_savings',
            
            # Metadata
            'is_favorite', 'created_at', 'updated_at', 'notes'
        ]
        read_only_fields = [
            'id', 'user', 'estimated_maine_rent', 'estimated_maine_utilities',
            'estimated_maine_groceries', 'estimated_maine_transportation',
            'origin_state_tax', 'maine_state_tax', 'total_monthly_savings',
            'total_annual_savings', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        # Set destination to Maine by default
        if 'destination_state_id' not in validated_data:
            maine_state = StateData.objects.get(state_code='ME')
            validated_data['destination_state_id'] = maine_state.id
        
        validated_data['user'] = self.context['request'].user
        calculation = super().create(validated_data)
        
        # Calculate Maine estimates
        calculation.calculate_maine_estimates()
        calculation.save()
        
        return calculation
    
    def update(self, instance, validated_data):
        calculation = super().update(instance, validated_data)
        
        # Recalculate Maine estimates
        calculation.calculate_maine_estimates()
        calculation.save()
        
        return calculation

class CostCalculationSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for calculation lists"""
    origin_state_name = serializers.CharField(source='origin_state.state_name', read_only=True)
    origin_state_code = serializers.CharField(source='origin_state.state_code', read_only=True)
    
    class Meta:
        model = CostCalculation
        fields = [
            'id', 'calculation_name', 'origin_state_name', 'origin_state_code',
            'total_monthly_savings', 'total_annual_savings', 'is_favorite',
            'created_at', 'updated_at'
        ]