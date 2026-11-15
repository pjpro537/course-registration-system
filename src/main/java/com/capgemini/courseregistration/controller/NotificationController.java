package com.capgemini.courseregistration.controller;

import com.capgemini.courseregistration.dto.ApiResponse;
import com.capgemini.courseregistration.service.NotificationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAll(HttpSession session) {
        Long studentId = (Long) session.getAttribute("studentId");
        if (studentId == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Not authenticated"));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("notifications", notificationService.getNotifications(studentId));
        data.put("unreadCount",   notificationService.getUnreadCount(studentId));
        return ResponseEntity.ok(new ApiResponse(true, "Notifications loaded", data));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markRead(@PathVariable Long id,
                                                 HttpSession session) {
        Long studentId = (Long) session.getAttribute("studentId");
        if (studentId == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Not authenticated"));
        }
        try {
            notificationService.markAsRead(id, studentId);
            return ResponseEntity.ok(new ApiResponse(true, "Marked as read"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
