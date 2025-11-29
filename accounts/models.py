from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Roles
    is_seller = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=True)
    full_name = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["username"]),
            models.Index(fields=["email"]),
            models.Index(fields=["is_seller"]),
            models.Index(fields=["is_customer"]),
        ]
