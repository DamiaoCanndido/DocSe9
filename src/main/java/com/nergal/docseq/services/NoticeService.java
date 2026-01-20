package com.nergal.docseq.services;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import com.nergal.docseq.dto.documents.DocumentDTO;
import com.nergal.docseq.dto.documents.DocumentRequestDTO;
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

    public DocumentDTO listNoticesByTown(int page, int pageSize, JwtAuthenticationToken token, Integer year) {
        return listDocumentsByTown(page, pageSize, year, token);
    }

    public void createNotice(DocumentRequestDTO dto, JwtAuthenticationToken token, Integer year) {
        createBase(dto, token, year, Notice::new);
    }
}


