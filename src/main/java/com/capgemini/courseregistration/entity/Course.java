package com.capgemini.courseregistration.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    private String courseCode;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 100)
    private String instructor;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "schedule_time", nullable = false, length = 100)
    private String scheduleTime;

    public Course() {}

    public Long getId()                                  { return id; }
    public void setId(Long id)                           { this.id = id; }
    public String getCourseCode()                        { return courseCode; }
    public void setCourseCode(String courseCode)          { this.courseCode = courseCode; }
    public String getTitle()                             { return title; }
    public void setTitle(String title)                   { this.title = title; }
    public String getInstructor()                        { return instructor; }
    public void setInstructor(String instructor)         { this.instructor = instructor; }
    public Integer getCapacity()                         { return capacity; }
    public void setCapacity(Integer capacity)            { this.capacity = capacity; }
    public String getScheduleTime()                      { return scheduleTime; }
    public void setScheduleTime(String scheduleTime)     { this.scheduleTime = scheduleTime; }
}
