# Multi-stage build for Spring Boot 3.x application
FROM maven:3.9-eclipse-temurin-17-alpine AS MAVEN_TOOL_CHAIN
COPY pom.xml /tmp/
RUN mvn -B dependency:go-offline -f /tmp/pom.xml -s /usr/share/maven/ref/settings-docker.xml
COPY src /tmp/src/
WORKDIR /tmp/
RUN mvn -B -s /usr/share/maven/ref/settings-docker.xml package

# Runtime stage with Java 17
FROM eclipse-temurin:17-jdk-alpine

EXPOSE 8080

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create app directory
RUN mkdir /app && chown spring:spring /app

# Copy the built artifact
COPY --from=MAVEN_TOOL_CHAIN /tmp/target/*.jar /app/spring-boot-application.jar

# Change ownership
RUN chown spring:spring /app/spring-boot-application.jar

# Switch to non-root user
USER spring:spring

ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/spring-boot-application.jar"]

# Health check using wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
