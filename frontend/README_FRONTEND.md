# CampusFlow Frontend

React + Vite frontend for the existing Student Management Microservices project.

## Backend preservation
The existing backend service files are included unchanged from the uploaded ZIP. The frontend calls the API Gateway through Vite's development proxy so browser CORS configuration on the backend is not required for local development.

## Requirements
- Node.js 18+ (recommended current LTS)
- Existing FastAPI services running on ports 8000, 8001, 8002 and API Gateway on 8003

## Start
Open a terminal in this `frontend` directory and run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## API integration
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`
- Students: `POST /students`, `GET /all-student`, `GET /get-student?stu_id=...`, `PUT /update-student`, `DELETE /delete-student?stu_id=...`
- Departments: `POST /add-dept?dept_name=...`, `GET /departments`
- Courses: `POST /add-course?course_name=...`, `GET /courses`, `GET /courses/{course_id}`, `DELETE /courses/{course_id}`

The frontend reads the access token from the existing login response field `access token` and sends it as a Bearer token. Student records include `sem`, matching the current backend schema.
