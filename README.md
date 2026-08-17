# condoflow
O CondoFlow é uma plataforma voltada para a gestão de ocorrências em condomínios, desenhada para atender tanto moradores quanto síndicos profissionais que gerenciam múltiplas unidades. O foco central é a transparência, a rastreabilidade e a privacidade.

## Arquitetura de Dados (UML)

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String password
        +Role role
    }
    
    class Condominium {
        +Long id
        +String name
        +String address
        +String document
    }
    
    class CondominiumManager {
        +Long id
        +Boolean focusModeEnabled
    }
    
    class Unit {
        +Long id
        +String name
        +String block
        +Boolean isRented
    }
    
    class Occurrence {
        +Long id
        +String title
        +String description
        +String protocolNumber
        +String response
        +OccurrenceStatus status
        +OccurrenceCategory category
        +LocalDateTime createdAt
    }
    
    class OccurrenceMessage {
        +Long id
        +String message
        +LocalDateTime createdAt
    }
    
    class OccurrenceAttachment {
        +Long id
        +String fileName
        +String fileType
        +String filePath
    }
    
    class PasswordResetToken {
        +Long id
        +String token
        +LocalDateTime expiryDate
    }

    User "1" -- "0..*" PasswordResetToken : has
    User "1" -- "0..1" Condominium : belongs to
    
    Condominium "1" -- "0..*" CondominiumManager : managed by
    User "1" -- "0..*" CondominiumManager : acts as sindico
    
    Condominium "1" -- "0..*" Unit : contains
    User "1" -- "0..*" Unit : owns
    User "0..1" -- "0..*" Unit : rents
    
    User "1" -- "0..*" Occurrence : reports
    Condominium "1" -- "0..*" Occurrence : happens at
    
    Occurrence "1" -- "0..*" OccurrenceMessage : contains
    User "1" -- "0..*" OccurrenceMessage : sends
    
    Occurrence "1" -- "0..*" OccurrenceAttachment : has attached
```

## SonarCloud 
[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=jonathanspereira_condoflow)