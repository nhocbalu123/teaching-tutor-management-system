# Teaching Tutor - Admin Dashboard

## Overview

The Admin Dashboard is a separate GraphQL-powered administration system for the Teaching Tutor application. It provides comprehensive management capabilities for users, courses, and system administration.

## Architecture

### Backend (admin-backend)

-   **Technology**: Node.js + TypeScript + Apollo GraphQL Server
-   **Database**: MySQL (shared with main application)
-   **Port**: 4001
-   **GraphQL Endpoint**: http://localhost:4001/graphql

### Frontend (admin-frontend)

-   **Technology**: Next.js 15 + TypeScript + Apollo Client
-   **Styling**: Tailwind CSS
-   **Port**: 3001
-   **URL**: http://localhost:3001

## Features

### 🔐 Authentication

-   Admin login with credentials: `admin` / `admin`
-   JWT-based authentication
-   Session management
-   Secure logout

### 👥 User Management

-   View all users (candidates, lecturers, admins)
-   User statistics dashboard
-   Block/unblock users
-   Delete users (except admins)
-   Filter users by type
-   Detailed user profiles

### 📚 Course Management

-   Create, edit, and delete courses
-   Assign lecturers to courses
-   Remove lecturer assignments
-   View course statistics
-   Manage course applications

### 📊 Dashboard Analytics

-   Real-time user statistics
-   Course overview
-   System status monitoring
-   Quick action shortcuts

## Installation & Setup

### 1. Install Dependencies

```bash
# Install all dependencies (including admin projects)
npm run install

# Or install admin projects separately
npm run install:admin-frontend
npm run install:admin-backend
```

### 2. Database Setup

The admin backend uses the same MySQL database as the main application. The admin user will be automatically seeded when the admin backend starts.

### 3. Environment Configuration

Admin backend environment variables are configured in `admin-backend/.env`:

```env
DB_HOST=209.38.26.237
DB_PORT=3306
DB_USERNAME=S3959931
DB_PASSWORD=Eel404101@@
DB_NAME=S3959931
PORT=4001
JWT_SECRET=admin-jwt-secret-key-2024
SESSION_SECRET=admin-session-secret-key-2024
FRONTEND_URL=http://localhost:3001
```

## Running the Admin Dashboard

### Development Mode

**Windows:**

```bash
npm run dev:admin:windows
```

**macOS/Linux:**

```bash
npm run dev:admin:unix
```

**Manual (All OS):**

```bash
# Terminal 1 - Admin Backend
npm run dev:admin-backend

# Terminal 2 - Admin Frontend
npm run dev:admin-frontend
```

### Production Mode

**Windows:**

```bash
npm run start:admin:windows
```

**macOS/Linux:**

```bash
npm run start:admin:unix
```

## Access Information

### Admin Dashboard

-   **URL**: http://localhost:3001
-   **Username**: `admin`
-   **Password**: `admin`

### GraphQL Playground

-   **URL**: http://localhost:4001/graphql
-   **Features**: Schema exploration, query testing

### Health Check

-   **URL**: http://localhost:4001/health

## GraphQL API

### Authentication Mutations

```graphql
# Admin Login
mutation AdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password) {
        success
        token
        message
        user {
            id
            email
            firstName
            lastName
            userType
            fullName
        }
    }
}

# Admin Logout
mutation AdminLogout {
    adminLogout
}
```

### User Management Queries

```graphql
# Get All Users
query GetAllUsers {
    getAllUsers {
        id
        email
        firstName
        lastName
        userType
        isBlocked
        createdAt
        fullName
    }
}

# Get User Statistics
query GetUserStats {
    getUserStats {
        totalUsers
        totalCandidates
        totalLecturers
        totalAdmins
        blockedUsers
    }
}

# Block User
mutation BlockUser($id: Int!) {
    blockUser(id: $id) {
        success
        message
        user {
            id
            isBlocked
        }
    }
}
```

