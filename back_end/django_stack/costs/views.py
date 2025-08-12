from django.shortcuts import render
from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .serializers import EstimateInputSerializer, EstimateOutputSerializer
from .rpp import get_rpp
from .tax import calc_me_state_tax, calc_generic_state_tax, sales_tax_rate

class HealthView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({"ok": True})

class EstimateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = EstimateInputSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        income = Decimal(data["income_annual"])
        filing_status = data["filing_status"]
        dependents = data["dependents"]
        from_state = data["from_state"].upper()
        target_state = data["target_state"].upper()
        taxable_spend = Decimal(data["taxable_monthly_spend"])

        rpp_from = get_rpp(from_state)
        rpp_target = get_rpp(target_state)
        rpp_factor = (rpp_target / rpp_from) if rpp_from != 0 else Decimal("1.0")

        categories = []
        total_now = Decimal("0")
        total_target = Decimal("0")

        for e in data["expenses"]:
            cur = Decimal(e["amount_monthly"])
            new = (cur * rpp_factor).quantize(Decimal("0.01"))
            categories.append({
                "category": e["category"],
                "current_amount": cur,
                "new_amount": new,
            })
            total_now += cur
            total_target += new

        # sales tax approximation (same base spend, different rates)
        sales_from = (taxable_spend * sales_tax_rate(from_state)).quantize(Decimal("0.01"))
        sales_me = (taxable_spend * sales_tax_rate("ME")).quantize(Decimal("0.01"))

        # income tax difference (annual → monthly)
        tax_from_annual = calc_generic_state_tax(from_state, income)
        tax_me_annual = calc_me_state_tax(income, filing_status, dependents)
        monthly_tax_delta = ((tax_me_annual - tax_from_annual) / Decimal("12")).quantize(Decimal("0.01"))

        total_now_with_tax = total_now + (tax_from_annual / Decimal("12")) + sales_from
        total_me_with_tax = total_target + (tax_me_annual / Decimal("12")) + sales_me
        delta = (total_me_with_tax - total_now_with_tax).quantize(Decimal("0.01"))

        out = {
            "categories": categories,
            "monthly_tax_delta": monthly_tax_delta,
            "monthly_sales_tax_from": sales_from,
            "monthly_sales_tax_me": sales_me,
            "total_now": total_now_with_tax.quantize(Decimal("0.01")),
            "total_me": total_me_with_tax.quantize(Decimal("0.01")),
            "delta": delta,
        }
        out_s = EstimateOutputSerializer(out)
        return Response(out_s.data, status=status.HTTP_200_OK)