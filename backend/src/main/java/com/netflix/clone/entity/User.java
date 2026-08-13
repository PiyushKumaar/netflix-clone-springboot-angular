package com.netflix.clone.entity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.netflix.clone.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="users")
@Getter
@Setter
@ToString
public class User {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long id;

    @Column(nullable=false,unique=true)
    private String email;

    @Column(nullable=false)
    private String password;

    @Column(nullable=false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Role role = Role.USER;

    @Column(nullable=false)
    private boolean active = true;

    @Column(nullable=false)
    private boolean emailVerified = false;

    @Column(unique=true)
    private String verificationToken;

    @Column
    private Instant verificationTokenExpiry;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_token_expiry")
    private Instant passwordResetTokenExpiry;

    @CreationTimestamp
    @Column(nullable=false,updatable=false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable=false)
    private Instant updatedAt;

    @JsonIgnore
    @ManyToMany(fetch=FetchType.LAZY)
    @JoinTable(
        name="user_watchList",
        joinColumns=@JoinColumn(name="user_id"),
        inverseJoinColumns=@JoinColumn(name="video_id")
    )
    private Set<Video> watchList = new HashSet<>();

    public void addToWatchList(Video video){
        this.watchList.add(video);
    }

    public void removeFromWatchList(Video video){
        this.watchList.remove(video);
    }


}
