package com.capgemini.courseregistration.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "timestamp")
    private LocalDateTime timestamp = LocalDateTime.now();

    public Notification() {}

    public Notification(Student student, String message) {
        this.student = student;
        this.message = message;
        this.isRead = false;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }
    public Student getStudent()                      { return student; }
    public void setStudent(Student student)           { this.student = student; }
    public String getMessage()                       { return message; }
    public void setMessage(String message)           { this.message = message; }
    public Boolean getIsRead()                       { return isRead; }
    public void setIsRead(Boolean isRead)            { this.isRead = isRead; }
    public LocalDateTime getTimestamp()               { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
