package com.capgemini.courseregistration.service;

import com.capgemini.courseregistration.entity.Student;
import com.capgemini.courseregistration.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class AuthService {

    private final StudentRepository studentRepository;

    public AuthService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /** Register a new student account */
    public Student register(String name, String email, String password) {
        if (studentRepository.existsByEmail(email)) {
            throw new RuntimeException("An account with this email already exists");
        }
        Student student = new Student(name, email, hashPassword(password));
        return studentRepository.save(student);
    }

    /** Authenticate and return the student */
    public Student login(String email, String password) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!student.getPasswordHash().equals(hashPassword(password))) {
            throw new RuntimeException("Invalid email or password");
        }
        return student;
    }

    /** SHA-256 hash (demo-grade — use BCrypt in production) */
    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}
