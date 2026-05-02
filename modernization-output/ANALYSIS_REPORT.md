# Spring Boot 2.x Application Analysis Report

**Analysis Date:** May 1, 2026  
**Application:** Spring Boot Actuator Sample  
**Location:** `legacy-app/spring-boot-2-sample-app/`

---

## 1. Application Overview

This is a **Spring Boot Actuator demonstration application** that showcases:

- **REST API endpoints** for basic CRUD operations
- **Spring Boot Actuator** integration for health checks, metrics, and monitoring
- **Custom health indicators** and info contributors
- **Configuration properties** management
- **H2 in-memory database** with JDBC support
- **Docker containerization** with multi-stage builds

### Key Features:
- Root endpoint (`/`) returns a JSON message from [`HelloWorldService`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/HelloWorldService.java)
- POST endpoint for message validation using Bean Validation
- Error handling endpoint (`/foo`) that throws exceptions
- Custom health indicators via [`ExampleHealthIndicator`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/ExampleHealthIndicator.java)
- Custom info contributors via [`ExampleInfoContributor`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/ExampleInfoContributor.java)
- Actuator endpoints exposed for monitoring

---

## 2. Current Spring Boot Version

**Version:** `2.0.2.RELEASE` (from [`pom.xml:15`](legacy-app/spring-boot-2-sample-app/pom.xml:15))

**Status:** ⚠️ **CRITICALLY OUTDATED**
- Released: May 2018 (over 8 years old)
- End of OSS support: May 2019
- End of commercial support: August 2019
- **Security vulnerabilities:** Multiple CVEs affecting this version

---

## 3. Current Java Version

**Version:** `1.8` (Java 8) (from [`pom.xml:22`](legacy-app/spring-boot-2-sample-app/pom.xml:22))

**Status:** ⚠️ **OUTDATED**
- Java 8 reached end of public updates in January 2019
- Spring Boot 3.x requires Java 17 minimum (Java 21 recommended)

---

## 4. Outdated Dependencies Analysis

### Core Framework Dependencies

| Dependency | Current Version | Latest Stable | Recommendation | Severity |
|------------|----------------|---------------|----------------|----------|
| **spring-boot-starter-parent** | 2.0.2.RELEASE | 3.3.x | Upgrade to 3.3.x | 🔴 Critical |
| **spring-boot-starter-actuator** | 2.0.2 | 3.3.x | Upgrade to 3.3.x | 🔴 Critical |
| **spring-boot-starter-web** | 2.0.2 | 3.3.x | Upgrade to 3.3.x | 🔴 Critical |
| **spring-boot-starter-jdbc** | 2.0.2 | 3.3.x | Upgrade to 3.3.x | 🔴 Critical |
| **spring-boot-starter-test** | 2.0.2 | 3.3.x | Upgrade to 3.3.x | 🔴 Critical |

### Runtime Dependencies

| Dependency | Current Version | Latest Stable | Recommendation | Severity |
|------------|----------------|---------------|----------------|----------|
| **httpclient** | Inherited (4.5.x) | 5.3.x | Upgrade to 5.3.x | 🟡 Medium |
| **h2** | Inherited (1.4.x) | 2.2.x | Upgrade to 2.2.x | 🟡 Medium |

### Test Dependencies

| Dependency | Current Version | Latest Stable | Recommendation | Severity |
|------------|----------------|---------------|----------------|----------|
| **rest-assured** | Inherited (3.x) | 5.4.x | Upgrade to 5.4.x | 🟡 Medium |
| **groovy-all** | Inherited (2.4.x) | 4.0.x | Upgrade to 4.0.x | 🟡 Medium |

### Build Plugins

| Plugin | Current Version | Latest Stable | Recommendation | Severity |
|--------|----------------|---------------|----------------|----------|
| **maven-surefire-plugin** | 2.9 | 3.2.x | Upgrade to 3.2.x | 🟠 High |
| **maven-failsafe-plugin** | 2.18 | 3.2.x | Upgrade to 3.2.x | 🟠 High |

**Note:** Surefire 2.9 is from 2011 and has known issues with modern JUnit versions.

---

## 5. javax.* to jakarta.* Migration Requirements

### Required Changes for Spring Boot 3.x

Spring Boot 3.x requires migration from `javax.*` to `jakarta.*` namespace due to Jakarta EE 9+ adoption.

#### Files Requiring Updates:

1. **[`SampleController.java:24`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java:24)**
   ```java
   // CURRENT (Spring Boot 2.x)
   import javax.validation.constraints.NotBlank;
   
   // REQUIRED (Spring Boot 3.x)
   import jakarta.validation.constraints.NotBlank;
   ```

#### Summary of javax.* Imports Found:
- ✅ `javax.validation.constraints.NotBlank` → `jakarta.validation.constraints.NotBlank`

