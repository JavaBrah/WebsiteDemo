from django.db import models

# Create your models here.
# calculations/models.py

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
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
        validators=[MinValueValidator(0), MinValueValidator(100)],
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
        default=19  # Maine's ID, you'll need to adjust this
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
        maine_data = self.destination_state
        origin_data = self.origin_state
        
        # Calculate housing costs
        housing_ratio = maine_data.housing_index / origin_data.housing_index
        self.estimated_maine_rent = self.current_rent * housing_ratio
        
        # Calculate utilities
        utilities_ratio = maine_data.utilities_index / origin_data.utilities_index
        self.estimated_maine_utilities = self.current_utilities * utilities_ratio
        
        # Calculate groceries
        grocery_ratio = maine_data.grocery_index / origin_data.grocery_index
        self.estimated_maine_groceries = self.current_groceries * grocery_ratio
        
        # Calculate transportation
        transport_ratio = maine_data.transportation_index / origin_data.transportation_index
        self.estimated_maine_transportation = self.current_transportation * transport_ratio
        
        # Calculate total savings
        current_total = self.total_current_monthly_expenses
        maine_total = (
            self.estimated_maine_rent +
            self.estimated_maine_utilities +
            self.estimated_maine_groceries +
            self.estimated_maine_transportation +
            self.current_healthcare +  # Assume healthcare stays the same
            self.current_entertainment * (maine_data.cost_of_living_index / origin_data.cost_of_living_index)
        )
        
        self.total_monthly_savings = current_total - maine_total
        self.total_annual_savings = self.total_monthly_savings * 12


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