package com.nergal.docseq.dto.roles;

import com.nergal.docseq.entities.Role;

public record RoleItemDTO(Long roleId, Role.Values name) {

}
