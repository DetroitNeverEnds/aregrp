from django.conf import settings
from django.contrib.auth.views import LoginView, LogoutView

class CustomLoginView(LoginView):
    template_name = 'registration/login.html'

    def form_valid(self, form):
        resp = super().form_valid(form)

        remember = bool(self.request.POST.get('remember_me'))
        # Максимальный возраст «запомнить меня»
        max_age = int(getattr(settings, 'REMEMBER_ME_MAX_AGE', settings.SESSION_COOKIE_AGE))

        if remember:
            # живая долго (секунды)
            self.request.session.set_expiry(max_age)
        else:
            # до закрытия браузера
            self.request.session.set_expiry(0)

        return resp

class CustomLogoutView(LogoutView):
    """Кастомный LogoutView с принудительным редиректом на страницу входа"""
    next_page = '/login/'
    
    def dispatch(self, request, *args, **kwargs):
        """Обработка logout с принудительным редиректом на страницу входа"""
        response = super().dispatch(request, *args, **kwargs)
        # Убеждается, что пользователь разлогинен
        if hasattr(request, 'user'):
            request.user = None
        return response
