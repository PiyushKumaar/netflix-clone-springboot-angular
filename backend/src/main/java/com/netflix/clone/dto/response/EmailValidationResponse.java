package com.netflix.clone.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EmailValidationResponse {

    private boolean exists;
    private boolean available;
}
