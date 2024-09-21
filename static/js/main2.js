const API_URL = "/api";

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type} fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg max-w-md`;

  // Create a text node and append it to ensure proper HTML escaping
  const textNode = document.createTextNode(message);
  notification.appendChild(textNode);

  switch (type) {
    case "success":
      notification.classList.add("bg-green-500", "text-white");
      break;
    case "error":
      notification.classList.add("bg-red-500", "text-white");
      break;
    case "info":
      notification.classList.add("bg-blue-500", "text-white");
      break;
    default:
      notification.classList.add("bg-gray-500", "text-white");
      break;
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000); // Display for 5 seconds
}

async function fetchProjects() {
  try {
    const response = await fetch(`${API_URL}/projects/`);
    if (response.status === 403) {
      showNotification("Please log in to view projects.", "error");
      window.location.href = "/login/";
      return;
    }
    const projects = await response.json();
    const projectList = document.getElementById("project-list");
    projectList.innerHTML = projects
      .map(
        (project) => `
                    <div class="bg-white shadow-md rounded-lg p-6 mb-4 max-w-96">
                        <h2 class="text-xl font-semibold mb-2">${project.title}</h2>
                        <p class="text-gray-500 mb-4 text-sm ">${project.description}</p>
                        <div class="flex justify-between items-center text-sm text-gray-500">
                            <p><i class="fas fa-calendar-alt mr-2"></i> Start: ${project.start_date}</p>
                            <p><i class="fas fa-calendar-check mr-2"></i> End: ${project.end_date}</p>
                        </div>
                        <div class="mt-4 flex justify-end space-x-2">
                            <button class="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded" onclick="editProject(${project.id})">
                                <i class="fas fa-edit mr-2"></i> Edit
                            </button>
                            <button class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded" onclick="deleteProject(${project.id})">
                                <i class="fas fa-trash mr-2"></i> Delete
                            </button>
                        </div>
                    </div>
                `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching projects:", error);
    showNotification("Failed to fetch projects. Please try again.", "error");
  }
}
async function fetchTasks() {
  try {
    const [taskResponse, projectResponse] = await Promise.all([
      fetch(`${API_URL}/tasks/`),
      fetch(`${API_URL}/projects/`),
    ]);

    if (taskResponse.status === 403 || projectResponse.status === 403) {
      showNotification("Please log in to view tasks and projects.", "error");
      window.location.href = "/login/";
      return;
    }

    const tasks = await taskResponse.json();
    const projects = await projectResponse.json();

    // Create a map of project id to project name
    const projectMap = projects.reduce((map, project) => {
      map[project.id] = project.title;
      return map;
    }, {});

    const taskList = document.getElementById("task-list");
    taskList.innerHTML = tasks
      .map(
        (task) => `
          <div class="bg-white shadow-md rounded-lg p-6 mb-4 max-w-96 ">
            <h2 class="text-xl font-semibold mb-2">${task.title}</h2>
            <p class="text-gray-600 mb-4">${task.description}</p>
            <div class="flex justify-between items-center text-sm text-gray-500">
              <p><i class="fas fa-info-circle mr-2"></i> Status: ${
                task.status
              }</p>
              <p><i class="fas fa-calendar mr-2"></i> Due: ${task.due_date}</p>
            </div>
            <div class="flex justify-between items-center text-sm text-gray-500">
              <p><i class="fas fa-project-diagram mr-2"></i> Project Name: ${
                projectMap[task.project] || "Unknown"
              }</p>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
              <button class="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded" onclick="editTask(${
                task.id
              })">
                <i class="fas fa-edit mr-2"></i> Edit
              </button>
              <button class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded" onclick="deleteTask(${
                task.id
              })">
                <i class="fas fa-trash mr-2"></i> Delete
              </button>
            </div>
          </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching tasks and projects:", error);
    showNotification(
      "Failed to fetch tasks and projects. Please try again.",
      "error"
    );
  }
}

