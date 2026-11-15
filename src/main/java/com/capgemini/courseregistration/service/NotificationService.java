package com.capgemini.courseregistration.service;

import com.capgemini.courseregistration.entity.Notification;
import com.capgemini.courseregistration.entity.Student;
import com.capgemini.courseregistration.repository.NotificationRepository;
import com.capgemini.courseregistration.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final StudentRepository      studentRepository;

    public NotificationService(NotificationRepository notificationRepository,
                                StudentRepository studentRepository) {
        this.notificationRepository = notificationRepository;
        this.studentRepository      = studentRepository;
    }

    /** Create and persist a notification */
    public void send(Long studentId, String message) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        notificationRepository.save(new Notification(student, message));
    }

    /** All notifications for a student, newest first */
    public List<Map<String, Object>> getNotifications(Long studentId) {
        List<Notification> list = notificationRepository.findByStudentIdOrderByTimestampDesc(studentId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Notification n : list) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id",        n.getId());
            map.put("message",   n.getMessage());
            map.put("isRead",    n.getIsRead());
            map.put("timestamp", n.getTimestamp().toString());
            result.add(map);
        }
        return result;
    }

    /** Mark a single notification as read */
    public void markAsRead(Long notificationId, Long studentId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Unauthorized");
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    public long getUnreadCount(Long studentId) {
        return notificationRepository.countByStudentIdAndIsRead(studentId, false);
    }
}
