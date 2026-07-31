package com.netflix.clone.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.netflix.clone.entity.Video;

public interface VideoRepository extends JpaRepository<Video, Long> {

}
