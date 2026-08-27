package com.jonathanspereira.condoflow.unit.service;

import com.jonathanspereira.condoflow.common.exception.BusinessException;
import com.jonathanspereira.condoflow.unit.dto.UnitRequestDTO;
import com.jonathanspereira.condoflow.unit.dto.UnitResponseDTO;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

@Service
public class UnitImportService {

    private final UnitService unitService;

    public UnitImportService(UnitService unitService) {
        this.unitService = unitService;
    }

    public List<UnitResponseDTO> importFile(MultipartFile file, Long condominiumId) {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new BusinessException("Arquivo inválido");
        }

        List<UnitRequestDTO> requests = new ArrayList<>();

        try {
            if (filename.toLowerCase().endsWith(".csv")) {
                Reader reader = new InputStreamReader(file.getInputStream());
                CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT);
                boolean isHeader = true;
                for (CSVRecord record : parser) {
                    if (isHeader) {
                        isHeader = false;
                        continue;
                    }
                    if (record.size() >= 3) {
                        String unidade = record.get(0).trim();
                        String nome = record.get(1).trim();
                        String email = record.get(2).trim();
                        String nomeInq = record.size() > 3 ? record.get(3).trim() : "";
                        String emailInq = record.size() > 4 ? record.get(4).trim() : "";

                        if (!unidade.isBlank()) {
                            requests.add(parseRecord(unidade, nome, email, nomeInq, emailInq));
                        }
                    }
                }
            } else if (filename.toLowerCase().endsWith(".xls") || filename.toLowerCase().endsWith(".xlsx")) {
                Workbook workbook = WorkbookFactory.create(file.getInputStream());
                Sheet sheet = workbook.getSheetAt(0);
                boolean isHeader = true;
                for (Row row : sheet) {
                    if (isHeader) {
                        isHeader = false;
                        continue;
                    }
                    String unidade = getCellString(row.getCell(0));
                    String nome = getCellString(row.getCell(1));
                    String email = getCellString(row.getCell(2));
                    String nomeInq = getCellString(row.getCell(3));
                    String emailInq = getCellString(row.getCell(4));

                    if (unidade != null && !unidade.isBlank()) {
                        requests.add(parseRecord(unidade, nome, email, nomeInq, emailInq));
                    }
                }
            } else {
                throw new BusinessException("Formato de arquivo não suportado. Use .csv, .xls ou .xlsx");
            }
        } catch (Exception e) {
            throw new BusinessException("Erro ao processar arquivo: " + e.getMessage());
        }

        return unitService.salvarEmMassa(condominiumId, requests)
                .stream()
                .map(UnitResponseDTO::from)
                .collect(java.util.stream.Collectors.toList());
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double value = cell.getNumericCellValue();
                if (value == Math.floor(value)) {
                    yield String.valueOf((long) value);
                } else {
                    yield String.valueOf(value);
                }
            }
            default -> "";
        };
    }

    private UnitRequestDTO parseRecord(String unitName, String ownerName, String ownerEmail, String tenantName, String tenantEmail) {
        UnitRequestDTO dto = new UnitRequestDTO();
        dto.setUnit(unitName);
        dto.setOwnerName(ownerName);
        dto.setOwnerEmail(ownerEmail);
        if ((tenantName != null && !tenantName.isBlank()) || (tenantEmail != null && !tenantEmail.isBlank())) {
            dto.setRented(true);
            dto.setTenantName(tenantName);
            dto.setTenantEmail(tenantEmail);
        } else {
            dto.setRented(false);
        }
        return dto;
    }
}
