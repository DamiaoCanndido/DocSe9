package com.nergal.docseq.dto.files;

import jakarta.validation.constraints.Size;

public record FileUpdateDTO(

                @Size(min = 1, max = 255) String name,

                Boolean favorite) {
}
