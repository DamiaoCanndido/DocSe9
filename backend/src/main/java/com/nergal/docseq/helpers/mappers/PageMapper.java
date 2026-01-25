package com.nergal.docseq.helpers.mappers;

import org.springframework.data.domain.Page;

import com.nergal.docseq.dto.PageResponse;

public final class PageMapper {

    private PageMapper() {
    }

    public static <T> PageResponse<T> toPageResponse(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast());
    }
}
