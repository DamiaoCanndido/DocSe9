package com.nergal.docseq.entities;

import java.util.UUID;

import org.springframework.data.annotation.Id;

import jakarta.persistence.*;

@Entity
@Table(
  uniqueConstraints = @UniqueConstraint(
    columnNames = {"user_id", "folder_id"}
  )
)
public class FolderPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private Folder folder;

    @Enumerated(EnumType.STRING)
    private FolderPermissionType permission;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Folder getFolder() {
        return folder;
    }

    public void setFolder(Folder folder) {
        this.folder = folder;
    }

    public FolderPermissionType getPermission() {
        return permission;
    }

    public void setPermission(FolderPermissionType permission) {
        this.permission = permission;
    }

    public enum FolderPermissionType {
        CREATE,
        READ,
        UPDATE,
        DELETE
    }
}

