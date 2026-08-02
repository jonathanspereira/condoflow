# ---- Estágio 1: build ----
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /build

# Copia primeiro só o pom.xml para cachear as dependências
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Agora copia o código-fonte e builda
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Estágio 2: runtime ----
FROM eclipse-temurin:21-jre-alpine
LABEL authors="jonathan"
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]