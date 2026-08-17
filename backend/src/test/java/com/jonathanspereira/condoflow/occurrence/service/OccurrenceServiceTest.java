package com.jonathanspereira.condoflow.occurrence.service;

import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceRequestDTO;
import com.jonathanspereira.condoflow.occurrence.dto.OccurrenceResponseDTO;
import com.jonathanspereira.condoflow.occurrence.entity.Occurrence;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceCategory;
import com.jonathanspereira.condoflow.occurrence.entity.OccurrenceStatus;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceAttachmentRepository;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceMessageRepository;
import com.jonathanspereira.condoflow.occurrence.repository.OccurrenceRepository;
import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import com.jonathanspereira.condoflow.user.entity.User;
import com.jonathanspereira.condoflow.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OccurrenceServiceTest {

    @Mock private OccurrenceRepository occurrenceRepository;
    @Mock private OccurrenceMessageRepository occurrenceMessageRepository;
    @Mock private OccurrenceAttachmentRepository occurrenceAttachmentRepository;
    @Mock private CondominiumRepository condominiumRepository;
    @Mock private UserRepository userRepository;
    @Mock private UnitRepository unitRepository;

    @InjectMocks
    private OccurrenceService occurrenceService;

    private User mockUser;
    private Unit mockUnit;
    private Condominium mockCondominium;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId("user-1");
        mockUser.setEmail("test@email.com");

        mockCondominium = new Condominium();
        mockCondominium.setId(1L);

        mockUnit = new Unit();
        mockUnit.setId(1L);
        mockUnit.setCondominiumId(1L);
    }

    @Test
    void create_WithValidData_ShouldSaveAndReturnResponse() {
        OccurrenceRequestDTO request = new OccurrenceRequestDTO("Vazamento", "Água caindo", OccurrenceCategory.MANUTENCAO);

        when(userRepository.findByEmail("test@email.com")).thenReturn(mockUser);
        when(unitRepository.findByOwnerId("user-1")).thenReturn(Optional.of(mockUnit));
        when(condominiumRepository.findById(1L)).thenReturn(Optional.of(mockCondominium));

        Occurrence savedOccurrence = new Occurrence();
        savedOccurrence.setId(10L);
        savedOccurrence.setTitle("Vazamento");
        savedOccurrence.setCategory(OccurrenceCategory.MANUTENCAO);
        savedOccurrence.setStatus(OccurrenceStatus.OPEN);
        savedOccurrence.setCreatedAt(LocalDateTime.now());
        savedOccurrence.setCondominium(mockCondominium);
        savedOccurrence.setUnit(mockUnit);
        when(occurrenceRepository.save(any(Occurrence.class))).thenReturn(savedOccurrence);

        OccurrenceResponseDTO response = occurrenceService.create("test@email.com", request);

        assertNotNull(response);
        assertEquals("10", response.id());
        assertEquals("Vazamento", response.title());
        assertEquals(OccurrenceStatus.OPEN.name(), response.status());
        verify(occurrenceRepository, times(1)).save(any(Occurrence.class));
    }

    @Test
    void create_UserWithoutUnit_ShouldThrowException() {
        OccurrenceRequestDTO request = new OccurrenceRequestDTO("Vazamento", "Água caindo", OccurrenceCategory.MANUTENCAO);

        when(userRepository.findByEmail("test@email.com")).thenReturn(mockUser);
        when(unitRepository.findByOwnerId("user-1")).thenReturn(Optional.empty());
        when(unitRepository.findByTenantId("user-1")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> occurrenceService.create("test@email.com", request));
    }
}
