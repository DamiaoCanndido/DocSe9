package com.nergal.docseq.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nergal.docseq.entities.Folder;
import com.nergal.docseq.entities.FolderPermission;
import com.nergal.docseq.entities.FolderPermission.FolderPermissionType;
import com.nergal.docseq.entities.User;
import com.nergal.docseq.exception.NotFoundException;
import com.nergal.docseq.repositories.FolderPermissionRepository;
import com.nergal.docseq.repositories.FolderRepository;
import com.nergal.docseq.repositories.UserRepository;

@Service
public class FolderPermissionService {

    private final FolderPermissionRepository repository;
    private final UserRepository userRepository;
    private final FolderRepository folderRepository;

    public FolderPermissionService(
        FolderPermissionRepository repository, 
        UserRepository userRepository,
        FolderRepository folderRepository) {
            this.repository = repository;
            this.userRepository = userRepository;
            this.folderRepository = folderRepository;
    }

    public void check(
        UUID userId,
        UUID folderId,
        FolderPermissionType permission
    ) {
        boolean allowed = repository
            .existsByUserUserIdAndFolderFolderIdAndPermission(
                    userId,
                    folderId,
                    permission
            );

        if (!allowed) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Permission denied"
            );
        }
    }

    @Transactional
    public void grantCascade(
        UUID userId,
        UUID folderId,
        FolderPermissionType permission
    ) {

        User user = userRepository.getReferenceById(userId);
        Folder root = folderRepository.findById(folderId)
            .orElseThrow(() -> new NotFoundException(
                    "Folder not found"
            ));

        grantRecursively(user, root, permission);
    }

    private void grantRecursively(
        User user,
        Folder folder,
        FolderPermissionType permission
    ) {

        boolean exists =
            repository.existsByUserUserIdAndFolderFolderIdAndPermission(
                user.getUserId(),
                folder.getFolderId(),
                permission
            );

        if (!exists) {
            FolderPermission fp = new FolderPermission();
            fp.setUser(user);
            fp.setFolder(folder);
            fp.setPermission(permission);

            repository.save(fp);
        }

        List<Folder> children =
            folderRepository.findByParentFolderIdAndDeletedAtIsNull(
                folder.getFolderId()
        );

        for (Folder child : children) {
            grantRecursively(user, child, permission);
        }
    }

    @Transactional
    public void revokeCascade(
        UUID userId,
        UUID folderId,
        FolderPermissionType permission
    ) {

        Folder root = folderRepository.findById(folderId)
            .orElseThrow(() -> new NotFoundException(
                    "Folder not found"
            ));

        revokeRecursively(userId, root, permission);
    }

    private void revokeRecursively(
        UUID userId,
        Folder folder,
        FolderPermissionType permission
    ) {

        repository.deleteByUserUserIdAndFolderFolderIdAndPermission(
            userId,
            folder.getFolderId(),
            permission
        );

        List<Folder> children =
            folderRepository.findByParentFolderIdAndDeletedAtIsNull(
                    folder.getFolderId()
            );

        for (Folder child : children) {
            revokeRecursively(userId, child, permission);
        }
    }
}

