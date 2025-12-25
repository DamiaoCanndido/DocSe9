package com.nergal.docseq.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    

    public Long getPermissionId() {
        return permissionId;
    }


    public void setPermissionId(Long permissionId) {
        this.permissionId = permissionId;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public User getUser() {
        return user;
    }


    public void setUser(User user) {
        this.user = user;
    }


    public enum Values {
        NOTICE_READ(1L),
        NOTICE_CREATE(2L),
        NOTICE_UPDATE(3L),
        NOTICE_DELETE(4L),

        CONTRACT_READ(5L),
        CONTRACT_CREATE(6L),
        CONTRACT_UPDATE(7L),
        CONTRACT_DELETE(8L),

        ORDINANCE_READ(9L),
        ORDINANCE_CREATE(10L),
        ORDINANCE_UPDATE(11L),
        ORDINANCE_DELETE(12L),

        DECREE_READ(13L),
        DECREE_CREATE(14L),
        DECREE_UPDATE(15L),
        DECREE_DELETE(16L),

        LAW_READ(17L),
        LAW_CREATE(18L),
        LAW_UPDATE(19L),
        LAW_DELETE(20L);

        Long permissionId;

        private Values(Long permissionId) {
            this.permissionId = permissionId;   
        }

        public Long getPermissionId() {
            return permissionId;
        }
    }
}

