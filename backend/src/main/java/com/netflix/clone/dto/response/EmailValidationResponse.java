package com.netflix.clone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EmailValidationResponse {

    private boolean exists;
    private boolean available;
}
