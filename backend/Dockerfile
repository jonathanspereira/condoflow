# 1. Estágio de Build usando Maven Global
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

LABEL authors="jonathan"

WORKDIR /app

# Copia todo o código-fonte
COPY . .

# Executa o build usando o maven instalado globalmente na imagem
RUN mvn clean package -DskipTests

# 2. Estágio de Execução
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copia o jar gerado do estágio anterior
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]