package com.nergal.docseq.dto.users;

import com.nergal.docseq.dto.PageResponse;

public record UserContentResponse(
        PageResponse<UserItemDTO> users) {

}