### Course Management Queries

```graphql
# Get All Courses
query GetAllCourses {
    getAllCourses {
        id
        courseCode
        courseName
        semester
        description
        maxTutors
        maxLabAssistants
        courseAssignments {
            id
            lecturer {
                id
                firstName
                lastName
                email
            }
        }
    }
}

# Create Course
mutation CreateCourse($input: CourseInput!) {
    createCourse(input: $input) {
        success
        message
        course {
            id
            courseCode
            courseName
        }
    }
}

# Assign Lecturer to Course
mutation AssignLecturerToCourse($lecturerId: Int!, $courseId: Int!) {
    assignLecturerToCourse(lecturerId: $lecturerId, courseId: $courseId) {
        success
        message
        assignment {
            id
            lecturer {
                firstName
                lastName
            }
            course {
                courseCode
                courseName
            }
        }
    }
}
```

## Security Features

### Authentication

-   JWT tokens with 24-hour expiration
-   Secure session management
-   Admin-only access control

### Authorization

-   Admin role verification for all operations
-   Protected GraphQL resolvers
-   CORS configuration for frontend-only access

### Data Protection

-   Password hashing with bcrypt
-   SQL injection prevention via TypeORM
-   Input validation and sanitization

## Database Schema

The admin backend uses the existing database schema with the following key entities:

### Users Table

-   Supports `UserType.ADMIN` for admin users
-   Admin user seeded automatically: `admin` / `admin`
-   Blocked status management

### Courses Table

-   Full CRUD operations
-   Lecturer assignment tracking
-   Application management

### Course Assignments Table

-   Links lecturers to courses
-   Unique constraints to prevent duplicates
-   Cascade deletion support

## Development Guidelines

### Adding New Features

1. Create GraphQL types in `admin-backend/src/types/`
2. Implement resolvers in `admin-backend/src/resolvers/`
3. Add queries/mutations to `admin-frontend/src/lib/graphql/queries.ts`
4. Create React components in `admin-frontend/src/components/`

### Code Structure

```
admin-backend/
├── src/
│   ├── config/          # Database configuration
│   ├── types/           # TypeORM entities with GraphQL decorators
│   ├── resolvers/       # GraphQL resolvers
│   └── index.ts         # Server entry point

admin-frontend/
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── lib/             # Apollo Client & GraphQL queries
│   └── styles/          # Global styles
```

## Troubleshooting

### Common Issues

**1. Database Connection Failed**

-   Verify database credentials in `.env`
-   Check if MySQL server is running
-   Ensure network connectivity to cloud database

**2. GraphQL Schema Errors**

-   Run `npm run build:admin-backend` to check TypeScript compilation
-   Verify all entity imports are correct
-   Check for circular dependencies

**3. Frontend Build Errors**

-   Ensure all GraphQL queries match backend schema
-   Check TypeScript types alignment
-   Verify Apollo Client configuration

**4. Authentication Issues**

-   Clear browser localStorage
-   Check JWT token expiration
-   Verify admin user exists in database

### Logs and Debugging

-   Backend logs: Console output from admin-backend
-   Frontend logs: Browser developer console
-   GraphQL errors: Available in Apollo Client DevTools

## Deployment Considerations

### Environment Variables

-   Update database credentials for production
-   Set secure JWT and session secrets
-   Configure proper CORS origins
-   Set `NODE_ENV=production`

### Security Checklist

-   [ ] Change default admin credentials
-   [ ] Use HTTPS in production
-   [ ] Implement rate limiting
-   [ ] Set up proper firewall rules
-   [ ] Enable database SSL connections

## Support

For issues or questions regarding the Admin Dashboard:

1. Check the troubleshooting section above
2. Review GraphQL schema in playground
3. Check console logs for error details
4. Verify database connectivity and data integrity

---

**Note**: This Admin Dashboard is completely separate from the main Teaching Tutor website and should only be accessed by authorized administrators.
