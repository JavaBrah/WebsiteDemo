# costs/tax.py
from decimal import Decimal

# 2025 Maine brackets (example; keep synced with official tables)
ME_BRACKETS_SINGLE = [
    # (upper_limit, rate, base_tax, base_limit)  progressive calc convenience
    (24500, Decimal("0.0580"), Decimal("0"), Decimal("0")),
    (58650, Decimal("0.0675"), Decimal("1421.0"), Decimal("24500")),
    (Decimal("1e12"), Decimal("0.0715"), Decimal("3676.375"), Decimal("58650")),
]
# You can duplicate for MFJ/MFS/HOH as needed; for MVP, reuse SINGLE.

GENERIC_STATE_SALES_RATES = {
    # crude defaults; override later with better data per-state if you want
    "ME": Decimal("0.055"),
    "NH": Decimal("0.000"),
    "MA": Decimal("0.0625"),
    "NC": Decimal("0.0700"),  # example combined approx
    "TX": Decimal("0.0825"),
    "FL": Decimal("0.0700"),
}

NO_INCOME_TAX_STATES = {"FL", "TX", "WA", "NV", "WY", "SD", "TN", "NH", "AK"}

def calc_me_state_tax(income_annual: Decimal, filing_status: str, dependents: int) -> Decimal:
    # Minimal MVP: use SINGLE brackets for all; adjust later per filing status + personal exemptions.
    taxable = income_annual  # refine with standard deductions, exemptions, credits later
    if taxable <= 0:
        return Decimal("0")
    tax = Decimal("0")
    for upper, rate, base_tax, base_lim in ME_BRACKETS_SINGLE:
        if taxable <= upper:
            tax = base_tax + (taxable - base_lim) * rate
            break
    return tax.quantize(Decimal("0.01"))

def calc_generic_state_tax(from_state: str, income_annual: Decimal) -> Decimal:
    if from_state in NO_INCOME_TAX_STATES:
        return Decimal("0.00")
    # MVP placeholder flat-rate approximation (replace with real brackets later)
    FLAT = {
        "MA": Decimal("0.05"),
        "NC": Decimal("0.0475"),
        "ME": None,  # handled separately
    }
    rate = FLAT.get(from_state, Decimal("0.045"))
    return (income_annual * rate).quantize(Decimal("0.01"))

def sales_tax_rate(state: str) -> Decimal:
    return GENERIC_STATE_SALES_RATES.get(state, Decimal("0.06"))