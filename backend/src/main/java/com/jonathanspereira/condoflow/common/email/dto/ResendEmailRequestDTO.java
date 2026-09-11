package com.jonathanspereira.condoflow.common.email.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ResendEmailRequestDTO {
    private String from;
    private List<String> to;
    private String subject;
    private String html;
}
