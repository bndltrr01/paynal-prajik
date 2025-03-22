from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField # type: ignore

# Create your models here.
class CustomUsers(AbstractUser):
    email = models.EmailField(unique=True, max_length=200)
    password = models.CharField(max_length=200)
    is_admin = models.BooleanField(default=False)
    profile_image = CloudinaryField('profile_image', null=True, blank=True)
    
    class Meta:
        db_table = 'users'
