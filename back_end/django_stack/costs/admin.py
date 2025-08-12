from django.contrib import admin

# Register your models here.
from .models import RPP
@admin.register(RPP)
class RPPAdmin(admin.ModelAdmin):
    list_display = ("state", "index_all_items")
    search_fields = ("state",)