package com.capgemini.courseregistration.controller;

import com.capgemini.courseregistration.dto.*;
import com.capgemini.courseregistration.entity.Student;
import com.capgemini.courseregistration.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest req,
                                                 HttpSession session) {
        try {
            Student s = authService.register(req.getName(), req.getEmail(), req.getPassword());
            session.setAttribute("studentId",   s.getId());
            session.setAttribute("studentName", s.getName());
            return ResponseEntity.ok(new ApiResponse(true, "Registration successful", toMap(s)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest req,
                                              HttpSession session) {
        try {
            Student s = authService.login(req.getEmail(), req.getPassword());
            session.setAttribute("studentId",   s.getId());
            session.setAttribute("studentName", s.getName());
            return ResponseEntity.ok(new ApiResponse(true, "Login successful", toMap(s)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(new ApiResponse(true, "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> me(HttpSession session) {
        Long id = (Long) session.getAttribute("studentId");
        if (id == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Not authenticated"));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id",   id);
        data.put("name", session.getAttribute("studentName"));
        return ResponseEntity.ok(new ApiResponse(true, "Authenticated", data));
    }

    private Map<String, Object> toMap(Student s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",    s.getId());
        m.put("name",  s.getName());
        m.put("email", s.getEmail());
        return m;
    }
}
