    package com.jonathanspereira.condoflow.condominium.entity;

    import jakarta.persistence.*;
    import lombok.Data;

    import java.time.LocalDateTime;

    @Data
    @Entity
    @Table(name = "condominium")
    @NoArgsConstructor
    @AllArgsConstructor
    public class Condominium {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String name;

        @Column(nullable = false, unique = true)
        private String cnpj; // <-- Garanta que este campo existe na entidade

        private String address;
    }
