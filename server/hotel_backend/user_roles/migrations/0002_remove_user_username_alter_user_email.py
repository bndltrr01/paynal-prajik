from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_roles', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='username',
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=300, unique=True),
        ),
    ]
