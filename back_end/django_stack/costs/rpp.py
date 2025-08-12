from decimal import Decimal
from .models import RPP

def get_rpp(state: str) -> Decimal:
    rec = RPP.objects.filter(state=state.upper()).first()
    if rec:
        return Decimal(rec.index_all_items)
    # sane fallback so the API still functions
    return Decimal("100.00")