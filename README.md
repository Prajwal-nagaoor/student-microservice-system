# Student Management Microservices System

## About the Project

The Student Management Microservices System is a web application designed to make student record management easier. It provides a single dashboard where users can manage student details, departments, and courses.

I built this project using a microservices architecture, where different services handle different responsibilities. The frontend provides a simple and user-friendly interface, while the backend manages the application logic and data.

The main goal of this project is to understand how multiple backend services can work together through an API Gateway.

## Features

- **User Authentication:** Register an account and log in securely.
- **Dashboard:** View the total number of students, departments, and courses.
- **Student Management:** Add, view, update, search, and delete student records.
- **Department Management:** Add and view academic departments.
- **Course Management:** Add, view, and delete courses.
- **API Integration:** Connect the frontend with backend services through an API Gateway.
- **Responsive Design:** Use the application on desktop and mobile screens.

## Technologies Used

### Backend
- Python
- FastAPI
- REST APIs
- Microservices architecture

### Frontend
- React
- Vite
- JavaScript
- HTML and CSS
- Lucide React icons

### Tools
- Visual Studio Code
- Git and GitHub
- Postman
- Swagger UI

## Project Structure

The project is organized into separate services so that each part can be developed and maintained independently.

```text
student_microservice_system/
│
├── auth_service/
│   └── Authentication-related code
│
├── student_service/
│   └── Student management APIs
│
├── course_service/
│   └── Course and department APIs
│
├── api_getway/
│   └── API Gateway
│
└── student-microservice-system/
    └── frontend/
        ├── src/
        │   ├── main.jsx
        │   └── styles.css
        ├── index.html
        ├── package.json
        └── vite.config.js
```

*Note: The folder names above represent the intended organization. Your actual folder names may differ slightly.*

## How to Run the Project

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project folder:

```bash
cd student_microservice_system
```

### 2. Set up the Python environment

Create a virtual environment:

```bash
python -m venv myvenv
```

Activate it on Windows:

```bash
myvenv\Scripts\activate
```

Install the backend dependencies using the requirements file available for each service. For example:

```bash
pip install -r requirements.txt
```

Run this command from the directory containing the relevant `requirements.txt` file.

### 3. Start the backend services

Start each service in a separate terminal, using its correct project directory and FastAPI application module.

The configured service ports are:

| Service | Port |
|---|---:|
| Authentication Service | 8000 |
| Student Service | 8001 |
| Course Service | 8002 |
| API Gateway | 8003 |

Start the API Gateway after the services it depends on are running.

For FastAPI services, the command may look like this:

```bash
uvicorn main:app --reload --port 8000
```

Use the correct module name and port for each service based on your existing backend files.

### 4. Start the frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd student-microservice-system/frontend
```

Install the required packages:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

### 5. Access the API documentation

FastAPI provides interactive API documentation through Swagger UI. Open the relevant service URL followed by `/docs`.

For example:

- API Gateway: `http://localhost:8003/docs`
- Authentication Service: `http://localhost:8000/docs`
- Student Service: `http://localhost:8001/docs`
- Course Service: `http://localhost:8002/docs`

## How the System Works

The frontend sends requests to the API Gateway. The gateway forwards those requests to the appropriate backend service.

For example, when a user adds a student, the frontend sends the student details to the gateway. The gateway forwards the request to the Student Service, which processes the request and returns a response.

This approach keeps the services separate and makes the application easier to maintain and extend.

## What I Learned

While working on this project, I gained practical experience with:

- Building REST APIs using FastAPI.
- Understanding microservices architecture.
- Connecting multiple backend services through an API Gateway.
- Integrating a React frontend with backend APIs.
- Implementing authentication and CRUD operations.
- Testing APIs using Swagger UI and Postman.
- Debugging frontend and backend integration issues.

## Future Improvements

Some features I would like to add in the future include:

- Role-based access for administrators and other users.
- Improved form validation and error handling.
- Pagination for large student lists.
- More detailed reports and analytics.
- Deployment so that the application can be accessed online.

## Author

**Prajwal Naganor**

Mechanical Engineering graduate transitioning into software development, with an interest in Python backend development, FastAPI, Django, and full-stack application development.

## Conclusion

This project helped me understand how a frontend application communicates with multiple backend services. It also gave me hands-on experience building and integrating APIs in a microservices-based application.
