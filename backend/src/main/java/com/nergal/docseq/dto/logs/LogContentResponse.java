package com.nergal.docseq.dto.logs;

import com.nergal.docseq.dto.PageResponse;

public record LogContentResponse(
                PageResponse<AuditLogResponseDTO> data) {
}
