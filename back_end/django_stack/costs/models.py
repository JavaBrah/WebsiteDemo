
from django.conf import settings
from django.db import models

class Profile(models.Model):
    FILINGS = [
        ("SINGLE", "Single"),
        ("MFJ", "Married Filing Jointly"),
        ("MFS", "Married Filing Separately"),
        ("HOH", "Head of Household"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    filing_status = models.CharField(max_length=10, choices=FILINGS, default="SINGLE")
    dependents = models.PositiveIntegerField(default=0)
    income_annual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    from_state = models.CharField(max_length=2, default="MA")  # example default
    target_state = models.CharField(max_length=2, default="ME")

    def __str__(self):
        return f"{self.user.username} profile"

class ExpenseItem(models.Model):
    CATEGORIES = [
        ("HOUSING", "Housing"),
        ("FOOD", "Food"),
        ("UTILITIES", "Utilities"),
        ("TRANSPORT", "Transport"),
        ("HEALTH", "Health"),
        ("MISC", "Misc"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="expenses")
    category = models.CharField(max_length=20, choices=CATEGORIES)
    amount_monthly = models.DecimalField(max_digits=10, decimal_places=2)
    taxable = models.BooleanField(default=True)  # for sales tax approximation

    def __str__(self):
        return f"{self.user} - {self.category} ${self.amount_monthly}"

class RPP(models.Model):
    """Regional Price Parity index by state, 'All items' (100 = US average)."""
    state = models.CharField(max_length=2, unique=True)
    index_all_items = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.state} {self.index_all_items}"