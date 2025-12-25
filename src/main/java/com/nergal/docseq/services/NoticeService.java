package com.nergal.docseq.services;

import java.util.UUID;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.controllers.dto.DocumentDTO;
import com.nergal.docseq.entities.Notice;
import com.nergal.docseq.repositories.NoticeRepository;
import com.nergal.docseq.repositories.UserRepository;

@Service
public class NoticeService {

    private final UserRepository userRepository;
    private final NoticeRepository noticeRepository;

    public NoticeService(UserRepository userRepository, NoticeRepository noticeRepository) {
        this.userRepository = userRepository;
        this.noticeRepository = noticeRepository;
    }
 
    @Transactional
    public void createNotice(DocumentDTO dto, JwtAuthenticationToken token){
        var user = userRepository.findById(UUID.fromString(token.getName()));
        var township = user.get().getTownship();
        
        var notice = new Notice();
        notice.setTownship(township);
        notice.setCreatedBy(user.get());
        notice.setDescription(dto.description());
        notice.setOrder(dto.order());
        noticeRepository.save(notice);
    }
}

