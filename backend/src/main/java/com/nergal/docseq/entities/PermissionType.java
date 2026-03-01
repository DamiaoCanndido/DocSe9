package com.nergal.docseq.entities;

public enum PermissionType {
    READ(1),
    WRITE(2),
    DELETE(3);

    private final int level;

    PermissionType(int level) {
        this.level = level;
    }

    public boolean implies(PermissionType other) {
        return this.level >= other.level;
    }
}
