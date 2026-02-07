package com.nergal.docseq.dto.users;

import java.time.Instant;
import java.util.UUID;

import com.nergal.docseq.dto.roles.RoleItemDTO;
import com.nergal.docseq.dto.towns.TownItemDTO;

public record UserItemDTO(
        UUID userId,
        String username,
        String email,
        RoleItemDTO role,
        TownItemDTO town,
        Instant createdAt) {
}
