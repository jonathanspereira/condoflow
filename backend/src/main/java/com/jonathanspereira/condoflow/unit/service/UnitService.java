package com.jonathanspereira.condoflow.unit.service;

import com.jonathanspereira.condoflow.unit.entity.Unit;
import com.jonathanspereira.condoflow.unit.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UnitService {

    @Autowired
    private UnitRepository unitRepository;

    public List<Unit> listarPorCondominio(Long condominiumId) {
        return unitRepository.findByCondominiumId(condominiumId);
    }

    public Optional<Unit> buscarPorId(Long id) {
        return unitRepository.findById(id);
    }

    public Unit salvar(Long condominiumId, Unit unitData) {
        unitData.setCondominiumId(condominiumId);
        return unitRepository.save(unitData);
    }

    public Unit atualizar(Long id, Unit unitData) {
        return unitRepository.findById(id).map(unit -> {
            unit.setUnit(unitData.getUnit());
            unit.setName(unitData.getName());
            unit.setEmail(unitData.getEmail());
            if (unitData.getRole() != null) {
                unit.setRole(unitData.getRole());
            }
            return unitRepository.save(unit);
        }).orElseThrow(() -> new RuntimeException("Unidade não encontrada com o ID: " + id));
    }

    public void deletar(Long id) {
        unitRepository.deleteById(id);
    }
}