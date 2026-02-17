package com.nergal.docseq.entities;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_nodes")
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "node_id")
    private UUID nodeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "node_type", nullable = false)
    private NodeType nodeType;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Boolean favorite = false;

    /*
     * ======================
     * Node hierarchy
     * ======================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Node parent;

    @OneToMany(mappedBy = "parent")
    private List<Node> children = new ArrayList<>();

    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PermissionV2> permissions = new ArrayList<>();

    /*
     * ======================
     * Organizational scope
     * ======================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "town_id", nullable = false)
    private TownV2 town;

    /*
     * ======================
     * User audit
     * ======================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserV2 createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private UserV2 updatedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private UserV2 deletedBy;

    /*
     * ======================
     * Dates
     * ======================
     */

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    // Thrash (soft delete)
    @Column
    private Instant deletedAt;

    /*
     * ======================
     * File fields
     * ======================
     */

    @Column(name = "content_type")
    private String contentType;

    @Column
    private Long size;

    @Column(name = "object_key")
    private String objectKey;

    @Column(name = "last_seen")
    private Instant lastSeen;

    // getters and setters

    public UUID getNodeId() {
        return nodeId;
    }

    public void setNodeId(UUID nodeId) {
        this.nodeId = nodeId;
    }

    public NodeType getNodeType() {
        return nodeType;
    }

    public void setNodeType(NodeType nodeType) {
        this.nodeType = nodeType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getFavorite() {
        return favorite;
    }

    public void setFavorite(Boolean favorite) {
        this.favorite = favorite;
    }

    public Node getParent() {
        return parent;
    }

    public void setParent(Node parent) {
        this.parent = parent;
    }

    public List<Node> getChildren() {
        return children;
    }

    public void setChildren(List<Node> children) {
        this.children = children;
    }

    public List<PermissionV2> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<PermissionV2> permissions) {
        this.permissions = permissions;
    }

    public TownV2 getTown() {
        return town;
    }

    public void setTown(TownV2 town) {
        this.town = town;
    }

    public UserV2 getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserV2 createdBy) {
        this.createdBy = createdBy;
    }

    public UserV2 getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(UserV2 updatedBy) {
        this.updatedBy = updatedBy;
    }

    public UserV2 getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(UserV2 deletedBy) {
        this.deletedBy = deletedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public void setObjectKey(String objectKey) {
        this.objectKey = objectKey;
    }

    public Instant getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(Instant lastSeen) {
        this.lastSeen = lastSeen;
    }

    public void copyPermissionsFrom(Node sourceNode) {
        if (sourceNode.getPermissions() != null) {
            this.permissions.clear();

            for (PermissionV2 sourcePermission : sourceNode.getPermissions()) {
                PermissionV2 newPermission = new PermissionV2();
                newPermission.setNode(this);
                newPermission.setUser(sourcePermission.getUser());
                newPermission.setGrantedBy(sourcePermission.getGrantedBy());
                newPermission.setPermissionType(sourcePermission.getPermissionType());

                this.permissions.add(newPermission);
            }
        }
    }
}
