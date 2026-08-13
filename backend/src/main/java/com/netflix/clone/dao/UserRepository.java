package com.netflix.clone.dao;

import com.netflix.clone.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import com.netflix.clone.entity.User;

import java.util.Optional;

public interface  UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    long countByRoleAndActive(Role role, boolean active);
}
