package com.techgadget.server.model.dto;

import com.techgadget.server.model.enums.Role;
import com.techgadget.server.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;

}
