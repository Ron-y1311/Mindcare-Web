package com.upc.mindcare.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetConfirmDTO {
    @NotBlank(message = "Token obligatorio")
    private String token;

    @NotBlank(message = "Nueva password obligatoria")
    private String nuevaPassword;
}