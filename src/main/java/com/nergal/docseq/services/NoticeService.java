package com.nergal.docseq.services;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import com.nergal.docseq.controllers.dto.DocumentRequestDTO;
import com.nergal.docseq.entities.Notice;
import com.nergal.docseq.repositories.NoticeRepository;
import com.nergal.docseq.repositories.UserRepository;

@Service
public class NoticeService extends DocumentService<Notice> {

    public NoticeService(
            NoticeRepository noticeRepository,
            UserRepository userRepository
    ) {
        super(noticeRepository, userRepository);
    }

    public void createNotice(DocumentRequestDTO dto, JwtAuthenticationToken token) {
        createBase(dto, token, Notice::new);
    }
}


