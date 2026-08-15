package com.netflix.clone.dao;

import com.netflix.clone.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.netflix.clone.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface  UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    long countByRoleAndActive(Role role, boolean active);

    @Query("SELECT u FROM User u WHERE " + "LOWER(u.fullName) LIKE LOWER(CONCAT('%',:search,'%')) OR "
    + "LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    long countByRole(Role role);

    @Query("select v.id from User u join u.watchList v where u.email = :email and v.id in :videoIds")
    Set<Long> findWatchListVideoIds(@Param("email") String email,@Param("videoIds") List<Long> videoIds);
}
