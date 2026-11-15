# CourseFlow — Course Registration System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-007AFF?style=for-the-badge&logo=github)](https://pjpro537.github.io/course-registration-system/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.2-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Design](https://img.shields.io/badge/Design-Apple%20HIG%20Glassmorphism-black?style=for-the-badge&logo=apple)](https://developer.apple.com/design/human-interface-guidelines)

> A full-stack, Apple HIG-inspired Course Registration Platform featuring translucent glassmorphic surfaces, GSAP micro-interactions, capacity tracking, schedule conflict validation, and real-time academic notifications.

---

## 🌐 Live Website (GitHub Pages)

Experience the live interactive application directly in your browser:
👉 **[https://pjpro537.github.io/course-registration-system/](https://pjpro537.github.io/course-registration-system/)**

*(Includes full client-side demo engine: student auth, live course grid, enrollment validation, and notifications!)*

---

## 💻 Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.5 (RESTful Web Services, Spring Data JPA, Hibernate, Bean Validation)
- **Database:** SQL (H2 In-Memory for zero-config localhost + MySQL production dialect support)
- **Frontend:** HTML5, CSS3 Glassmorphism (`backdrop-filter: blur(40px)`), Vanilla JavaScript ES6+, GSAP 3.12 (GreenSock)
- **Deployment:** GitHub Pages (Static UI & Client Engine) + Spring Boot Server (Localhost:8080)

---

## ✨ Core Features

1. **Apple HIG Design & Glassmorphism:**
   - Dark translucent cards (`rgba(255, 255, 255, 0.06)`) with subtle borders and blurred backdrops
   - Multi-layered animated floating gradient orbs in background (Indigo, Purple, Teal)
   - Dynamic seat capacity bars with color gradients (Green → Yellow/Orange → Red)
2. **Authentication Module:**
   - Secure student registration and login with SHA-256 password hashing
   - Session tracking (`/api/auth/me`)
3. **Course Dashboard:**
   - Real-time catalog grid displaying course codes, titles, instructors, schedules, and live seat counts
   - Real-time search filter across courses, codes, and instructors
4. **Registration Engine:**
   - Prevents duplicate enrollments
   - Enforces course seat capacity
   - Detects and prevents schedule conflicts across overlapping course times
5. **Academic Notifications:**
   - Sliding glassmorphic side-panel with unread badge counter
   - Bell wiggle micro-interaction and click-to-read dismissal
   - Animated toast alerts for all academic actions

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Java 17+**
- **Maven 3.8+**

```bash
# On macOS (using Homebrew)
brew install openjdk@17 maven
```

### 2. Run the Application
```bash
# Clone the repository
git clone https://github.com/pjpro537/course-registration-system.git
cd course-registration-system

# Start Spring Boot
mvn spring-boot:run
```

The web application will be accessible at:
👉 **`http://localhost:8080`**

The embedded H2 Web Console is available at:
👉 **`http://localhost:8080/h2-console`** *(JDBC URL: `jdbc:h2:mem:coursedb`, User: `sa`, Password: blank)*

---

## 🗄️ Database Schema

```sql
students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 30,
    schedule_time VARCHAR(100) NOT NULL
);

enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ENROLLED',
    UNIQUE (student_id, course_id)
);

notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📄 License
MIT License. Created by [Pratham Jain](https://github.com/pjpro537).