#### Additional Considerations:
- Bean Validation API changes from `javax.validation` to `jakarta.validation`
- Servlet API changes from `javax.servlet` to `jakarta.servlet` (if used)
- Persistence API changes from `javax.persistence` to `jakarta.persistence` (if JPA is added)

---

## 6. Deprecated Spring Boot 2 Patterns

### 🔴 Critical Deprecations

#### 1. **Anonymous Inner Class for HealthIndicator** ([`SampleActuatorApplication.java:34-44`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleActuatorApplication.java:34-44))

**Current Pattern:**
```java
@Bean
public HealthIndicator helloHealthIndicator() {
    return new HealthIndicator() {
        @Override
        public Health health() {
            return Health.up().withDetail("hello", "world").build();
        }
    };
}
```

**Issue:** Anonymous inner classes are verbose and harder to test.

**Recommended Pattern:**
```java
@Bean
public HealthIndicator helloHealthIndicator() {
    return () -> Health.up().withDetail("hello", "world").build();
}
```

Or create a separate component class like [`ExampleHealthIndicator`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/ExampleHealthIndicator.java).

---

#### 2. **ConfigurationProperties ignoreUnknownFields** ([`ServiceProperties.java:21`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/ServiceProperties.java:21))

**Current Pattern:**
```java
@ConfigurationProperties(prefix = "service", ignoreUnknownFields = false)
```

**Issue:** `ignoreUnknownFields` attribute is deprecated in Spring Boot 2.x and removed in 3.x.

**Recommended Pattern:**
```java
@ConfigurationProperties(prefix = "service")
@Validated // Add validation if needed
```

---

#### 3. **HTTP Trace Configuration** ([`application.properties:16`](legacy-app/spring-boot-2-sample-app/src/main/resources/application.properties:16))

**Current Pattern:**
```properties
management.httptrace.include=REQUEST_HEADERS,RESPONSE_HEADERS,PRINCIPAL,REMOTE_ADDRESS,SESSION_ID
```

**Issue:** `management.httptrace.*` is deprecated in Spring Boot 2.2+ and removed in 3.x. Replaced by `management.httpexchanges.*`.

**Recommended Pattern:**
```properties
management.httpexchanges.recording.include=REQUEST_HEADERS,RESPONSE_HEADERS,PRINCIPAL,REMOTE_ADDRESS,SESSION_ID
```

---

#### 4. **JUnit 4 Test Annotations** (Multiple test files)

**Files Affected:**
- [`ExampleInfoContributorTest.java:7`](legacy-app/spring-boot-2-sample-app/src/test/java/sample/actuator/ExampleInfoContributorTest.java:7)
- [`HealthIT.java:3-4`](legacy-app/spring-boot-2-sample-app/src/test/java/sample/actuator/HealthIT.java:3-4)
- [`HelloWorldServiceTest.java:3,5`](legacy-app/spring-boot-2-sample-app/src/test/java/sample/actuator/HelloWorldServiceTest.java:3,5)

**Current Pattern:**
```java
import org.junit.Test;
import org.junit.BeforeClass;
import static org.junit.Assert.assertEquals;

@Test
public void testMethod() { }
```

**Issue:** JUnit 4 is deprecated. Spring Boot 3.x uses JUnit 5 (Jupiter) by default.

**Recommended Pattern:**
```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import static org.junit.jupiter.api.Assertions.assertEquals;

@Test
void testMethod() { }
```

---

#### 5. **@RequestMapping without HTTP Method** ([`SampleController.java:62`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java:62))

**Current Pattern:**
```java
@RequestMapping("/foo")
@ResponseBody
public String foo() {
    throw new IllegalArgumentException("Server error");
}
```

**Issue:** Using `@RequestMapping` without specifying HTTP method is ambiguous and not recommended.

**Recommended Pattern:**
```java
@GetMapping("/foo")
public String foo() {
    throw new IllegalArgumentException("Server error");
}
```

---

### 🟡 Medium Priority Deprecations

#### 6. **Tomcat Access Log Configuration** ([`application.properties:9-10`](legacy-app/spring-boot-2-sample-app/src/main/resources/application.properties:9-10))

**Current Pattern:**
```properties
server.tomcat.accesslog.enabled=true
server.tomcat.accesslog.pattern=%h %t "%r" %s %b
```

**Status:** Still supported but property names may change in future versions.

**Recommendation:** Monitor for updates in Spring Boot 3.x documentation.

---

## 7. Missing Test Coverage Areas

### 🔴 Critical Gaps

#### 1. **SampleController Tests**
- **Missing:** Unit tests for [`SampleController`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java)
- **Impact:** No coverage for:
  - GET `/` endpoint ([line 45-50](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java:45-50))
  - POST `/` endpoint with validation ([line 52-60](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java:52-60))
  - Error handling endpoint `/foo` ([line 62-66](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java:62-66))
  - Message validation logic ([line 68-81](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java:68-81))

