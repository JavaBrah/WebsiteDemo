# state_data/serializers.py

from rest_framework import serializers
from .models import StateData, VeteranBenefit

class StateDataSerializer(serializers.ModelSerializer):
    is_maine = serializers.ReadOnlyField()
    has_no_state_income_tax = serializers.ReadOnlyField()
    
    class Meta:
        model = StateData
        fields = [
            'id', 'state_code', 'state_name', 'cost_of_living_index',
            'housing_index', 'utilities_index', 'grocery_index', 'transportation_index',
            'state_income_tax_min', 'state_income_tax_max', 'sales_tax_rate', 
            'property_tax_rate', 'is_maine', 'has_no_state_income_tax',
            'last_updated', 'data_source'
        ]
        read_only_fields = ['id', 'last_updated', 'is_maine', 'has_no_state_income_tax']

class VeteranBenefitSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.state_name', read_only=True)
    state_code = serializers.CharField(source='state.state_code', read_only=True)
    
    class Meta:
        model = VeteranBenefit
        fields = [
            'id', 'state_name', 'state_code',
            'property_tax_exemption', 'property_tax_exemption_amount',
            'military_retirement_exempt', 'disability_compensation_exempt',
            'vehicle_registration_discount', 'hunting_fishing_license_free',
            'homestead_exemption', 'notes', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']