-- ============================================
-- Course Registration System — Schema
-- ============================================

CREATE TABLE IF NOT EXISTS students (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_code     VARCHAR(20)   NOT NULL UNIQUE,
    title           VARCHAR(200)  NOT NULL,
    instructor      VARCHAR(100)  NOT NULL,
    capacity        INT           NOT NULL DEFAULT 30,
    schedule_time   VARCHAR(100)  NOT NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT        NOT NULL,
    course_id       BIGINT        NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'ENROLLED',
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_enrollment_course  FOREIGN KEY (course_id)  REFERENCES courses(id),
    CONSTRAINT uq_student_course     UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT        NOT NULL,
    message         VARCHAR(500)  NOT NULL,
    is_read         BOOLEAN       DEFAULT FALSE,
    timestamp       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_student FOREIGN KEY (student_id) REFERENCES students(id)
);
