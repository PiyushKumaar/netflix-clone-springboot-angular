package com.netflix.clone.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.netflix.clone.entity.User;

public interface  UserRepository extends JpaRepository<User, Long> {

}
