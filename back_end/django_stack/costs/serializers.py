from rest_framework import serializers
from .models import ExpenseItem, Profile

class ExpenseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseItem
        fields = ["id", "category", "amount_monthly", "taxable"]

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["filing_status", "dependents", "income_annual", "from_state", "target_state"]

class EstimateInputSerializer(serializers.Serializer):
    income_annual = serializers.DecimalField(max_digits=12, decimal_places=2)
    filing_status = serializers.ChoiceField(choices=[c[0] for c in Profile.FILINGS])
    dependents = serializers.IntegerField(min_value=0)
    from_state = serializers.CharField(max_length=2)
    target_state = serializers.CharField(max_length=2, default="ME")
    taxable_monthly_spend = serializers.DecimalField(max_digits=10, decimal_places=2)
    expenses = ExpenseItemSerializer(many=True)

class CategoryEstimateSerializer(serializers.Serializer):
    category = serializers.CharField()
    current_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    new_amount = serializers.DecimalField(max_digits=10, decimal_places=2)

class EstimateOutputSerializer(serializers.Serializer):
    categories = CategoryEstimateSerializer(many=True)
    monthly_tax_delta = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_sales_tax_from = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_sales_tax_me = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_now = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_me = serializers.DecimalField(max_digits=12, decimal_places=2)
    delta = serializers.DecimalField(max_digits=12, decimal_places=2)