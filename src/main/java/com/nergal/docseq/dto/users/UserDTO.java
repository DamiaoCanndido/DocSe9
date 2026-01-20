package com.nergal.docseq.dto.users;

import java.util.List;

public record UserDTO(List<UserItemDTO> users, 
                      int page, 
                      int pageSize, 
                      int totalPages, 
                      long totalElements) {}
