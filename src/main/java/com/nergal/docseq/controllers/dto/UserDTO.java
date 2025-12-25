package com.nergal.docseq.controllers.dto;

import java.util.List;

public record UserDTO(List<UserItemDTO> users, 
                      int page, 
                      int pageSize, 
                      int totalPages, 
                      long totalElements) {}
