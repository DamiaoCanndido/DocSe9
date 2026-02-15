package com.nergal.docseq.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.PermissionType;

@Repository
public interface FolderRepository extends
              JpaRepository<Folder, UUID>,
              JpaSpecificationExecutor<Folder> {

       // Search ALL folders in the organization (full tree)
       List<Folder> findByTownTownIdAndDeletedAtIsNull(
                     UUID townId);

       // Recycle Bin – List deleted folders
       Page<Folder> findByTownTownIdAndDeletedAtIsNotNull(
                     UUID townId,
                     Pageable page);

       @Query("""
                     SELECT DISTINCT f FROM Folder f
                     LEFT JOIN f.permissions p
                     LEFT JOIN f.parent parent
                     LEFT JOIN p.user u
                     WHERE f.town.townId = :townId
                     AND f.deletedAt IS NOT NULL
                     AND (f.parent IS NULL OR f.parent.deletedAt IS NULL)
                     AND (
                         :userRole IN ('manager')
                         OR (
                             u.userId = :userId
                             AND p.permissionType IN :acceptablePermissions
                         )
                     )
                     """)
       Page<Folder> findTrashByTownAndPermissions(
                     @Param("townId") UUID townId,
                     @Param("userId") UUID userId,
                     @Param("userRole") String userRole,
                     @Param("acceptablePermissions") List<PermissionType> acceptablePermissions,
                     Pageable pageable);

       // Check for duplicate names in the same folder
       boolean existsByNameAndParentAndDeletedAtIsNull(
                     String name,
                     Folder parent);

       // Search for specific folder
       Optional<Folder> findByFolderIdAndTownTownIdAndDeletedAtIsNull(
                     UUID folderId,
                     UUID townId);

       // Search for "restore" in the trash can.
       Optional<Folder> findByFolderIdAndTownTownIdAndDeletedAtIsNotNull(
                     UUID folderId,
                     UUID towshipId);

       List<Folder> findByTownTownId(UUID townId);

       List<Folder> findByParent(Folder parent);

       // QUERY RECURSIVA PARA BUSCAR TODAS AS SUBPASTAS (PostgreSQL/MySQL 8.0+)
       @Query(value = """
                     WITH RECURSIVE subfolder_tree AS (
                         SELECT folder_id, parent_id, name, town_id, favorite,
                                created_by, updated_by, deleted_by, created_at, updated_at, deleted_at
                         FROM tb_folders
                         WHERE folder_id = :folderId

                         UNION ALL

                         SELECT f.folder_id, f.parent_id, f.name, f.town_id, f.favorite,
                                f.created_by, f.updated_by, f.deleted_by, f.created_at, f.updated_at, f.deleted_at
                         FROM tb_folders f
                         INNER JOIN subfolder_tree st ON f.parent_id = st.folder_id
                     )
                     SELECT * FROM subfolder_tree WHERE folder_id != :folderId AND deleted_at IS NULL
                     """, nativeQuery = true)
       List<Folder> findAllChildFoldersRecursive(@Param("folderId") UUID folderId);

       // QUERY RECURSIVA PARA BUSCAR TODAS AS PASTAS PAI (até a raiz)
       @Query(value = """
                     WITH RECURSIVE parent_tree AS (
                         SELECT folder_id, parent_id, name, town_id, favorite,
                                created_by, updated_by, deleted_by, created_at, updated_at, deleted_at
                         FROM tb_folders
                         WHERE folder_id = :folderId

                         UNION ALL

                         SELECT f.folder_id, f.parent_id, f.name, f.town_id, f.favorite,
                                f.created_by, f.updated_by, f.deleted_by, f.created_at, f.updated_at, f.deleted_at
                         FROM tb_folders f
                         INNER JOIN parent_tree pt ON f.folder_id = pt.parent_id
                     )
                     SELECT * FROM parent_tree WHERE folder_id != :folderId AND deleted_at IS NULL
                     """, nativeQuery = true)
       List<Folder> findAllParentFoldersRecursive(@Param("folderId") UUID folderId);

       // OPCIONAL: Buscar com permissões já carregadas
       @Query("SELECT f FROM Folder f LEFT JOIN FETCH f.permissions WHERE f.parent = :parent AND f.deletedAt IS NULL")
       List<Folder> findByParentWithPermissions(@Param("parent") Folder parent);
}
