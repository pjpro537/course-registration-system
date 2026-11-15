package com.capgemini.courseregistration.service;

import com.capgemini.courseregistration.entity.Course;
import com.capgemini.courseregistration.repository.CourseRepository;
import com.capgemini.courseregistration.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CourseService {

    private final CourseRepository     courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository,
                         EnrollmentRepository enrollmentRepository) {
        this.courseRepository     = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    /** Return every course with live seat-availability stats */
    public List<Map<String, Object>> getAllCoursesWithAvailability() {
        List<Course> courses = courseRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Course c : courses) {
            long enrolled = enrollmentRepository.countByCourseIdAndStatus(c.getId(), "ENROLLED");
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id",           c.getId());
            map.put("courseCode",   c.getCourseCode());
            map.put("title",       c.getTitle());
            map.put("instructor",  c.getInstructor());
            map.put("capacity",    c.getCapacity());
            map.put("enrolled",    enrolled);
            map.put("available",   c.getCapacity() - enrolled);
            map.put("scheduleTime", c.getScheduleTime());
            result.add(map);
        }
        return result;
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }
}
