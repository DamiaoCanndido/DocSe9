package com.nergal.docseq.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nergal.docseq.controllers.dto.DocumentDTO;
import com.nergal.docseq.services.NoticeService;


@RestController
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }
    
    @PostMapping("/notices")
    public ResponseEntity<Void> createNotice(@RequestBody DocumentDTO dto, JwtAuthenticationToken token) {
        noticeService.createNotice(dto, token);
        return ResponseEntity.ok().build();
    }
}
