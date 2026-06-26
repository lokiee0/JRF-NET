package com.jrfos.dto.request;

import com.jrfos.enums.PaperType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating or updating a subject.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectRequest {

    @NotBlank(message = "Subject name is required")
    private String name;

    @NotNull(message = "Paper type is required")
    private PaperType paperType;

    private String description;

    private Integer displayOrder;
}
