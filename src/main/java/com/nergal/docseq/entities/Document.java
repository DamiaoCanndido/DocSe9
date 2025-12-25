package com.nergal.docseq.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, name = "doc_order")
    private Integer order;

    @Column(nullable = false, length = 500)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "township_id")
    private Township township;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    public UUID getId() {
        return id;
    }

    public Integer getOrder() {
        return order;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Township getTownship() {
        return township;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setTownship(Township township) {
        this.township = township;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
    
}

