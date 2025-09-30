from django.contrib import admin
from .models import Employee, PersonalInfo, ContactInfo, EmploymentInfo, Document

admin.site.register(Employee)
admin.site.register(PersonalInfo)
admin.site.register(ContactInfo)
admin.site.register(EmploymentInfo)
admin.site.register(Document)
