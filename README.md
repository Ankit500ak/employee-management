# User Management & Task Collaboration Platform

A comprehensive full-stack application for managing users, collaborating on tasks, and real-time team communication.

## 🚀 Tech Stack

*   **Frontend**: React (Vite), React Router, Axios, CSS Modules (Glassmorphism UI)
*   **Backend**: Django, Django REST Framework, PostgreSQL
*   **Authentication**: Token-based authentication with OTP verification
*   **Email**: Integrated SMTP for notifications and credentials

## ✨ Key Features

1.  **User Hierarchy & Management**
    *   Admin users can create sub-users directly or via bulk Excel imports.
    *   Standard users can request administrative access from their creators.
2.  **Task Management**
    *   Create, assign, and track tasks (Pending, In Progress, Completed, Cancelled).
    *   Personalized dashboards showing task statistics and overdue alerts.
    *   Reassign tasks to sub-users if verified.
3.  **Team Collaboration & Chat**
    *   Create project teams and add members.
    *   Direct messaging and team-based group chat.
    *   Real-time unread message tracking and summaries.
4.  **Admin Tools**
    *   Bulk user import via Excel (`.xlsx`) with automated email credential dispatch.
    *   Review and approve/deny administrative access requests.

## 🛠️ Getting Started

### Backend Setup (Django)

1. Navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file with `DATABASE_URL`, `SECRET_KEY`, and `EMAIL_HOST` credentials.
5. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup (React/Vite)

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Deployment
The application is structured to be easily deployed on platforms like **Railway** or **Heroku**. Ensure production settings (like `gunicorn` and `whitenoise`) are configured in the Django settings before deployment.
