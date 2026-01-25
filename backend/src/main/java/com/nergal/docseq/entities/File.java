package com.nergal.docseq.entities;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_files")
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "file_id")
    private UUID fileId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Boolean favorite = false;

    @Column(nullable = false, name = "content_type")
    private String contentType;

    @Column(nullable = false)
    private Long size;

    @Column(nullable = false, name = "object_key")
    private String objectKey;

    /* ======================
       Relationships
       ====================== */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private Folder folder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "town_id", nullable = false)
    private Town town;

    /* ======================
       Users audit
       ====================== */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User uploadedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    /* ======================
       Dates
       ====================== */

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @Column(name = "last_seen")
    private Instant lastSeen;

    // Thrash
    @Column
    private Instant deletedAt;

    // getters and setters
    public UUID getFileId() {
       return fileId;
    }

    public String getName() {
       return name;
    }

    public Boolean getFavorite() {
       return favorite;
    }

    public String getContentType() {
       return contentType;
    }

    public Long getSize() {
       return size;
    }

    public String getObjectKey() {
       return objectKey;
    }

    public Folder getFolder() {
       return folder;
    }

    public Town getTown() {
       return town;
    }

    public User getUploadedBy() {
       return uploadedBy;
    }

    public User getUpdatedBy() {
       return updatedBy;
    }

    public User getDeletedBy() {
       return deletedBy;
    }

    public Instant getCreatedAt() {
       return createdAt;
    }

    public Instant getUpdatedAt() {
       return updatedAt;
    }

    public Instant getLastSeen() {
       return lastSeen;
    }

    public Instant getDeletedAt() {
       return deletedAt;
    }

    public void setName(String name) {
       this.name = name;
    }

    public void setFavorite(Boolean favorite) {
       this.favorite = favorite;
    }

    public void setContentType(String contentType) {
       this.contentType = contentType;
    }

    public void setSize(Long size) {
       this.size = size;
    }

    public void setObjectKey(String objectKey) {
       this.objectKey = objectKey;
    }

    public void setFolder(Folder folder) {
       this.folder = folder;
    }

    public void setTown(Town town) {
       this.town = town;
    }

    public void setUploadedBy(User uploadedBy) {
       this.uploadedBy = uploadedBy;
    }

    public void setUpdatedBy(User updatedBy) {
       this.updatedBy = updatedBy;
    }

    public void setDeletedBy(User deletedBy) {
       this.deletedBy = deletedBy;
    }

    public void setLastSeen(Instant lastSeen) {
       this.lastSeen = lastSeen;
    }

    public void setDeletedAt(Instant deletedAt) {
       this.deletedAt = deletedAt;
    }
}

