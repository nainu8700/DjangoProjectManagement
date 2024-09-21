# Assignment - Project Management System

## Installation

### Create Virtual Environment

```
python3 -m venv venv
```

### Activate the Virtual Environment

```
source venv/bin/activate
```

### Install the requirements

```
pip install -r requirements.txt
```

### If you want to create a superuser

```
python manage.py createsuperuser
```

### Start the server

```
python manage.py runserver
```

### To Make migrations

```
python manage.py makemigrations
python manage.py migrate
```

## Project Functionalities

### Login Page

![Login Page](./static/images/login_ss.png)

Default username - admin , password - admin

### Register a new User

![Register Page](./static/images/register.png)

### CRUD Operations on Projects

![Project Page](./static/images/project.png)

![Edit Project Page](./static/images/editproject.png)

Similarly you can delete the project

### CRUD Operation on Tasks

![Tasks Page](./static/images/tasks.png)

![Edit Tasks Page](./static/images/edittasks.png)

![Delete Tasks Page](./static/images/deletetasks.png)

### tasks error handled

![ Tasks Erro Page](./static/images/taskserror.png)
