package com.nergal.docseq.entities;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_township")
public class Township {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "township_id")
    private UUID townshipId;

    @Column
    private String name;

    @Column(length = 2)
    private String uf;

    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(
        mappedBy = "township",
        cascade = CascadeType.REMOVE,
        orphanRemoval = true
    )
    private List<User> users;

    public UUID getTownshipId() {
        return townshipId;
    }

    public void setTownshipId(UUID townshipId) {
        this.townshipId = townshipId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
