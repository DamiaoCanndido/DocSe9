package com.nergal.docseq.services;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import com.nergal.docseq.dto.documents.DocumentRequestDTO;
import com.nergal.docseq.entities.Decree;
import com.nergal.docseq.repositories.DecreeRepository;
import com.nergal.docseq.repositories.UserRepository;

@Service
public class DecreeService extends DocumentService<Decree> {

    public DecreeService(
            DecreeRepository decreeRepository,
            UserRepository userRepository
    ) {
        super(decreeRepository, userRepository);
    }

    public void createDecree(DocumentRequestDTO dto, JwtAuthenticationToken token, Integer year) {
        createBase(dto, token, year, Decree::new);
    }
}