async function createProject() {
  const form = document.createElement("form");
  form.innerHTML = `
        <div class="mb-4">
            <label for="title" class="block text-gray-700 font-bold mb-2">Title</label>
            <input type="text" id="title" name="title" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div class="mb-4">
            <label for="description" class="block text-gray-700 font-bold mb-2">Description</label>
            <textarea id="description" name="description" required class="w-full px-3 py-2 border rounded-lg"></textarea>
        </div>
        <div class="mb-4">
            <label for="start_date" class="block text-gray-700 font-bold mb-2">Start Date</label>
            <input type="date" id="start_date" name="start_date" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div class="mb-4">
            <label for="end_date" class="block text-gray-700 font-bold mb-2">End Date</label>
            <input type="date" id="end_date" name="end_date" required class="w-full px-3 py-2 border rounded-lg">
        </div>
    `;

  const result = await showModal("Create Project", form);
  if (result) {
    try {
      const response = await fetch(`${API_URL}/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(result),
      });

      if (response.ok) {
        showNotification("Task created successfully", "success");
        fetchTasks();
      } else if (response.status === 403) {
        showNotification("Please log in to create a task.", "error");
        window.location.href = "/login/";
      } else {
        const errorData = await response.json();
        if (errorData.__all__ && errorData.__all__[0]) {
          showNotification(errorData.__all__[0], "error");
        } else {
          throw new Error(JSON.stringify(errorData));
        }
      }
    } catch (error) {
      console.error("Error creating project:", error);
      showNotification("Failed to create project. Please try again.", "error");
    }
  }
}

async function createTask() {
  const form = document.createElement("form");
  form.innerHTML = `
        <div class="mb-4">
            <label for="title" class="block text-gray-700 font-bold mb-2">Title</label>
            <input type="text" id="title" name="title" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div class="mb-4">
            <label for="description" class="block text-gray-700 font-bold mb-2">Description</label>
            <textarea id="description" name="description" required class="w-full px-3 py-2 border rounded-lg"></textarea>
        </div>
        <div class="mb-4">
            <label for="status" class="block text-gray-700 font-bold mb-2">Status</label>
            <select id="status" name="status" required class="w-full px-3 py-2 border rounded-lg">
              <option value="">Select status</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
            </select>
        </div>
        <div class="mb-4">
            <label for="due_date" class="block text-gray-700 font-bold mb-2">Due Date</label>
            <input type="date" id="due_date" name="due_date" required class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div class="mb-4">
            <label for="project" class="block text-gray-700 font-bold mb-2">Project</label>
            <select id="project" name="project" required class="w-full px-3 py-2 border rounded-lg">
             <option value="">Select Project</option>   
            ${await getProjectOptions()}
            </select>
        </div>
    `;

  const result = await showModal("Create Task", form);
  if (result) {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(result),
      });

      const rawResponse = await response.text();
      console.log("Raw response:", rawResponse);

      if (response.ok) {
        showNotification("Task created successfully", "success");
        fetchTasks();
      } else {
        let errorMessage = "An unexpected error occurred.";
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(rawResponse, "text/html");
        const exceptionValue = htmlDoc.querySelector(".exception_value");

        if (exceptionValue) {
          try {
            const jsonError = JSON.parse(exceptionValue.textContent);
            if (jsonError.__all__ && jsonError.__all__.length > 0) {
              errorMessage = jsonError.__all__[0];
            }
          } catch (e) {
            errorMessage = exceptionValue.textContent.trim();
          }
        }
        errorMessage = errorMessage.replace(/[{}\[\]'":]/g, "").trim();
        errorMessage = errorMessage.replace("__all__", "").trim();
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      showNotification(
        "An unexpected error occurred. Please try again later.",
        "error"
      );
    }
  }
}

async function editProject(id) {
  try {
    const response = await fetch(`${API_URL}/projects/${id}/`);
    const project = await response.json();

    const form = document.createElement("form");
    form.innerHTML = `
            <div class="mb-4">
                <label for="title" class="block text-gray-700 font-bold mb-2">Title</label>
                <input type="text" id="title" name="title" value="${project.title}" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="mb-4">
                <label for="description" class="block text-gray-700 font-bold mb-2">Description</label>
                <textarea id="description" name="description" required class="w-full px-3 py-2 border rounded-lg">${project.description}</textarea>
            </div>
            <div class="mb-4">
                <label for="start_date" class="block text-gray-700 font-bold mb-2">Start Date</label>
                <input type="date" id="start_date" name="start_date" value="${project.start_date}" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="mb-4">
                <label for="end_date" class="block text-gray-700 font-bold mb-2">End Date</label>
                <input type="date" id="end_date" name="end_date" value="${project.end_date}" required class="w-full px-3 py-2 border rounded-lg">
            </div>
        `;

    const result = await showModal("Edit Project", form);
    if (result) {
      const response = await fetch(`${API_URL}/projects/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(result),
      });

      if (response.ok) {
        showNotification("Project updated successfully", "success");
        fetchProjects();
      } else {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
    }
  } catch (error) {
    console.error("Error editing project:", error);
    showNotification("Failed to edit project. Please try again.", "error");
  }
}

