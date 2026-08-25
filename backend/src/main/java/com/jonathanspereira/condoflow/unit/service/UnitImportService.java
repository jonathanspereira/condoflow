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
                CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim());
                for (CSVRecord record : parser) {
                    requests.add(parseRecord(
                            record.get("bloco"),
                            record.get("numero"),
                            record.get("nome"),
                            record.get("email")
                    ));
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
                    String bloco = getCellString(row.getCell(0));
                    String numero = getCellString(row.getCell(1));
                    String nome = getCellString(row.getCell(2));
                    String email = getCellString(row.getCell(3));

                    if (numero != null && !numero.isBlank()) {
                        requests.add(parseRecord(bloco, numero, nome, email));
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
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            default -> "";
        };
    }

    private UnitRequestDTO parseRecord(String block, String number, String ownerName, String ownerEmail) {
        UnitRequestDTO dto = new UnitRequestDTO();
        dto.setUnit((block != null && !block.isBlank() ? block + " " : "") + number);
        dto.setOwnerName(ownerName);
        dto.setOwnerEmail(ownerEmail);
        return dto;
    }
}
