package com.nergal.docseq.dto.search;

import com.nergal.docseq.dto.nodes.NodeResponseDTO;
import java.util.List;

public record SearchV2ResponseDTO(
                List<NodeResponseDTO> folders, // These will be nodes with nodeType FOLDER
                List<NodeResponseDTO> files // These will be nodes with nodeType FILE
) {
}
