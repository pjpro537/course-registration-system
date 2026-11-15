package com.capgemini.courseregistration.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "enrollments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, length = 20)
    private String status = "ENROLLED";

    public Enrollment() {}

    public Enrollment(Student student, Course course, String status) {
        this.student = student;
        this.course = course;
        this.status = status;
    }

    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }
    public Student getStudent()                { return student; }
    public void setStudent(Student student)    { this.student = student; }
    public Course getCourse()                  { return course; }
    public void setCourse(Course course)       { this.course = course; }
    public String getStatus()                  { return status; }
    public void setStatus(String status)       { this.status = status; }
}
