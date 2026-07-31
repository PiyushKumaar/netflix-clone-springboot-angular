package com.netflix.clone.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {

    private String token;
    private String email;
    private String fullName;
    private String role;
}
