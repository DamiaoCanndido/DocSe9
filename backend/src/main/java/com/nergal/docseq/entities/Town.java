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
@Table(name = "tb_town")
public class Town {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "town_id")
    private UUID townId;

    @Column
    private String name;

    @Column(length = 2)
    private String uf;

    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(mappedBy = "town", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<User> users;

    public UUID getTownId() {
        return townId;
    }

    public void setTownId(UUID townId) {
        this.townId = townId;
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
