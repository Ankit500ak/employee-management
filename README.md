# DataVault

Full-stack user lifecycle management application with secure authentication, OTP-based registration, Excel bulk import, and admin access control.

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 18, React Router 6, Axios, Vite       |
| Backend  | Django 5, Django REST Framework              |
| Database | PostgreSQL                                   |
| Email    | SMTP (Gmail App Password)                    |

## Project Structure

```
├── backend/               # Django REST API
│   ├── accounts/          # Auth, OTP, registration, access requests
│   ├── records/           # User record CRUD (ownership-safe)
│   ├── imports/           # Excel upload, row-wise processing
│   ├── notifications/     # Email sending + logging
│   └── core/              # Settings, root URLs
├── frontend/              # React SPA
│   └── src/
│       ├── pages/         # Login, Register, Dashboard, etc.
│       ├── components/    # Route guards, shared components
│       ├── services/      # API service modules
│       └── utils/         # Helpers
└── import_template.xlsx   # Sample import file
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for SMTP

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd <project-folder>
```

### 2. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE app_db;
```

> Default connection uses `postgres` / `postgres` on `localhost:5432`. Change in `.env` if needed.

### 3. Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in your values:
#   SECRET_KEY      → any random string
#   DB_NAME         → app_db (or your database name)
#   DB_USER         → your postgres username
#   DB_PASSWORD     → your postgres password
#   EMAIL_HOST_USER → your Gmail address
#   EMAIL_HOST_PASSWORD → your Gmail App Password
#   DEFAULT_FROM_EMAIL  → sender address shown in emails

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin account
python manage.py createsuperuser

# Start server
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

### 4. Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173/`.

## API Endpoints

### Auth
| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/api/auth/login/`                | Login, returns token           |
| POST   | `/api/auth/logout/`               | Logout, destroys token         |
| POST   | `/api/auth/change-password/`      | Change password                |
| POST   | `/api/auth/request-otp/`          | Send OTP to email              |
| POST   | `/api/auth/verify-otp/`           | Verify OTP code                |
| POST   | `/api/auth/register/`             | Register new user              |
| GET    | `/api/auth/me/`                   | Get current user profile       |
| PUT    | `/api/auth/me/`                   | Update profile                 |
| POST   | `/api/auth/access-request/`       | Request admin access           |
| GET    | `/api/auth/access-request/me/`    | Check own request status       |
| GET    | `/api/auth/access-requests/`      | List pending requests (admin)  |
| POST   | `/api/auth/access-requests/<id>/` | Approve/deny request (admin)   |

### Records
| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| GET    | `/api/record/me/`  | View own record         |
| PUT    | `/api/record/me/`  | Edit own record         |
| DELETE | `/api/record/me/`  | Soft-delete own record  |

### Imports (Admin)
| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/api/imports/upload/` | Upload Excel file        |
| GET    | `/api/imports/`        | List all import jobs     |
| GET    | `/api/imports/<id>/`   | Import job details       |

### Notifications (Admin)
| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| GET    | `/api/notifications/email-logs/`| List email logs   |

## Import File Format

The Excel file (`.xlsx`) must have these column headers in the first row:

| full_name | email | phone | address |
| --------- | ----- | ----- | ------- |

A sample file (`import_template.xlsx`) is included in the project root.

## Features

- **OTP Registration** — Email verification with hashed, single-use, time-expiring OTP
- **First-Login Password Change** — Enforced in both API and UI
- **Ownership-Safe Records** — Users can only access their own record via `/me/`
- **Excel Bulk Import** — Row-wise processing with per-row error logging and transaction rollback
- **Auto Credential Email** — Imported users receive styled HTML emails with login credentials
- **Admin Access Requests** — Non-admin users can request admin access; any admin can approve/deny
- **Import Status Tracking** — Jobs are marked as `COMPLETED`, `COMPLETED_WITH_ERRORS`, or `FAILED`
- **Dark Theme UI** — Clean, responsive interface
