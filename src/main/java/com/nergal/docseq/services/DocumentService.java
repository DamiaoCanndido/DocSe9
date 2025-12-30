package com.nergal.docseq.services;

import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.controllers.dto.DocumentRequestDTO;
import com.nergal.docseq.controllers.dto.UpdateDocumentDTO;
import com.nergal.docseq.entities.Document;
import com.nergal.docseq.exception.ConflictException;
import com.nergal.docseq.exception.NotFoundException;
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
        var user = userRepository.findById(UUID.fromString(token.getName()));
        var documentAlreadyExists = repository.findByOrder(dto.order());

        if (documentAlreadyExists != null) {
            throw new ConflictException(
                "Document with order " + dto.order() + " already exists."
            );
        }

        int lastNoticeOrderByTownship = 0;

        var noticeList = repository.findByTownship_TownshipIdOrderByOrderDesc(
            user.get().getTownship().getTownshipId());

        if (!noticeList.isEmpty()) {
            lastNoticeOrderByTownship = noticeList.get(0).getOrder();
        }

        if (dto.order() == null) {
            dto = new DocumentRequestDTO(
                    lastNoticeOrderByTownship + 1,
                    dto.description(),
                    dto.townshipId()
            );
        }

        var document = factory.get();
        document.setCreatedBy(user.get());
        document.setTownship(user.get().getTownship());
        document.setDescription(dto.description());
        document.setOrder(dto.order());

        return repository.save(document);
    }

    protected void applyUpdates(T entity, UpdateDocumentDTO dto) {

        if (dto.orderDoc() != null) {
            entity.setOrder(dto.orderDoc());
        }

        if (dto.description() != null) {
            entity.setDescription(dto.description());
        }
    }

    public T update(UUID id, UpdateDocumentDTO dto) {
        T entity = repository.findById(id)
            .orElseThrow(() -> new NotFoundException(
                    "Document not found"
            ));

        applyUpdates(entity, dto);

        return repository.save(entity);
    }
}

