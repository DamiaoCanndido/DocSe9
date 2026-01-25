package com.nergal.docseq.dto.users;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.nergal.docseq.dto.roles.RoleItemDTO;
import com.nergal.docseq.dto.towns.TownItemDTO;

public record UserItemDTO(
    UUID userId, 
    String username, 
    String email,
    List<RoleItemDTO> roles, 
    TownItemDTO town,
    LocalDateTime createdAt
) { }
