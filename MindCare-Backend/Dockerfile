FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copiar archivos de Maven
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Dar permisos y compilar (saltando tests de BD)
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Imagen final de ejecución
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar backend.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx2048M", "-jar", "backend.jar"]