async function deleteProject(id) {
  const confirmed = await showConfirmationModal(
    "Are you sure you want to delete this project?"
  );

  if (confirmed) {
    try {
      const response = await fetch(`${API_URL}/projects/${id}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      if (response.ok) {
        showNotification("Project deleted successfully", "success");
        fetchProjects();
      } else {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      showNotification("Failed to delete project. Please try again.", "error");
    }
  }
}

async function editTask(id) {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}/`);
    const task = await response.json();

    const form = document.createElement("form");
    form.innerHTML = `
            <div class="mb-4">
                <label for="title" class="block text-gray-700 font-bold mb-2">Title</label>
                <input type="text" id="title" name="title" value="${
                  task.title
                }" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="mb-4">
                <label for="description" class="block text-gray-700 font-bold mb-2">Description</label>
                <textarea id="description" name="description" required class="w-full px-3 py-2 border rounded-lg">${
                  task.description
                }</textarea>
            </div>
            <div class="mb-4">
                <label for="status" class="block text-gray-700 font-bold mb-2">Status</label>
                <select id="status" name="status" required class="w-full px-3 py-2 border rounded-lg">
                    <option value="NEW" ${
                      task.status === "NEW" ? "selected" : ""
                    }>New</option>
                    <option value="IN_PROGRESS" ${
                      task.status === "IN_PROGRESS" ? "selected" : ""
                    }>In Progress</option>
                    <option value="COMPLETED" ${
                      task.status === "COMPLETED" ? "selected" : ""
                    }>Completed</option>
                </select>
            </div>
            <div class="mb-4">
                <label for="due_date" class="block text-gray-700 font-bold mb-2">Due Date</label>
                <input type="date" id="due_date" name="due_date" value="${
                  task.due_date
                }" required class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="mb-4">
                <label for="project" class="block text-gray-700 font-bold mb-2">Project</label>
                <select id="project<select id="project" name="project" required class="w-full px-3 py-2 border rounded-lg">
                    ${await getProjectOptions(task.project)}
                </select>
            </div>
        `;

    const result = await showModal("Edit Task", form);
    if (result) {
      const response = await fetch(`${API_URL}/tasks/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify(result),
      });

      if (response.ok) {
        showNotification("Task updated successfully", "success");
        fetchTasks();
      } else {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
    }
  } catch (error) {
    console.error("Error editing task:", error);
    showNotification("Failed to edit task. Please try again.", "error");
  }
}

async function deleteTask(id) {
  const confirmed = await showConfirmationModal(
    "Are you sure you want to delete this task?"
  );
  if (confirmed) {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}/`, {
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });

      if (response.ok) {
        showNotification("Task deleted successfully", "success");
        fetchTasks();
      } else {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showNotification("Failed to delete task. Please try again.", "error");
    }
  }
}

async function showModal(title, form) {
  return new Promise((resolve, reject) => {
    const modal = document.createElement("div");
    modal.classList.add(
      "fixed",
      "inset-0",
      "flex",
      "items-center",
      "justify-center",
      "bg-black",
      "bg-opacity-50"
    );

    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg w-1/3 p-4">
          <div class="w-full flex justify-between items-center">
            <div class="px-4">
              <h3 class="text-lg font-semibold">${title}</h3>
            </div>
            <div class="rounded-full w-8 h-8 bg-gray-200 flex justify-center items-center" id="cancel-btn">
              <svg fill="#454545" height="12px" width="12px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490 490" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "></polygon> </g></svg>
            </div>
          </div>
          <div class="p-4">
            ${form.outerHTML}
          </div>
          <div class="px-4 pb-4 text-right">
            <button id="submit-btn" class="bg-[#3498db] text-white py-1 px-3 rounded">Submit</button>
          </div>
        </div>
      `;

    document.body.appendChild(modal);

    const formElement = modal.querySelector("form");
    const submitBtn = document.getElementById("submit-btn");

    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const formData = new FormData(formElement);
      const data = Object.fromEntries(formData);

      const errors = validateForm(data);
      displayErrors(formElement, errors);

      if (Object.keys(errors).length === 0) {
        modal.remove();
        resolve(data);
      }
    });

    document.getElementById("cancel-btn").addEventListener("click", () => {
      modal.remove();
      //   reject("User cancelled");
    });
  });
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function getProjectOptions(selectedProjectId = null) {
  try {
    const response = await fetch(`${API_URL}/projects/`);
    const projects = await response.json();
    return projects
      .map(
        (project) => `
                    <option value="${project.id}" ${
          project.id === selectedProjectId ? "selected" : ""
        }>
                        ${project.title}
                    </option>
                `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching project options:", error);
    showNotification(
      "Failed to fetch project options. Please try again.",
      "error"
    );
    return "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const projectList = document.getElementById("project-list");
  const taskList = document.getElementById("task-list");
  const createProjectButton = document.getElementById("create-project");
  const createTaskButton = document.getElementById("create-task");

  if (projectList) {
    fetchProjects();
    createProjectButton?.addEventListener("click", createProject);
  }

  if (taskList) {
    fetchTasks();
    createTaskButton?.addEventListener("click", createTask);
  }
});

function validateForm(data) {
  const errors = {};

  Object.keys(data).forEach((key) => {
    if (!data[key] || data[key].trim() === "") {
      errors[key] = `${
        key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")
      } is required`;
    }
  });

  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    if (startDate > endDate) {
      errors.end_date = "End date must be after start date";
    }
  }

  if (data.due_date) {
    const dueDate = new Date(data.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      errors.due_date = "Due date cannot be in the past";
    }
  }

  if (
    data.status &&
    !["NEW", "IN_PROGRESS", "COMPLETED"].includes(data.status)
  ) {
    errors.status = "Invalid status";
  }

  return errors;
}

function displayErrors(form, errors) {
  // Remove all existing error messages
  form.querySelectorAll(".error-message").forEach((el) => el.remove());

  // Display new error messages
  Object.keys(errors).forEach((key) => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) {
      const errorElement = document.createElement("div");
      errorElement.className = "error-message text-red-500 text-sm mt-1";
      errorElement.textContent = errors[key];
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
  });
}

async function showConfirmationModal(message) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.classList.add(
      "fixed",
      "inset-0",
      "flex",
      "items-center",
      "justify-center",
      "bg-black",
      "bg-opacity-50",
      "z-50"
    );

    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg w-1/3 p-4">
          <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
          <p class="mb-4">${message}</p>
          <div class="flex justify-end space-x-2">
            <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
            <button id="confirm-btn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
          </div>
        </div>
      `;

    document.body.appendChild(modal);

    const cancelBtn = modal.querySelector("#cancel-btn");
    const confirmBtn = modal.querySelector("#confirm-btn");

    cancelBtn.addEventListener("click", () => {
      modal.remove();
      resolve(false);
    });

    confirmBtn.addEventListener("click", () => {
      modal.remove();
      resolve(true);
    });
  });
}
