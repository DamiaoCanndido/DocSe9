package com.nergal.hello.controllers.dto;

import java.util.List;
import java.util.UUID;

public record UserItemDTO(
    UUID userId, 
    String username, 
    String email,
    List<RoleItemDTO> roles, 
    String createdAt
) { }
