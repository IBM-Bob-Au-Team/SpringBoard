# Deployment Guide - Modernized Spring Boot Application

## Overview

This guide provides instructions for building, running, and deploying the modernized Spring Boot 3.1.5 application with Java 17.

## Prerequisites

### Required Software
- **Java 17 JDK** (OpenJDK or Eclipse Temurin recommended)
- **Maven 3.6+** for building the application
- **Docker** (optional, for containerized deployment)
- **Git** for version control

### Verify Installation

```bash
# Check Java version (must be 17)
java -version

# Check Maven version (must be 3.6+)
mvn -version

# Check Docker version (optional)
docker --version
```

Expected Java output:
```
openjdk version "17.0.x" or
Eclipse Temurin version "17.0.x"
```

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SpringBoard/legacy-app/spring-boot-2-sample-app
```

### 2. Build the Application

#### Using Maven

```bash
# Clean and build the application
mvn clean package

# Skip tests if needed (not recommended)
mvn clean package -DskipTests
```

**Build Output:**
- JAR file location: `target/spring-boot-sample-actuator-3.1.5.jar`
- Build time: ~30-60 seconds (first build may take longer)

#### Build Verification

```bash
# Verify JAR was created
ls -lh target/*.jar

# Check JAR contents
jar tf target/spring-boot-sample-actuator-3.1.5.jar | head -20
```

### 3. Run the Application

#### Method 1: Using Maven Spring Boot Plugin (Development)

```bash
mvn spring-boot:run
```

#### Method 2: Using Java JAR (Production-like)

```bash
java -jar target/spring-boot-sample-actuator-3.1.5.jar
```

#### Method 3: With Custom JVM Options

```bash
java -Xmx512m -Xms256m \
     -Dserver.port=8080 \
     -jar target/spring-boot-sample-actuator-3.1.5.jar
```

### 4. Verify Application is Running

```bash
# Check application health
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP","components":{"db":{"status":"UP"},...}}

# Test main endpoint
curl http://localhost:8080/

# Expected response:
# {"message":"Hello World"}
```

## Docker Deployment

### 1. Build Docker Image

#### Using Provided Dockerfile

```bash
# Navigate to application directory
cd legacy-app/spring-boot-2-sample-app

# Build Docker image
docker build -t spring-boot-actuator:3.1.5 .

# Verify image was created
docker images | grep spring-boot-actuator
```

#### Multi-stage Build (Optimized)

```dockerfile
# Dockerfile content
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/spring-boot-sample-actuator-3.1.5.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. Run Docker Container

#### Basic Run

```bash
docker run -p 8080:8080 spring-boot-actuator:3.1.5
```

#### Run with Environment Variables

```bash
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e JAVA_OPTS="-Xmx512m -Xms256m" \
  spring-boot-actuator:3.1.5
```

#### Run in Detached Mode

```bash
docker run -d \
  --name spring-boot-app \
  -p 8080:8080 \
  --restart unless-stopped \
  spring-boot-actuator:3.1.5

# View logs
docker logs -f spring-boot-app

# Stop container
docker stop spring-boot-app

# Remove container
docker rm spring-boot-app
```

### 3. Docker Compose (Recommended for Development)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    image: spring-boot-actuator:3.1.5
    container_name: spring-boot-app
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - JAVA_OPTS=-Xmx512m -Xms256m
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
```

Run with Docker Compose:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Production Deployment

### Environment Requirements

#### System Requirements
- **CPU:** 2+ cores recommended
- **RAM:** 1GB minimum, 2GB recommended
- **Disk:** 500MB for application + logs
- **OS:** Linux (Ubuntu 20.04+, RHEL 8+, or similar)

#### Network Requirements
- **Port 8080:** Application HTTP port
- **Outbound:** Internet access for dependency downloads (build time)

### Configuration

#### Application Properties

Create `application-prod.properties`:

```properties
# Server Configuration
server.port=8080
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s

# Actuator Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
management.metrics.export.prometheus.enabled=true

# Logging Configuration
logging.level.root=INFO
logging.level.sample.actuator=INFO
logging.file.name=/var/log/spring-boot-app/application.log
logging.file.max-size=10MB
logging.file.max-history=30

# Database Configuration (H2 in-memory)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.h2.console.enabled=false
```

#### JVM Options for Production

```bash
# Recommended JVM options
JAVA_OPTS="-Xmx1g \
           -Xms512m \
           -XX:+UseG1GC \
           -XX:MaxGCPauseMillis=200 \
           -XX:+HeapDumpOnOutOfMemoryError \
           -XX:HeapDumpPath=/var/log/spring-boot-app/heapdump.hprof \
           -Dspring.profiles.active=prod"
```

### Systemd Service (Linux)

Create `/etc/systemd/system/spring-boot-app.service`:

```ini
[Unit]
Description=Spring Boot Actuator Application
After=network.target

[Service]
Type=simple
User=springboot
Group=springboot
WorkingDirectory=/opt/spring-boot-app
ExecStart=/usr/bin/java -jar /opt/spring-boot-app/spring-boot-sample-actuator-3.1.5.jar
SuccessExitStatus=143
TimeoutStopSec=30
Restart=on-failure
RestartSec=10

# Environment
Environment="JAVA_OPTS=-Xmx1g -Xms512m"
Environment="SPRING_PROFILES_ACTIVE=prod"

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=spring-boot-app

[Install]
WantedBy=multi-user.target
```

Manage the service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable spring-boot-app

# Start service
sudo systemctl start spring-boot-app

# Check status
sudo systemctl status spring-boot-app

# View logs
sudo journalctl -u spring-boot-app -f

# Stop service
sudo systemctl stop spring-boot-app

# Restart service
sudo systemctl restart spring-boot-app
```

## Cloud Deployment

### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p docker spring-boot-app

# Create environment
eb create production

# Deploy
eb deploy

# Open application
eb open
```

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/spring-boot-app

# Deploy to Cloud Run
gcloud run deploy spring-boot-app \
  --image gcr.io/PROJECT_ID/spring-boot-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name spring-boot-rg --location eastus

# Create container instance
az container create \
  --resource-group spring-boot-rg \
  --name spring-boot-app \
  --image spring-boot-actuator:3.1.5 \
  --dns-name-label spring-boot-app-unique \
  --ports 8080
```

## Kubernetes Deployment

### Deployment YAML

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-boot-app
  labels:
    app: spring-boot-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-boot-app
  template:
    metadata:
      labels:
        app: spring-boot-app
    spec:
      containers:
      - name: spring-boot-app
        image: spring-boot-actuator:3.1.5
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "kubernetes"
        - name: JAVA_OPTS
          value: "-Xmx512m -Xms256m"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: spring-boot-service
spec:
  selector:
    app: spring-boot-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

Deploy to Kubernetes:

```bash
# Apply deployment
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/spring-boot-app

# Scale deployment
kubectl scale deployment spring-boot-app --replicas=5
```

## Monitoring & Health Checks

### Actuator Endpoints

```bash
# Health check
curl http://localhost:8080/actuator/health

# Detailed health (requires authentication in prod)
curl http://localhost:8080/actuator/health/liveness
curl http://localhost:8080/actuator/health/readiness

# Application info
curl http://localhost:8080/actuator/info

# Metrics
curl http://localhost:8080/actuator/metrics
curl http://localhost:8080/actuator/metrics/jvm.memory.used
```

### Prometheus Integration

Add to `application.properties`:

```properties
management.metrics.export.prometheus.enabled=true
management.endpoints.web.exposure.include=health,info,metrics,prometheus
```

Scrape endpoint:
```bash
curl http://localhost:8080/actuator/prometheus
```

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check Java version
java -version

# Check if port is already in use
lsof -i :8080
netstat -tuln | grep 8080

# Run with debug logging
java -jar app.jar --debug
```

#### Out of Memory Errors

```bash
# Increase heap size
java -Xmx2g -Xms1g -jar app.jar

# Enable heap dump on OOM
java -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/tmp/heapdump.hprof \
     -jar app.jar
```

#### Docker Container Issues

```bash
# Check container logs
docker logs spring-boot-app

# Execute shell in container
docker exec -it spring-boot-app sh

# Check container resource usage
docker stats spring-boot-app
```

### Log Locations

- **Local Development:** Console output
- **JAR Execution:** Console output or configured log file
- **Docker:** `docker logs <container-name>`
- **Systemd:** `journalctl -u spring-boot-app`
- **Kubernetes:** `kubectl logs <pod-name>`

## Performance Tuning

### JVM Tuning

```bash
# For 2GB RAM server
JAVA_OPTS="-Xmx1536m \
           -Xms768m \
           -XX:+UseG1GC \
           -XX:MaxGCPauseMillis=200 \
           -XX:ParallelGCThreads=4 \
           -XX:ConcGCThreads=2"

# For 4GB RAM server
JAVA_OPTS="-Xmx3g \
           -Xms1536m \
           -XX:+UseG1GC \
           -XX:MaxGCPauseMillis=200"
```

### Application Tuning

```properties
# Thread pool configuration
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=10

# Connection timeout
server.tomcat.connection-timeout=20000

# Compression
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml,text/html,text/xml,text/plain
```

## Security Considerations

### Production Checklist

- [ ] Disable H2 console in production
- [ ] Restrict actuator endpoints
- [ ] Enable HTTPS/TLS
- [ ] Configure authentication for sensitive endpoints
- [ ] Set up firewall rules
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

### Secure Actuator Endpoints

```properties
# Restrict actuator exposure
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when-authorized

# Require authentication
spring.security.user.name=admin
spring.security.user.password=${ADMIN_PASSWORD}
```

## Backup & Recovery

### Application State
- H2 database is in-memory (no persistence)
- No file-based state to backup
- Configuration files should be version controlled

### Disaster Recovery
1. Keep Docker images tagged and versioned
2. Maintain configuration in version control
3. Document deployment procedures
4. Test rollback procedures regularly

## Support & Resources

### Documentation
- Spring Boot 3.x: https://docs.spring.io/spring-boot/docs/3.1.5/reference/html/
- Java 17: https://docs.oracle.com/en/java/javase/17/
- Docker: https://docs.docker.com/

### Monitoring
- Application logs: Check configured log location
- Actuator endpoints: http://localhost:8080/actuator
- System metrics: Use Prometheus + Grafana

---

**Last Updated:** 2026-05-02  
**Version:** 3.1.5  
**Maintained By:** SpringBoard Team