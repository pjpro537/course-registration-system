package com.capgemini.courseregistration.repository;

import com.capgemini.courseregistration.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByCourseId(Long courseId);
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    long countByCourseIdAndStatus(Long courseId, String status);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}
