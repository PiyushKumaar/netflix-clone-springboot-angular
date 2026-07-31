package com.netflix.clone.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message="Email is requried")
    @Email(message="Invalid email format")
    private String emaik;

    @NotBlank(message="Password is required")
    private String password;
}
