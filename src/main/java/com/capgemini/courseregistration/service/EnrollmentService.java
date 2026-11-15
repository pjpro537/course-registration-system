package com.capgemini.courseregistration.service;

import com.capgemini.courseregistration.entity.*;
import com.capgemini.courseregistration.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class EnrollmentService {

    private final EnrollmentRepository   enrollmentRepository;
    private final CourseRepository       courseRepository;
    private final StudentRepository      studentRepository;
    private final NotificationService    notificationService;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                              CourseRepository courseRepository,
                              StudentRepository studentRepository,
                              NotificationService notificationService) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository     = courseRepository;
        this.studentRepository   = studentRepository;
        this.notificationService = notificationService;
    }

    /** Enroll a student in a course — validates capacity + schedule conflicts */
    @Transactional
    public Enrollment enroll(Long studentId, Long courseId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Already enrolled?
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("You are already enrolled in this course");
        }

        // Capacity check
        long enrolled = enrollmentRepository.countByCourseIdAndStatus(courseId, "ENROLLED");
        if (enrolled >= course.getCapacity()) {
            throw new RuntimeException("Course is full — no seats available");
        }

        // Schedule-conflict check
        List<Enrollment> mine = enrollmentRepository.findByStudentId(studentId);
        for (Enrollment e : mine) {
            if ("ENROLLED".equals(e.getStatus())
                    && e.getCourse().getScheduleTime().equals(course.getScheduleTime())) {
                throw new RuntimeException(
                        "Schedule conflict with " + e.getCourse().getCourseCode()
                        + " — " + e.getCourse().getTitle());
            }
        }

        Enrollment enrollment = enrollmentRepository.save(
                new Enrollment(student, course, "ENROLLED"));

        notificationService.send(studentId,
                "✓ Enrolled in " + course.getCourseCode() + " — " + course.getTitle());

        return enrollment;
    }

    /** Drop an enrollment */
    @Transactional
    public void drop(Long enrollmentId, Long studentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (!enrollment.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Unauthorized");
        }

        String label = enrollment.getCourse().getCourseCode()
                     + " — " + enrollment.getCourse().getTitle();

        enrollmentRepository.delete(enrollment);

        notificationService.send(studentId, "✗ Dropped " + label);
    }

    /** Return enriched list of a student's current enrollments */
    public List<Map<String, Object>> getMyEnrollments(Long studentId) {
        List<Enrollment> list = enrollmentRepository.findByStudentId(studentId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Enrollment e : list) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("enrollmentId", e.getId());
            map.put("courseId",     e.getCourse().getId());
            map.put("courseCode",   e.getCourse().getCourseCode());
            map.put("title",       e.getCourse().getTitle());
            map.put("instructor",  e.getCourse().getInstructor());
            map.put("scheduleTime", e.getCourse().getScheduleTime());
            map.put("status",      e.getStatus());
            result.add(map);
        }
        return result;
    }
}
