package com.nergal.docseq.entities;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "tb_user_permissions",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_user_permission_name_user",
            columnNames = {"name", "user_id"}
        )
    }
)
public class UserPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "permission_id")
    private Long permissionId;

    @Column(name = "name", nullable = false)
    @Enumerated(EnumType.STRING)
    private PermissionEnum name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    

    public Long getPermissionId() {
        return permissionId;
    }


    public void setPermissionId(Long permissionId) {
        this.permissionId = permissionId;
    }


    public PermissionEnum getName() {
        return name;
    }


    public void setName(PermissionEnum name) {
        this.name = name;
    }


    public User getUser() {
        return user;
    }


    public void setUser(User user) {
        this.user = user;
    }
}

