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
    @JoinColumn(name = "township_id", nullable = false)
    private Township township;

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
}

