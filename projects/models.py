# projects/models.py

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    assigned_users = models.ManyToManyField(User, related_name='assigned_projects')

    def __str__(self):
        return self.title

    def calculate_progress(self):
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0
        completed_tasks = self.tasks.filter(status='COMPLETED').count()
        return (completed_tasks / total_tasks) * 100

class Task(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    due_date = models.DateField()
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='assigned_tasks', null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')

    def __str__(self):
        return self.title

    def clean(self):
        if self.due_date:
            if self.due_date < self.project.start_date:
                raise ValidationError("Task due date cannot be earlier than the project start date.")
            if self.due_date > self.project.end_date:
                raise ValidationError("Task due date cannot be later than the project end date.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)