package com.nergal.docseq.entities;

public enum PermissionType {
    READ(1),
    WRITE(2),
    SHARE(3),
    DELETE(4);

    private final int level;

    PermissionType(int level) {
        this.level = level;
    }

    public boolean implies(PermissionType other) {
        return this.level >= other.level;
    }
}