**Recommended Tests:**
```java
@WebMvcTest(SampleController.class)
class SampleControllerTest {
    @Test void testGetEndpoint() { }
    @Test void testPostEndpointWithValidMessage() { }
    @Test void testPostEndpointWithInvalidMessage() { }
    @Test void testErrorEndpoint() { }
}
```

---

#### 2. **SampleActuatorApplication Tests**
- **Missing:** Tests for main application class and bean configurations
- **Impact:** No coverage for:
  - Application startup
  - Custom health indicator bean ([line 34-44](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleActuatorApplication.java:34-44))
  - Configuration properties binding

**Recommended Tests:**
```java
@SpringBootTest
class SampleActuatorApplicationTest {
    @Test void contextLoads() { }
    @Test void healthIndicatorBeanExists() { }
}
```

---

#### 3. **ExampleHealthIndicator Tests**
- **Missing:** Unit tests for [`ExampleHealthIndicator`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/ExampleHealthIndicator.java)
- **Impact:** No verification of health check logic

**Recommended Tests:**
```java
class ExampleHealthIndicatorTest {
    @Test void healthReturnsUp() { }
    @Test void healthIncludesCounter() { }
}
```

---

#### 4. **ServiceProperties Tests**
- **Missing:** Tests for [`ServiceProperties`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/ServiceProperties.java)
- **Impact:** No validation of configuration binding

**Recommended Tests:**
```java
@SpringBootTest
class ServicePropertiesTest {
    @Test void defaultNameIsWorld() { }
    @Test void customNameBinding() { }
}
```

---

### 🟡 Medium Priority Gaps

#### 5. **Integration Test Coverage**
- **Existing:** [`HealthIT.java`](legacy-app/spring-boot-2-sample-app/src/test/java/sample/actuator/HealthIT.java) provides basic integration tests
- **Missing:**
  - Actuator endpoint security tests
  - Database connectivity tests
  - Error response format validation
  - Content negotiation tests

---

#### 6. **Edge Case Testing**
- **Missing:**
  - Null/empty input handling
  - Concurrent request handling
  - Large payload handling
  - Special character handling in messages

---

### Test Coverage Summary

| Component | Current Coverage | Target Coverage | Priority |
|-----------|-----------------|-----------------|----------|
| SampleController | 0% (via HealthIT only) | 80%+ | 🔴 Critical |
| HelloWorldService | ✅ 100% | 100% | ✅ Complete |
| ExampleHealthIndicator | 0% | 80%+ | 🔴 Critical |
| ExampleInfoContributor | ✅ 100% | 100% | ✅ Complete |
| ServiceProperties | 0% | 80%+ | 🟡 Medium |
| SampleActuatorApplication | 0% | 60%+ | 🟡 Medium |

---

## 8. Docker/Deployment Risks for Spring Boot 3 Upgrade

### 🔴 Critical Risks

#### 1. **Outdated Base Images** ([`Dockerfile:1,8`](legacy-app/spring-boot-2-sample-app/Dockerfile:1,8))

**Current Configuration:**
```dockerfile
FROM maven:3.5.2-jdk-8-alpine AS MAVEN_TOOL_CHAIN
FROM java:8-jre-alpine
```

**Issues:**
- ⚠️ **Maven 3.5.2** is from 2017 (current: 3.9.x)
- ⚠️ **JDK 8** incompatible with Spring Boot 3.x (requires Java 17+)
- ⚠️ **`java:8-jre-alpine`** image is deprecated and has security vulnerabilities
- ⚠️ Alpine Linux version is outdated

**Security Concerns:**
- Multiple CVEs in Java 8
- Unmaintained base images
- Missing security patches

**Required Changes:**
```dockerfile
FROM maven:3.9-eclipse-temurin-21-alpine AS MAVEN_TOOL_CHAIN
FROM eclipse-temurin:21-jre-alpine
```

**Alternative (Recommended):**
```dockerfile
FROM maven:3.9-eclipse-temurin-21-alpine AS build
FROM eclipse-temurin:21-jre-jammy  # Ubuntu-based for better compatibility
```

---

#### 2. **Maven Settings Reference** ([`Dockerfile:3,6`](legacy-app/spring-boot-2-sample-app/Dockerfile:3,6))

**Current Configuration:**
```dockerfile
RUN mvn -B dependency:go-offline -f /tmp/pom.xml -s /usr/share/maven/ref/settings-docker.xml
RUN mvn -B -s /usr/share/maven/ref/settings-docker.xml package
```

**Issue:** Custom Maven settings file may not exist in newer Maven images.

