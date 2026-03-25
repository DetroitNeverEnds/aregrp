from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("site_settings", "0007_alter_mainsettings_org_name"),
    ]

    operations = [
        migrations.RenameField(
            model_name="mainsettings",
            old_name="whatsapp_link",
            new_name="max_link",
        ),
    ]
