package com.nergal.docseq.dto.towns;

import java.util.UUID;

public record TownItemDTO(
    UUID townId, 
    String name, 
    String uf, 
    String imageUrl
) { }
