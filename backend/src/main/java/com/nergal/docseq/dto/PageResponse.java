package com.nergal.docseq.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> nodes,
        int page,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean last) {
}
