from django import forms
from django.core.exceptions import ValidationError
from django.core.validators import validate_email, RegexValidator, MinLengthValidator, MaxLengthValidator

VALID_EMAIL_PROVIDERS = [
    "gmail.com",
    "yahoo.com",
    "yahoo.com.ph",
    "outlook.com",
    "hotmail.com",
    "aol.com",
    "icloud.com",
    "gov.ph",
    "dfa.gov.ph",
    "dip.gov.ph",
    "deped.gov.ph",
    "neda.gov.ph",
    "doh.gov.ph",
    "dti.gov.ph",
    "dswd.gov.ph",
    "dbm.gov.ph",
    "pcso.gov.ph",
    "pnp.gov.ph",
    "bsp.gov.ph",
    "prc.gov.ph",
    "psa.gov.ph",
    "dpwh.gov.ph",
    "lto.gov.ph",
    "boi.gov.ph",
    "hotmail.co.uk",
    "hotmail.fr",
    "msn.com",
    "yahoo.fr",
    "wanadoo.fr",
    "orange.fr",
    "comcast.net",
    "yahoo.co.uk",
    "yahoo.com.br",
    "yahoo.com.in",
    "live.com",
    "rediffmail.com",
    "free.fr",
    "gmx.de",
    "web.de",
    "yandex.ru",
    "ymail.com",
    "libero.it",
    "uol.com.br",
    "bol.com.br",
    "mail.ru",
    "cox.net",
    "hotmail.it",
    "sbcglobal.net",
    "sfr.fr",
    "live.fr",
    "verizon.net",
    "live.co.uk",
    "googlemail.com",
    "yahoo.es",
    "ig.com.br",
    "live.nl",
    "bigpond.com",
    "terra.com.br",
    "yahoo.it",
    "neuf.fr",
    "yahoo.de",
    "alice.it",
    "rocketmail.com",
    "att.net",
    "laposte.net",
    "facebook.com",
    "bellsouth.net",
    "yahoo.in",
    "hotmail.es",
    "charter.net",
    "yahoo.ca",
    "yahoo.com.au",
    "rambler.ru",
    "hotmail.de",
    "tiscali.it",
    "shaw.ca",
    "yahoo.co.jp",
    "sky.com",
    "earthlink.net",
    "optonline.net",
    "freenet.de",
    "t-online.de",
    "aliceadsl.fr",
    "virgilio.it",
    "home.nl",
    "qq.com",
    "telenet.be",
    "me.com",
    "yahoo.com.ar",
    "tiscali.co.uk",
    "yahoo.com.mx",
    "voila.fr",
    "gmx.net",
    "mail.com",
    "planet.nl",
    "tin.it",
    "live.it",
    "ntlworld.com",
    "arcor.de",
    "yahoo.co.id",
    "frontiernet.net",
    "hetnet.nl",
    "live.com.au",
    "yahoo.com.sg",
    "zonnet.nl",
    "club-internet.fr",
    "juno.com",
    "optusnet.com.au",
    "blueyonder.co.uk",
    "bluewin.ch",
    "skynet.be",
    "sympatico.ca",
    "windstream.net",
    "mac.com",
    "centurytel.net",
    "chello.nl",
    "live.ca",
    "aim.com",
    "bigpond.net.au",
    "up.edu.ph",
    "addu.edu.ph",
    "ateneo.edu.ph",
    "dlsu.edu.ph",
    "ust.edu.ph",
    "lu.edu.ph",
]

def validate_email_domain(domain):
    # Allow any valid email domain
    try:
        validate_email(f"test@{domain}")
    except ValidationError:
        raise ValidationError(
            f"Invalid email domain. {domain} is not a valid email provider.",
            code="invalid_domain"
        )

def validate_strict_email(email):
    # This will validates email format and local part length
    email = email.strip()
    if not email:
        raise ValidationError("Email is required.", code="required")
    
    if len(email.split('@')[0]) > 64:
        raise ValidationError(
            "The local part of the email address cannot exceed 64 characters.",
            code="local_part_length"
        )
    
    try:
        validate_email(email)
    except ValidationError:
        raise ValidationError("Invalid email format.", code="invalid_format")
    
    domain = email.split('@')[1]
    validate_email_domain(domain)

def validate_password_django(password, confirm):
    # Validates password and its confirmation
    
    if password != confirm:
        raise ValidationError(
            "Passwords do not match.",
            code="password_mismatch"
        )
    
    # Minimum length of 6 characters
    if len(password) < 6:
        raise ValidationError(
            "Password must be at least 6 characters long.",
            code="password_too_short"
        )
    
    # No spaces allowed
    if ' ' in password:
        raise ValidationError(
            "Password cannot contain spaces.",
            code="password_contains_spaces"
        )

class RegistrationForm(forms.Form):
    email = forms.CharField(validators=[validate_strict_email])
    password = forms.CharField()
    confirm_password = forms.CharField()
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        
        if password and confirm_password:
            try:
                validate_password_django(password, confirm_password)
            except ValidationError as e:
                self.errors['password'] = self.error_class(e.messages)
        
        return cleaned_data