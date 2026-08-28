package com.jonathanspereira.condoflow.condominium.service;
import com.jonathanspereira.condoflow.condominium.entity.Condominium;
import com.jonathanspereira.condoflow.condominium.repository.CondominiumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CondominiumService {

    @Autowired
    private CondominiumRepository condominiumRepository;

    public List<Condominium> listarTodos() {
        return condominiumRepository.findAll();
    }

    public Optional<Condominium> buscarPorId(Long id) {
        return condominiumRepository.findById(id);
    }

    public Condominium salvar(Condominium condominium) {
        return condominiumRepository.save(condominium);
    }

    public Condominium atualizar(Long id, Condominium condominiumData) {
        return condominiumRepository.findById(id).map(condo -> {
            condo.setName(condominiumData.getName());
            condo.setCnpj(condominiumData.getCnpj());
            condo.setStreet(condominiumData.getStreet());
            condo.setNumber(condominiumData.getNumber());
            condo.setZipCode(condominiumData.getZipCode());
            condo.setNeighborhood(condominiumData.getNeighborhood());
            condo.setCity(condominiumData.getCity());
            condo.setState(condominiumData.getState());
            return condominiumRepository.save(condo);
        }).orElseThrow(() -> new RuntimeException("Condomínio não encontrado com o ID: " + id));
    }

    public void deletar(Long id) {
        condominiumRepository.deleteById(id);
    }
}