**Recommended Approach:**
```dockerfile
# Copy custom settings if needed, or remove -s flag
COPY settings.xml /root/.m2/settings.xml
RUN mvn -B dependency:go-offline -f /tmp/pom.xml
RUN mvn -B package
```

---

#### 3. **Health Check Endpoint Path** ([`Dockerfile:17`](legacy-app/spring-boot-2-sample-app/Dockerfile:17))

**Current Configuration:**
```dockerfile
HEALTHCHECK --interval=1m --timeout=3s CMD wget -q -T 3 -s http://localhost:8080/actuator/health/ || exit 1
```

**Issues:**
- Trailing slash may cause issues in some configurations
- `wget` may not be available in minimal Alpine images
- Health check configuration may need adjustment for Spring Boot 3.x

**Recommended Configuration:**
```dockerfile
# Install curl in Alpine
RUN apk add --no-cache curl

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

---

#### 4. **JVM Options** ([`Dockerfile:15`](legacy-app/spring-boot-2-sample-app/Dockerfile:15))

**Current Configuration:**
```dockerfile
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/spring-boot-application.jar"]
```

**Issues:**
- Missing memory limits (can cause OOM in containers)
- Missing GC tuning for containerized environments
- `-Djava.security.egd` is less relevant in modern Java versions

**Recommended Configuration:**
```dockerfile
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "/app/spring-boot-application.jar"]
```

---

### 🟡 Medium Priority Risks

#### 5. **Multi-Stage Build Optimization**

**Current Approach:** Two-stage build is good, but can be optimized.

**Recommendations:**
- Use layer caching for dependencies
- Separate dependency download from build
- Use `.dockerignore` file

**Optimized Dockerfile:**
```dockerfile
FROM maven:3.9-eclipse-temurin-21-alpine AS dependencies
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline

FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /build
COPY --from=dependencies /root/.m2 /root/.m2
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
```

---

#### 6. **Security Hardening**

**Missing Security Measures:**
- No non-root user specified
- No security scanning in build process
- No image signing

**Recommended Additions:**
```dockerfile
# Add non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Use specific image digests for reproducibility
FROM eclipse-temurin:21-jre-alpine@sha256:...
```

---

#### 7. **Actuator Security Configuration**

**Current Configuration** ([`application.properties:4-7`](legacy-app/spring-boot-2-sample-app/src/main/resources/application.properties:4-7)):
```properties
management.server.address=127.0.0.1
management.endpoints.web.exposure.include=*
management.endpoint.shutdown.enabled=true
```

**Issues:**
- Actuator bound to localhost only (won't work in Docker)
- All endpoints exposed (security risk)
- Shutdown endpoint enabled (dangerous in production)

**Recommended for Docker:**
```properties
# Allow actuator access from container network
management.server.port=8081
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.shutdown.enabled=false

# For health checks
management.endpoint.health.show-details=when-authorized
```

---

### 🟢 Low Priority Considerations

#### 8. **Build Performance**

**Recommendations:**
- Use BuildKit for parallel builds
- Implement proper layer caching
- Consider using Jib or Cloud Native Buildpacks

#### 9. **Observability**

**Missing:**
- Structured logging configuration
- Metrics export configuration
- Distributed tracing setup

---

## Summary of Upgrade Blockers

### Must Fix Before Spring Boot 3 Migration:

1. ✅ Upgrade Java from 8 to 17+ (preferably 21)
2. ✅ Update all `javax.*` imports to `jakarta.*`
3. ✅ Migrate JUnit 4 to JUnit 5
4. ✅ Remove deprecated `ignoreUnknownFields` from `@ConfigurationProperties`
5. ✅ Update `management.httptrace.*` to `management.httpexchanges.*`
6. ✅ Update Docker base images to Java 17+
7. ✅ Fix actuator configuration for Docker networking
8. ✅ Update Maven plugins (Surefire, Failsafe)
9. ✅ Add comprehensive test coverage for critical components
10. ✅ Review and update all dependencies to Spring Boot 3.x compatible versions

---

## Recommended Migration Path

1. **Phase 1: Preparation**
   - Add missing test coverage
   - Update to latest Spring Boot 2.7.x (migration stepping stone)
   - Update Java to 17
   - Update Docker images

2. **Phase 2: Code Updates**
   - Migrate javax.* to jakarta.*
   - Update JUnit 4 to JUnit 5
   - Fix deprecated patterns
   - Update configuration properties

3. **Phase 3: Spring Boot 3 Migration**
   - Update to Spring Boot 3.3.x
   - Test all endpoints and actuator features
   - Verify Docker deployment
   - Performance testing

4. **Phase 4: Validation**
   - Run full test suite
   - Security scanning
   - Load testing
   - Production deployment

---

**End of Analysis Report**