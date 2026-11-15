package com.capgemini.courseregistration.controller;

import com.capgemini.courseregistration.dto.*;
import com.capgemini.courseregistration.service.EnrollmentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> enroll(@RequestBody EnrollmentRequest req,
                                               HttpSession session) {
        Long studentId = (Long) session.getAttribute("studentId");
        if (studentId == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Not authenticated"));
        }
        try {
            enrollmentService.enroll(studentId, req.getCourseId());
            return ResponseEntity.ok(new ApiResponse(true, "Enrolled successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> drop(@PathVariable Long id,
                                             HttpSession session) {
        Long studentId = (Long) session.getAttribute("studentId");
        if (studentId == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Not authenticated"));
        }
        try {
            enrollmentService.drop(id, studentId);
            return ResponseEntity.ok(new ApiResponse(true, "Dropped successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> mine(HttpSession session) {
        Long studentId = (Long) session.getAttribute("studentId");
        if (studentId == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Not authenticated"));
        }
        return ResponseEntity.ok(
                new ApiResponse(true, "Enrollments loaded",
                        enrollmentService.getMyEnrollments(studentId)));
    }
}
