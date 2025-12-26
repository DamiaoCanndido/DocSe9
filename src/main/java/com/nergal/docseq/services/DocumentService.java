package com.nergal.docseq.services;

import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.controllers.dto.DocumentRequestDTO;
import com.nergal.docseq.entities.Document;
import com.nergal.docseq.repositories.DocumentRepository;
import com.nergal.docseq.repositories.UserRepository;

@Transactional
public abstract class DocumentService<T extends Document> {

    protected final DocumentRepository<T> repository;
    protected final UserRepository userRepository;

    protected DocumentService(
            DocumentRepository<T> repository,
            UserRepository userRepository
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    protected T createBase(
            DocumentRequestDTO dto,
            JwtAuthenticationToken token,
            Supplier<T> factory
    ) {
        var user = userRepository.findById(UUID.fromString(token.getName()));;

        var document = factory.get();
        document.setCreatedBy(user.get());
        document.setTownship(user.get().getTownship());
        document.setDescription(dto.description());
        document.setOrder(dto.order());

        return repository.save(document);
    }
}

