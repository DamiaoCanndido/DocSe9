package com.nergal.docseq.services;

import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;

import com.nergal.docseq.helpers.DateRange;
import com.nergal.docseq.dto.documents.DocumentDTO;
import com.nergal.docseq.dto.documents.DocumentItemDTO;
import com.nergal.docseq.dto.documents.DocumentRequestDTO;
import com.nergal.docseq.dto.documents.DocumentUpdateDTO;
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

    protected DocumentDTO listDocumentsByTown(
        int page,
        int pageSize,
        Integer year,
        JwtAuthenticationToken token) {

        var pageable = PageRequest.of(page, pageSize, Sort.Direction.DESC, "order");
        var town_id = userRepository.findById(UUID.fromString(token.getName()))
            .get().getTown().getTownId();

            var dateRange = new DateRange(year);
            var initialDateTime = dateRange.getInitialDateTime();
            var endDateTime = dateRange.getEndDateTime();
            var documents = repository.findByTown_TownIdAndCreatedAtBetweenOrderByOrderDesc(
                town_id, 
                initialDateTime, 
                endDateTime, 
                pageable
            );
            List<DocumentItemDTO> documentsItems = documents
            .stream()
            .map(doc -> 
                new DocumentItemDTO(
                    doc.getId(),
                    doc.getDescription(),
                    doc.getOrder(),
                    doc.getCreatedAt(),
                    doc.getCreatedBy().getUsername()
                )
            ).toList();

        return new DocumentDTO(
            documentsItems, 
            page, 
            pageSize, 
            documents.getTotalPages(), 
            documents.getTotalElements()
        );
    }

    protected T createBase(
            DocumentRequestDTO dto,
            JwtAuthenticationToken token,
            Integer year,
            Supplier<T> factory
    ) {
        var dateRange = new DateRange(year);
        var user = userRepository.findById(UUID.fromString(token.getName()));
        var documentAlreadyExists = repository.findByOrderAndCreatedAtBetween(
            dto.order(), 
            dateRange.getInitialDateTime(), 
            dateRange.getEndDateTime()
        );

        if (documentAlreadyExists != null) {
            throw new ConflictException(
                "Document with order " + dto.order() + " already exists."
            );
        }

        int lastNoticeOrderByTown = 0;
        
            var initialDateTime = dateRange.getInitialDateTime();
            var endDateTime = dateRange.getEndDateTime();
        var pageable = PageRequest.of(0, 10, Sort.Direction.ASC, "order");

        var noticeList = repository.findByTown_TownIdAndCreatedAtBetweenOrderByOrderDesc(
            user.get().getTown().getTownId(), initialDateTime, endDateTime, pageable).getContent();

        if (!noticeList.isEmpty()) {
            lastNoticeOrderByTown = noticeList.get(0).getOrder();
        }

        if (dto.order() == null) {
            dto = new DocumentRequestDTO(
                lastNoticeOrderByTown + 1,
                dto.description(),
                dto.townId()
            );
        }

        var document = factory.get();
        document.setCreatedBy(user.get());
        document.setTown(user.get().getTown());
        document.setDescription(dto.description());
        document.setOrder(dto.order());

        return repository.save(document);
    }

    protected void applyUpdates(T entity, DocumentUpdateDTO dto, Integer year) {

        if (dto.order() != null) {
            var dateRange = new DateRange(year);
            var exists = repository.findByOrderAndCreatedAtBetween(
                dto.order(), 
                dateRange.getInitialDateTime(), 
                dateRange.getEndDateTime()
            );

            if (exists != null && !exists.getOrder().equals(entity.getOrder())) {
                throw new ConflictException(
                    "Document with order " + dto.order() + " already exists."
                );
            }

            entity.setOrder(dto.order());
        }

        if (dto.description() != null) {
            entity.setDescription(dto.description());
        }
    }

    public T update(UUID id, DocumentUpdateDTO dto) {
        T entity = repository.findById(id)
            .orElseThrow(() -> new NotFoundException(
                    "Document not found"
            ));

        applyUpdates(entity, dto, entity.getCreatedAt().getYear());

        return repository.save(entity);
    }

    public void deleteDocument(UUID documentId) {
        var document = repository.findById(documentId)
            .orElseThrow(() -> new NotFoundException(
                    "Document not found"
            ));

        repository.delete(document);
    }
}

