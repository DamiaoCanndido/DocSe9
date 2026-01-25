package com.nergal.docseq.entities;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_folders")
public class Folder {

   @Id
   @GeneratedValue(strategy = GenerationType.UUID)
   @Column(name = "folder_id")
   private UUID folderId;

   @Column(nullable = false)
   private String name;

   @Column(nullable = false)
   private Boolean favorite = false;

   /*
    * ======================
    * Folder hierarchy
    * ======================
    */

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "parent_id")
   private Folder parent;

   @OneToMany(mappedBy = "parent")
   private List<Folder> children = new ArrayList<>();

   /*
    * ======================
    * Organizational scope
    * ======================
    */

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "town_id", nullable = false)
   private Town town;

   /*
    * ======================
    * User audit
    * ======================
    */

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "created_by")
   private User createdBy;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "updated_by")
   private User updatedBy;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "deleted_by")
   private User deletedBy;

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

   // getters and setters

   public UUID getFolderId() {
      return folderId;
   }

   public String getName() {
      return name;
   }

   public Boolean getFavorite() {
      return favorite;
   }

   public Folder getParent() {
      return parent;
   }

   public List<Folder> getChildren() {
      return children;
   }

   public Town getTown() {
      return town;
   }

   public User getCreatedBy() {
      return createdBy;
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

   public Instant getDeletedAt() {
      return deletedAt;
   }

   public void setName(String name) {
      this.name = name;
   }

   public void setFavorite(Boolean favorite) {
      this.favorite = favorite;
   }

   public void setParent(Folder parent) {
      this.parent = parent;
   }

   public void setTown(Town town) {
      this.town = town;
   }

   public void setCreatedBy(User createdBy) {
      this.createdBy = createdBy;
   }

   public void setUpdatedBy(User updatedBy) {
      this.updatedBy = updatedBy;
   }

   public void setDeletedBy(User deletedBy) {
      this.deletedBy = deletedBy;
   }

   public void setDeletedAt(Instant deletedAt) {
      this.deletedAt = deletedAt;
   }
}
