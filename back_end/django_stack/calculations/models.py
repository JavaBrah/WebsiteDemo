# calculations/models.py - Fixed version with proper Decimal handling

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal, ROUND_HALF_UP
from state_data.models import StateData

class UserProfile(models.Model):
    """Extended user profile for veteran-specific information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal information
    is_veteran = models.BooleanField(default=True)
    service_branch = models.CharField(
        max_length=20,
        choices=[
            ('army', 'Army'),
            ('navy', 'Navy'),
            ('air_force', 'Air Force'),
            ('marines', 'Marines'),
            ('coast_guard', 'Coast Guard'),
            ('space_force', 'Space Force'),
        ],
        blank=True
    )
    
    # Current location
    current_state = models.ForeignKey(
        StateData, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='current_residents'
    )
    
    # Benefits information
    receives_disability_compensation = models.BooleanField(default=False)
    disability_rating = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="VA disability rating percentage"
    )
    receives_military_retirement = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
    
    def __str__(self):
        return f"{self.user.username} Profile"


class CostCalculation(models.Model):
    """Model to store user's cost of living calculations"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calculations')
    calculation_name = models.CharField(
        max_length=100, 
        help_text="Name for this calculation scenario"
    )
    
    # States being compared
    origin_state = models.ForeignKey(
        StateData, 
        on_delete=models.CASCADE, 
        related_name='origin_calculations'
    )
    destination_state = models.ForeignKey(
        StateData, 
        on_delete=models.CASCADE, 
        related_name='destination_calculations',
        null=True,
        blank=True
    )
    
    # Current expenses (monthly amounts)
    current_rent = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Current monthly rent/mortgage payment"
    )
    current_utilities = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Current monthly utilities cost"
    )
    current_groceries = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Current monthly grocery expenses"
    )
    current_transportation = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Current monthly transportation costs"
    )
    current_healthcare = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Current monthly healthcare expenses"
    )
    current_entertainment = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Current monthly entertainment/dining expenses"
    )
    
    # Income information
    gross_annual_income = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Gross annual income"
    )
    military_retirement_income = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Annual military retirement income"
    )
    disability_compensation_income = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0,
        help_text="Annual VA disability compensation"
    )
    
    # Calculated results (stored for performance)
    estimated_maine_rent = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    estimated_maine_utilities = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    estimated_maine_groceries = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    estimated_maine_transportation = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    
    # Tax calculations
    origin_state_tax = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    maine_state_tax = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    
    # Summary
    total_monthly_savings = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Estimated monthly savings (negative means increase in costs)"
    )
    total_annual_savings = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Estimated annual savings"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_favorite = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Cost Calculation"
        verbose_name_plural = "Cost Calculations"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.calculation_name}"
    
    @property
    def total_current_monthly_expenses(self):
        """Calculate total current monthly expenses"""
        return (
            self.current_rent +
            self.current_utilities +
            self.current_groceries +
            self.current_transportation +
            self.current_healthcare +
            self.current_entertainment
        )
    
    def calculate_maine_estimates(self):
        """Calculate estimated Maine costs based on cost of living indices"""
        try:
            # Get Maine state data - set as destination if not already set
            if not self.destination_state:
                maine_state, created = StateData.objects.get_or_create(
                    state_code='ME',
                    defaults={
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
                        'data_source': 'Default values'
                    }
                )
                self.destination_state = maine_state
            
            maine_data = self.destination_state
            origin_data = self.origin_state
            
            # Convert float indices to Decimal for proper calculation
            # Calculate housing costs
            housing_ratio = Decimal(str(maine_data.housing_index)) / Decimal(str(origin_data.housing_index))
            self.estimated_maine_rent = (self.current_rent * housing_ratio).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
            
            # Calculate utilities
            utilities_ratio = Decimal(str(maine_data.utilities_index)) / Decimal(str(origin_data.utilities_index))
            self.estimated_maine_utilities = (self.current_utilities * utilities_ratio).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
            
            # Calculate groceries
            grocery_ratio = Decimal(str(maine_data.grocery_index)) / Decimal(str(origin_data.grocery_index))
            self.estimated_maine_groceries = (self.current_groceries * grocery_ratio).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
            
            # Calculate transportation
            transport_ratio = Decimal(str(maine_data.transportation_index)) / Decimal(str(origin_data.transportation_index))
            self.estimated_maine_transportation = (self.current_transportation * transport_ratio).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
            
            # Calculate total savings
            current_total = self.total_current_monthly_expenses
            
            # Calculate Maine total with proper Decimal handling
            overall_ratio = Decimal(str(maine_data.cost_of_living_index)) / Decimal(str(origin_data.cost_of_living_index))
            
            maine_total = (
                self.estimated_maine_rent +
                self.estimated_maine_utilities +
                self.estimated_maine_groceries +
                self.estimated_maine_transportation +
                self.current_healthcare +  # Assume healthcare stays the same
                (self.current_entertainment * overall_ratio).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            )
            
            self.total_monthly_savings = (current_total - maine_total).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
            self.total_annual_savings = (self.total_monthly_savings * 12).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
            
        except Exception as e:
            # Log the error and set default values
            print(f"Error in calculate_maine_estimates: {str(e)}")
            self.estimated_maine_rent = self.current_rent
            self.estimated_maine_utilities = self.current_utilities
            self.estimated_maine_groceries = self.current_groceries
            self.estimated_maine_transportation = self.current_transportation
            self.total_monthly_savings = Decimal('0.00')
            self.total_annual_savings = Decimal('0.00')


class CalculationNote(models.Model):
    """Model for user notes on calculations"""
    
    calculation = models.ForeignKey(
        CostCalculation, 
        on_delete=models.CASCADE, 
        related_name='notes'
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Calculation Note"
        verbose_name_plural = "Calculation Notes"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note for {self.calculation.calculation_name}"