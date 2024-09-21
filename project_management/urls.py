# project_management/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from projects.views import ProjectViewSet, TaskViewSet
from django.views.generic import TemplateView
from projects.auth_views import RegisterView, LoginView, LogoutView
from django.contrib.auth.views import LoginView as DjangoLoginView
from django.contrib.auth.views import LogoutView as DjangoLogoutView
from projects.views import register

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('', TemplateView.as_view(template_name='project_list.html'), name='project_list'),
    path('tasks/', TemplateView.as_view(template_name='task_list.html'), name='task_list'),
    
    # API authentication endpoints
    path('api/login/', LoginView.as_view(), name='api_login'),
    path('api/logout/', LogoutView.as_view(), name='api_logout'),
    path('api/register/', RegisterView.as_view(), name='api_register'),
    
    # Template-based authentication views
    path('login/', DjangoLoginView.as_view(template_name='login.html', redirect_authenticated_user=True), name='login'),
    path('logout/', DjangoLogoutView.as_view(), name='logout'),
    path('register/', register, name='register'),
]