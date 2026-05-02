# Spring Boot 3.x Deployment Guide

## Overview
This guide provides comprehensive instructions for building, testing, and deploying the modernized Spring Boot 3.1.5 Actuator sample application using Docker.

---

## Prerequisites

### Required Software
- **Java 17** or higher (JDK)
- **Maven 3.9+** (for local builds)
- **Docker 20.10+** (for containerized deployment)
- **Docker Compose 2.0+** (optional, for orchestration)

### Verify Prerequisites
```bash
# Check Java version
java -version
# Should show: openjdk version "17.x.x" or higher

# Check Maven version
mvn -version
# Should show: Apache Maven 3.9.x or higher

# Check Docker version
docker --version
# Should show: Docker version 20.10.x or higher

# Check Docker Compose version (optional)
docker compose version
# Should show: Docker Compose version 2.x.x or higher
```

---

## Local Development Build

### 1. Build with Maven
```bash
# Navigate to project directory
cd legacy-app/spring-boot-2-sample-app

# Clean and build the project
mvn clean package

# Run tests
mvn test

# Run integration tests
mvn verify
```

### 2. Run Locally (Without Docker)
```bash
# Run the application
java -jar target/spring-boot-sample-actuator-3.1.5.jar

# Or use Maven Spring Boot plugin
mvn spring-boot:run
```

### 3. Access the Application
- **Main Endpoint**: http://localhost:8080/
- **Health Check**: http://localhost:8080/actuator/health
- **Info Endpoint**: http://localhost:8080/actuator/info
- **All Actuator Endpoints**: http://localhost:8080/actuator

---

## Docker Deployment

### Build Docker Image

#### Option 1: Standard Build
```bash
# Navigate to project directory
cd legacy-app/spring-boot-2-sample-app

# Build Docker image
docker build -t spring-boot-actuator-sample:3.1.5 .

# Verify image was created
docker images | grep spring-boot-actuator-sample
```

#### Option 2: Build with Custom Tag
```bash
# Build with custom registry and tag
docker build -t myregistry.com/spring-boot-actuator-sample:3.1.5 .

# Build with latest tag
docker build -t spring-boot-actuator-sample:latest .
```

#### Option 3: Multi-Platform Build (ARM64 + AMD64)
```bash
# Create and use buildx builder
docker buildx create --name multiplatform-builder --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t spring-boot-actuator-sample:3.1.5 \
  --push \
  .
```

### Build Process Details
The Dockerfile uses a **multi-stage build**:

1. **Build Stage** (`MAVEN_TOOL_CHAIN`):
   - Uses `maven:3.9-eclipse-temurin-17-alpine`
   - Downloads dependencies
   - Compiles and packages the application
   - Creates executable JAR file

2. **Runtime Stage**:
   - Uses `eclipse-temurin:17-jdk-alpine`
   - Creates non-root user for security
   - Copies only the JAR file from build stage
   - Configures health check
   - Runs as non-root user

---

## Running the Docker Container

### Basic Run
```bash
# Run container in foreground
docker run -p 8080:8080 spring-boot-actuator-sample:3.1.5

# Run container in background (detached mode)
docker run -d -p 8080:8080 --name spring-actuator spring-boot-actuator-sample:3.1.5
```

### Run with Custom Configuration
```bash
# Run with environment variables
docker run -d \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=production \
  -e SERVER_PORT=8080 \
  --name spring-actuator \
  spring-boot-actuator-sample:3.1.5

# Run with custom application.properties
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/custom-application.properties:/app/application.properties \
  --name spring-actuator \
  spring-boot-actuator-sample:3.1.5
```

### Run with Resource Limits
```bash
# Run with memory and CPU limits
docker run -d \
  -p 8080:8080 \
  --memory="512m" \
  --cpus="1.0" \
  --name spring-actuator \
  spring-boot-actuator-sample:3.1.5
```

### Run with Logging
```bash
# Run with log driver
docker run -d \
  -p 8080:8080 \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  --name spring-actuator \
  spring-boot-actuator-sample:3.1.5
```

---

## Container Management

### View Running Containers
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a
```

### View Container Logs
```bash
# View logs (follow mode)
docker logs -f spring-actuator

# View last 100 lines
docker logs --tail 100 spring-actuator

# View logs with timestamps
docker logs -t spring-actuator
```

### Stop and Remove Container
```bash
# Stop container
docker stop spring-actuator

# Remove container
docker rm spring-actuator

# Stop and remove in one command
docker rm -f spring-actuator
```

### Execute Commands in Container
```bash
# Open shell in running container
docker exec -it spring-actuator sh

# Check Java version in container
docker exec spring-actuator java -version

# View application logs
docker exec spring-actuator cat /tmp/logs/app.log
```

---

## Health Check Verification

### Docker Health Check
The container includes an automatic health check that runs every 30 seconds:

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' spring-actuator

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' spring-actuator
```

Health check configuration:
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Start Period**: 40 seconds (grace period for application startup)
- **Retries**: 3 attempts before marking unhealthy

### Manual Health Check
```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP","components":{"db":{"status":"UP"},...}}

# Check from within container
docker exec spring-actuator wget -qO- http://localhost:8080/actuator/health
```

---

## Docker Compose Deployment

### Create docker-compose.yml
```yaml
version: '3.8'

services:
  spring-actuator:
    build:
      context: .
      dockerfile: Dockerfile
    image: spring-boot-actuator-sample:3.1.5
    container_name: spring-actuator
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - JAVA_OPTS=-Xmx512m -Xms256m
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 3s
      start_period: 40s
      retries: 3
    restart: unless-stopped
    networks:
      - spring-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  spring-network:
    driver: bridge
```

