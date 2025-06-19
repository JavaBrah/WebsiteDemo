from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return HttpResponse("Hey there")

# Create your views here.
