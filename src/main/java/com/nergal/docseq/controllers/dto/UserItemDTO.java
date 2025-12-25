package com.nergal.docseq.controllers.dto;

import java.util.List;
import java.util.UUID;

public record UserItemDTO(
    UUID userId, 
    String username, 
    String email,
    List<RoleItemDTO> roles, 
    TownshipItemDTO township,
    String createdAt
) { }