### Deploy with Docker Compose
```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild and restart
docker compose up -d --build
```

---

## Production Deployment

### Push to Container Registry

#### Docker Hub
```bash
# Login to Docker Hub
docker login

# Tag image
docker tag spring-boot-actuator-sample:3.1.5 username/spring-boot-actuator-sample:3.1.5

# Push image
docker push username/spring-boot-actuator-sample:3.1.5
```

#### Private Registry
```bash
# Login to private registry
docker login myregistry.com

# Tag image
docker tag spring-boot-actuator-sample:3.1.5 myregistry.com/spring-boot-actuator-sample:3.1.5

# Push image
docker push myregistry.com/spring-boot-actuator-sample:3.1.5
```

### Deploy to Production Server
```bash
# Pull image on production server
docker pull myregistry.com/spring-boot-actuator-sample:3.1.5

# Run with production configuration
docker run -d \
  -p 8080:8080 \
  --name spring-actuator-prod \
  --restart=always \
  --memory="1g" \
  --cpus="2.0" \
  -e SPRING_PROFILES_ACTIVE=production \
  -e JAVA_OPTS="-Xmx768m -Xms512m" \
  --log-driver json-file \
  --log-opt max-size=50m \
  --log-opt max-file=5 \
  myregistry.com/spring-boot-actuator-sample:3.1.5
```

---

## Kubernetes Deployment

### Create Kubernetes Manifests

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-actuator
  labels:
    app: spring-actuator
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-actuator
  template:
    metadata:
      labels:
        app: spring-actuator
    spec:
      containers:
      - name: spring-actuator
        image: spring-boot-actuator-sample:3.1.5
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 40
          periodSeconds: 30
          timeoutSeconds: 3
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
```

#### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: spring-actuator-service
spec:
  selector:
    app: spring-actuator
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

### Deploy to Kubernetes
```bash
# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/spring-actuator

# Scale deployment
kubectl scale deployment spring-actuator --replicas=5
```

---

## Monitoring and Troubleshooting

### View Application Metrics
```bash
# Access Actuator endpoints
curl http://localhost:8080/actuator
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/info
curl http://localhost:8080/actuator/metrics
curl http://localhost:8080/actuator/env
```

### Common Issues

#### Container Won't Start
```bash
# Check container logs
docker logs spring-actuator

# Check if port is already in use
lsof -i :8080

# Try different port
docker run -p 8081:8080 spring-boot-actuator-sample:3.1.5
```

#### Health Check Failing
```bash
# Check health endpoint manually
curl http://localhost:8080/actuator/health

# Increase start period in Dockerfile
# HEALTHCHECK --start-period=60s ...

# Check container logs for errors
docker logs spring-actuator
```

#### Out of Memory
```bash
# Increase container memory
docker run -d -p 8080:8080 --memory="1g" spring-boot-actuator-sample:3.1.5

# Adjust JVM heap size
docker run -d -p 8080:8080 \
  -e JAVA_OPTS="-Xmx768m -Xms512m" \
  spring-boot-actuator-sample:3.1.5
```

---

## Security Best Practices

1. **Non-Root User**: Container runs as non-root user `spring`
2. **Minimal Base Image**: Uses Alpine Linux for smaller attack surface
3. **Health Checks**: Automatic health monitoring enabled
4. **Resource Limits**: Set memory and CPU limits in production
5. **Secrets Management**: Use Docker secrets or environment variables for sensitive data
6. **Network Isolation**: Use Docker networks to isolate containers
7. **Regular Updates**: Keep base images and dependencies updated

---

## Performance Tuning

### JVM Options
```bash
# Optimize for container environment
docker run -d -p 8080:8080 \
  -e JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0" \
  spring-boot-actuator-sample:3.1.5

# Enable GC logging
docker run -d -p 8080:8080 \
  -e JAVA_OPTS="-Xlog:gc*:file=/tmp/gc.log" \
  spring-boot-actuator-sample:3.1.5
```

### Container Resources
```bash
# Production-optimized settings
docker run -d \
  -p 8080:8080 \
  --memory="1g" \
  --memory-reservation="512m" \
  --cpus="2.0" \
  --cpu-shares=1024 \
  spring-boot-actuator-sample:3.1.5
```

---

## Backup and Recovery

### Export Container
```bash
# Export running container
docker export spring-actuator > spring-actuator-backup.tar

# Import container
docker import spring-actuator-backup.tar spring-actuator:backup
```

### Save and Load Images
```bash
# Save image to tar file
docker save spring-boot-actuator-sample:3.1.5 > spring-actuator-image.tar

# Load image from tar file
docker load < spring-actuator-image.tar
```

---

## Additional Resources

- [Spring Boot 3.x Documentation](https://docs.spring.io/spring-boot/docs/3.1.5/reference/html/)
- [Docker Documentation](https://docs.docker.com/)
- [Spring Boot Actuator Guide](https://docs.spring.io/spring-boot/docs/3.1.5/reference/html/actuator.html)
- [Eclipse Temurin](https://adoptium.net/)

---

## Support and Maintenance

For issues or questions:
1. Check application logs: `docker logs spring-actuator`
2. Verify health endpoint: `curl http://localhost:8080/actuator/health`
3. Review CHANGELOG.md for recent changes
4. Consult Spring Boot 3.x migration guide

---

**Last Updated**: 2026-05-02  
**Version**: 3.1.5  
**Maintainer**: Spring Boot Team