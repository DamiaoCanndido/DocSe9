package com.nergal.docseq.dto.towns;

import java.util.List;

public record TownDTO(List<TownItemDTO> towns,
        int page,
        int pageSize,
        int totalPages,
        long totalElements) {

}
