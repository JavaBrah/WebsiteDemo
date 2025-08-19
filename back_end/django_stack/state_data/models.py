from django.db import models

# Create your models here.
# state_data/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class StateData(models.Model):
    """Model to store state-specific cost of living and tax data"""
    
    STATE_CHOICES = [
        ('AL', 'Alabama'), ('AK', 'Alaska'), ('AZ', 'Arizona'), ('AR', 'Arkansas'),
        ('CA', 'California'), ('CO', 'Colorado'), ('CT', 'Connecticut'), ('DE', 'Delaware'),
        ('FL', 'Florida'), ('GA', 'Georgia'), ('HI', 'Hawaii'), ('ID', 'Idaho'),
        ('IL', 'Illinois'), ('IN', 'Indiana'), ('IA', 'Iowa'), ('KS', 'Kansas'),
        ('KY', 'Kentucky'), ('LA', 'Louisiana'), ('ME', 'Maine'), ('MD', 'Maryland'),
        ('MA', 'Massachusetts'), ('MI', 'Michigan'), ('MN', 'Minnesota'), ('MS', 'Mississippi'),
        ('MO', 'Missouri'), ('MT', 'Montana'), ('NE', 'Nebraska'), ('NV', 'Nevada'),
        ('NH', 'New Hampshire'), ('NJ', 'New Jersey'), ('NM', 'New Mexico'), ('NY', 'New York'),
        ('NC', 'North Carolina'), ('ND', 'North Dakota'), ('OH', 'Ohio'), ('OK', 'Oklahoma'),
        ('OR', 'Oregon'), ('PA', 'Pennsylvania'), ('RI', 'Rhode Island'), ('SC', 'South Carolina'),
        ('SD', 'South Dakota'), ('TN', 'Tennessee'), ('TX', 'Texas'), ('UT', 'Utah'),
        ('VT', 'Vermont'), ('VA', 'Virginia'), ('WA', 'Washington'), ('WV', 'West Virginia'),
        ('WI', 'Wisconsin'), ('WY', 'Wyoming'),
    ]
    
    state_code = models.CharField(max_length=2, choices=STATE_CHOICES, unique=True)
    state_name = models.CharField(max_length=50)
    
    # Cost of Living Index (100 = national average)
    cost_of_living_index = models.FloatField(
        validators=[MinValueValidator(50), MaxValueValidator(200)],
        help_text="100 = national average"
    )
    
    # Housing costs as percentage of national average
    housing_index = models.FloatField(
        validators=[MinValueValidator(30), MaxValueValidator(300)],
        help_text="Housing cost index relative to national average"
    )
    
    # Utilities index
    utilities_index = models.FloatField(
        validators=[MinValueValidator(50), MaxValueValidator(200)],
        help_text="Utilities cost index relative to national average"
    )
    
    # Grocery index
    grocery_index = models.FloatField(
        validators=[MinValueValidator(70), MaxValueValidator(150)],
        help_text="Grocery cost index relative to national average"
    )
    
    # Transportation index
    transportation_index = models.FloatField(
        validators=[MinValueValidator(70), MaxValueValidator(150)],
        help_text="Transportation cost index relative to national average"
    )
    
    # Tax rates
    state_income_tax_min = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        help_text="Minimum state income tax rate as percentage"
    )
    state_income_tax_max = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        help_text="Maximum state income tax rate as percentage"
    )
    sales_tax_rate = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(12)],
        help_text="State sales tax rate as percentage"
    )
    property_tax_rate = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(3)],
        help_text="Effective property tax rate as percentage"
    )
    
    # Metadata
    last_updated = models.DateTimeField(auto_now=True)
    data_source = models.CharField(max_length=200, blank=True)
    
    class Meta:
        verbose_name = "State Data"
        verbose_name_plural = "State Data"
        ordering = ['state_name']
    
    def __str__(self):
        return f"{self.state_name} ({self.state_code})"
    
    @property
    def is_maine(self):
        return self.state_code == 'ME'
    
    @property
    def has_no_state_income_tax(self):
        return self.state_income_tax_max == 0


class VeteranBenefit(models.Model):
    """Model to store veteran-specific benefits by state"""
    
    state = models.OneToOneField(StateData, on_delete=models.CASCADE, related_name='veteran_benefits')
    
    # Property tax exemptions
    property_tax_exemption = models.BooleanField(default=False)
    property_tax_exemption_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Maximum property tax exemption amount"
    )
    
    # Income tax benefits
    military_retirement_exempt = models.BooleanField(
        default=False,
        help_text="Military retirement income exempt from state income tax"
    )
    disability_compensation_exempt = models.BooleanField(
        default=True,
        help_text="VA disability compensation exempt from state income tax"
    )
    
    # Other benefits
    vehicle_registration_discount = models.BooleanField(default=False)
    hunting_fishing_license_free = models.BooleanField(default=False)
    
    # Maine-specific veteran benefits
    homestead_exemption = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Homestead property tax exemption amount"
    )
    
    notes = models.TextField(blank=True, help_text="Additional notes about veteran benefits")
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Veteran Benefit"
        verbose_name_plural = "Veteran Benefits"
    
    def __str__(self):
        return f"Veteran Benefits - {self.state.state_name}"