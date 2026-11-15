package com.capgemini.courseregistration.controller;

import com.capgemini.courseregistration.dto.ApiResponse;
import com.capgemini.courseregistration.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAll() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Courses loaded",
                        courseService.getAllCoursesWithAvailability()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(
                    new ApiResponse(true, "Course found",
                            courseService.getCourseById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
