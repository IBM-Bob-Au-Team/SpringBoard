# Spring Boot 2.x to 3.x Modernization Plan

**Project:** Spring Boot Actuator Sample Application  
**Current Version:** Spring Boot 2.0.2.RELEASE (Java 8)  
**Target Version:** Spring Boot 3.3.x (Java 21)  
**Plan Date:** May 1, 2026

---

## Executive Summary

This plan outlines the step-by-step modernization of a Spring Boot 2.0.2 application to Spring Boot 3.3.x. The application is **8 years outdated** with critical security vulnerabilities. The migration requires Java upgrade (8→21), namespace migration (javax→jakarta), dependency updates, and Docker modernization.

**Estimated Effort:** 3-5 days  
**Risk Level:** Medium-High (due to age gap)  
**Breaking Changes:** Yes (Jakarta EE namespace, JUnit 5, configuration properties)

---

## Before and After Summary

| Aspect | Spring Boot 2.0.2 (Current) | Spring Boot 3.3.x (Target) |
|--------|----------------------------|---------------------------|
| **Java Version** | Java 8 (EOL 2019) | Java 17+ (21 recommended) |
| **Namespace** | `javax.*` | `jakarta.*` |
| **Testing Framework** | JUnit 4 | JUnit 5 (Jupiter) |
| **Servlet API** | Servlet 3.1 | Servlet 6.0 |
| **Bean Validation** | 2.0 (javax) | 3.0 (jakarta) |
| **HTTP Client** | Apache HttpClient 4.x | Apache HttpClient 5.x |
| **Maven Plugins** | Surefire 2.9 (2011) | Surefire 3.2.x |
| **Docker Base Image** | `java:8-jre-alpine` (deprecated) | `eclipse-temurin:21-jre-alpine` |
| **Actuator Endpoints** | `/actuator/httptrace` | `/actuator/httpexchanges` |
| **Configuration Properties** | `ignoreUnknownFields` supported | `ignoreUnknownFields` removed |
| **Health Indicators** | Anonymous inner classes | Lambda expressions preferred |
| **Security Support** | EOL (2019) | Active support until 2026+ |
| **Performance** | Baseline | 15-30% improvement (Java 21 + optimizations) |
| **Memory Usage** | Baseline | 10-20% reduction (modern GC) |

---

## Priority 1 - Critical (Must Fix)

### 1.1 Upgrade Java Version

**File to change:** [`pom.xml:22-23`](legacy-app/spring-boot-2-sample-app/pom.xml:22-23)

**What to change:**
```xml
<!-- BEFORE -->
<java.version>1.8</java.version>

<!-- AFTER -->
<java.version>21</java.version>
```

**Why:**
- Spring Boot 3.x requires Java 17 minimum
- Java 8 reached EOL in 2019 with known security vulnerabilities
- Java 21 is LTS with performance improvements (15-30% faster)
- Modern GC algorithms reduce memory footprint by 10-20%

**Risk:** 🔴 **High**
- May expose compatibility issues with legacy code patterns
- Requires testing all functionality
- Team needs Java 17+ knowledge
- CI/CD pipelines must support Java 21

---

### 1.2 Upgrade Spring Boot Version

**File to change:** [`pom.xml:15`](legacy-app/spring-boot-2-sample-app/pom.xml:15)

**What to change:**
```xml
<!-- BEFORE -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.0.2.RELEASE</version>
</parent>

<!-- AFTER -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
</parent>
```

**Why:**
- Spring Boot 2.0.2 has critical security vulnerabilities (CVEs)
- No security patches available since 2019
- Spring Boot 3.3.x includes modern features and optimizations
- Required for Jakarta EE 9+ support

**Risk:** 🔴 **High**
- Breaking changes in APIs and configuration
- All dependencies must be compatible
- Requires comprehensive testing
- May break existing integrations

---

### 1.3 Migrate javax.* to jakarta.* Namespace

**File to change:** [`src/main/java/sample/actuator/SampleController.java:24`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java:24)

**What to change:**
```java
// BEFORE
import javax.validation.constraints.NotBlank;

// AFTER
import jakarta.validation.constraints.NotBlank;
```

**Why:**
- Jakarta EE 9+ moved from `javax.*` to `jakarta.*` namespace
- Spring Boot 3.x requires Jakarta EE 9+
- Oracle transferred Java EE to Eclipse Foundation
- All Java EE APIs now use jakarta namespace

**Risk:** 🔴 **High**
- Must update ALL javax imports across entire codebase
- Third-party libraries must support jakarta namespace
- Easy to miss imports during manual migration
- Compilation will fail if any javax imports remain

**Additional files potentially affected:**
- Any servlet imports (if added later)
- JPA/Persistence imports (if database layer expands)
- JAX-RS imports (if REST clients added)

---

### 1.4 Update Docker Base Images

**File to change:** [`Dockerfile:1,8`](legacy-app/spring-boot-2-sample-app/Dockerfile:1,8)

**What to change:**
```dockerfile
# BEFORE
FROM maven:3.5.2-jdk-8-alpine AS MAVEN_TOOL_CHAIN
FROM java:8-jre-alpine

# AFTER
FROM maven:3.9-eclipse-temurin-21-alpine AS MAVEN_TOOL_CHAIN
FROM eclipse-temurin:21-jre-alpine
```

**Why:**
- `java:8-jre-alpine` is deprecated and has security vulnerabilities
- Maven 3.5.2 is from 2017 (current: 3.9.x)
- Eclipse Temurin is the recommended OpenJDK distribution
- Alpine base reduces image size and attack surface

**Risk:** 🔴 **High**
- Container may fail to start if misconfigured
- Health checks may need adjustment
- Different JVM behavior in containers
- Network configuration may differ

---

### 1.5 Migrate JUnit 4 to JUnit 5

**Files to change:**
- [`src/test/java/sample/actuator/ExampleInfoContributorTest.java:7`](legacy-app/spring-boot-2-sample-app/src/test/java/sample/actuator/ExampleInfoContributorTest.java:7)
- [`src/test/java/sample/actuator/HealthIT.java:3-4`](legacy-app/spring-boot-2-sample-app/src/test/java/sample/actuator/HealthIT.java:3-4)
- [`src/test/java/sample/actuator/HelloWorldServiceTest.java:3,5`](legacy-app/spring-boot-2-sample-app/src/test/java/sample/actuator/HelloWorldServiceTest.java:3,5)

**What to change:**
```java
// BEFORE
import org.junit.Test;
import org.junit.BeforeClass;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class ExampleTest {
    @Test
    public void testMethod() { }
}

// AFTER
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ExampleTest {
    @Test
    void testMethod() { }
}
```

**Why:**
- JUnit 4 is deprecated and not supported in Spring Boot 3.x
- JUnit 5 (Jupiter) is the modern standard
- Better assertions, parameterized tests, and extension model
- Required for Spring Boot 3.x test support

**Risk:** 🔴 **High**
- All test classes must be migrated
- Test runners may behave differently
- Some JUnit 4 features have no direct equivalent
- CI/CD test execution may need updates

---

### 1.6 Update Maven Surefire and Failsafe Plugins

**File to change:** [`pom.xml:48-58`](legacy-app/spring-boot-2-sample-app/pom.xml:48-58)

**What to change:**
```xml
<!-- BEFORE -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>2.9</version>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>2.18</version>
</plugin>

<!-- AFTER -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.2.5</version>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.2.5</version>
</plugin>
```

**Why:**
- Surefire 2.9 is from 2011 with known issues
- Modern versions support JUnit 5 properly
- Better test reporting and parallel execution
- Required for reliable test execution with Spring Boot 3.x

**Risk:** 🟡 **Medium**
- Test execution behavior may change
- Parallel test execution may expose race conditions
- Configuration options have changed
- Build times may vary

---

### 1.7 Fix Actuator Configuration for Docker

**File to change:** [`src/main/resources/application.properties:4-7`](legacy-app/spring-boot-2-sample-app/src/main/resources/application.properties:4-7)

**What to change:**
```properties
# BEFORE
management.server.address=127.0.0.1
management.endpoints.web.exposure.include=*
management.endpoint.shutdown.enabled=true

# AFTER
# Remove localhost binding for Docker compatibility
# management.server.address=127.0.0.1  # REMOVED
management.server.port=8081
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.shutdown.enabled=false
management.endpoint.health.show-details=when-authorized
```

**Why:**
- Binding to 127.0.0.1 prevents Docker health checks from working
- Exposing all endpoints (*) is a security risk
- Shutdown endpoint should never be enabled in production
- Separate management port improves security

**Risk:** 🔴 **High**
- Health checks will fail if misconfigured
- Container orchestration depends on health endpoint
- Security implications if endpoints exposed incorrectly
- May break existing monitoring integrations

---

### 1.8 Update HTTP Trace Configuration

**File to change:** [`src/main/resources/application.properties:16`](legacy-app/spring-boot-2-sample-app/src/main/resources/application.properties:16)

**What to change:**
```properties
# BEFORE
management.httptrace.include=REQUEST_HEADERS,RESPONSE_HEADERS,PRINCIPAL,REMOTE_ADDRESS,SESSION_ID

# AFTER
management.httpexchanges.recording.include=REQUEST_HEADERS,RESPONSE_HEADERS,PRINCIPAL,REMOTE_ADDRESS,SESSION_ID
```

**Why:**
- `management.httptrace.*` was deprecated in Spring Boot 2.2
- Removed completely in Spring Boot 3.x
- Replaced by `management.httpexchanges.*` with improved functionality
- New API provides better performance and memory management

**Risk:** 🟡 **Medium**
- Monitoring dashboards may need updates
- Different data structure in new API
- May need to update log parsing scripts
- Historical trace data format changes

---

## Priority 2 - Important (Should Fix)

### 2.1 Remove Deprecated ConfigurationProperties Attribute

**File to change:** [`src/main/java/sample/actuator/ServiceProperties.java:21`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/ServiceProperties.java:21)

**What to change:**
```java
// BEFORE
@ConfigurationProperties(prefix = "service", ignoreUnknownFields = false)
public class ServiceProperties {
    private String name = "World";
    // ...
}

// AFTER
@ConfigurationProperties(prefix = "service")
@Validated
public class ServiceProperties {
    private String name = "World";
    // ...
}
```

**Why:**
- `ignoreUnknownFields` attribute removed in Spring Boot 3.x
- Use `@Validated` for validation instead
- Cleaner configuration binding model
- Better error messages for configuration issues

**Risk:** 🟡 **Medium**
- Configuration validation behavior changes
- May expose previously hidden configuration errors
- Need to verify all configuration properties
- Could break if unknown properties exist

---

### 2.2 Modernize Health Indicator Implementation

**File to change:** [`src/main/java/sample/actuator/SampleActuatorApplication.java:34-44`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleActuatorApplication.java:34-44)

**What to change:**
```java
// BEFORE
@Bean
public HealthIndicator helloHealthIndicator() {
    return new HealthIndicator() {
        @Override
        public Health health() {
            return Health.up().withDetail("hello", "world").build();
        }
    };
}

// AFTER
@Bean
public HealthIndicator helloHealthIndicator() {
    return () -> Health.up().withDetail("hello", "world").build();
}
```

**Why:**
- Lambda expressions are more concise and readable
- Reduces boilerplate code
- Modern Java coding style
- Easier to test and maintain

**Risk:** 🟢 **Low**
- Purely stylistic change
- No functional difference
- Easy to revert if issues arise
- Improves code maintainability

---

### 2.3 Update RequestMapping to Specific HTTP Method

**File to change:** [`src/main/java/sample/actuator/SampleController.java:62`](legacy-app/spring-boot-2-sample-app/src/main/java/sample/actuator/SampleController.java:62)

**What to change:**
```java
// BEFORE
@RequestMapping("/foo")
@ResponseBody
public String foo() {
    throw new IllegalArgumentException("Server error");
}

// AFTER
@GetMapping("/foo")
public String foo() {
    throw new IllegalArgumentException("Server error");
}
```

**Why:**
- Explicit HTTP method improves API clarity
- Better security (prevents unintended HTTP methods)
- Follows Spring Boot best practices
- `@ResponseBody` not needed with `@RestController`

**Risk:** 🟢 **Low**
- May break clients using non-GET methods
- Easy to identify and fix
- Improves API documentation
- Better security posture

---

### 2.4 Optimize Docker Multi-Stage Build

**File to change:** [`Dockerfile`](legacy-app/spring-boot-2-sample-app/Dockerfile) (entire file)

**What to change:**
```dockerfile
# BEFORE (simplified)
FROM maven:3.5.2-jdk-8-alpine AS MAVEN_TOOL_CHAIN
COPY pom.xml /tmp/
RUN mvn -B dependency:go-offline -f /tmp/pom.xml
COPY src /tmp/src/
RUN mvn -B package
FROM java:8-jre-alpine
COPY --from=MAVEN_TOOL_CHAIN /tmp/target/*.jar /app/spring-boot-application.jar

# AFTER
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
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-jar", "app.jar"]
```

**Why:**
- Better layer caching reduces build times
- Non-root user improves security
- Modern JVM options optimize container performance
- Proper health check configuration
- Curl is more reliable than wget

**Risk:** 🟡 **Medium**
- Build process changes may affect CI/CD
- Container startup behavior may differ
- Memory limits need tuning for workload
- Health check timing may need adjustment

---

### 2.5 Update Docker Health Check

**File to change:** [`Dockerfile:17`](legacy-app/spring-boot-2-sample-app/Dockerfile:17)

**What to change:**
```dockerfile
# BEFORE
HEALTHCHECK --interval=1m --timeout=3s CMD wget -q -T 3 -s http://localhost:8080/actuator/health/ || exit 1

# AFTER
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

**Why:**
- Curl is more reliable and widely available
- Start period allows application warmup
- More frequent checks (30s vs 1m) detect issues faster
- Retry logic prevents false positives
- Removed trailing slash (may cause issues)

**Risk:** 🟡 **Medium**
- Container orchestration depends on health checks
- Timing changes may affect deployment
- Need to install curl in Alpine image
- May need tuning for application startup time

---

### 2.6 Add JVM Container Optimization

**File to change:** [`Dockerfile:15`](legacy-app/spring-boot-2-sample-app/Dockerfile:15)

**What to change:**
```dockerfile
# BEFORE
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/spring-boot-application.jar"]

# AFTER
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "/app/spring-boot-application.jar"]
```

**Why:**
- `UseContainerSupport` enables container-aware JVM
- `MaxRAMPercentage` prevents OOM in containers
- G1GC provides better performance for containerized apps
- Proper memory management for Kubernetes/Docker

**Risk:** 🟡 **Medium**
- Memory limits need testing and tuning
- GC behavior may differ from default
- May need adjustment based on workload
- Could cause OOM if misconfigured

---

### 2.7 Add Comprehensive Controller Tests

**File to create:** `src/test/java/sample/actuator/SampleControllerTest.java`

**What to change:**
```java
// NEW FILE
package sample.actuator;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SampleController.class)
class SampleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HelloWorldService helloWorldService;

    @Test
    void testGetEndpoint() throws Exception {
        when(helloWorldService.getHelloMessage()).thenReturn("Hello World");
        
        mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Hello World"));
    }

    @Test
    void testPostEndpointWithValidMessage() throws Exception {
        mockMvc.perform(post("/")
                .contentType("application/json")
                .content("{\"value\":\"test\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.value").value("test"));
    }

    @Test
    void testPostEndpointWithInvalidMessage() throws Exception {
        mockMvc.perform(post("/")
                .contentType("application/json")
                .content("{\"value\":\"\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void testErrorEndpoint() throws Exception {
        mockMvc.perform(get("/foo"))
            .andExpect(status().is5xxServerError());
    }
}
```

**Why:**
- Currently 0% test coverage for SampleController
- Critical for ensuring upgrade doesn't break functionality
- Validates request/response handling
- Tests error scenarios and validation

**Risk:** 🟢 **Low**
- New tests don't affect existing code
- May reveal existing bugs
- Improves confidence in migration
- Essential for regression testing

---

### 2.8 Add Application Context Test

**File to create:** `src/test/java/sample/actuator/SampleActuatorApplicationTest.java`

**What to change:**
```java
// NEW FILE
package sample.actuator;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class SampleActuatorApplicationTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        assertNotNull(context);
    }

    @Test
    void healthIndicatorBeanExists() {
        assertNotNull(context.getBean("helloHealthIndicator"));
    }

    @Test
    void servicePropertiesBeanExists() {
        assertNotNull(context.getBean(ServiceProperties.class));
    }
}
```

**Why:**
- Validates Spring Boot application starts correctly
- Ensures all beans are properly configured
- Critical smoke test for migration
- Catches configuration issues early

**Risk:** 🟢 **Low**
- New test doesn't modify existing code
- May reveal configuration issues
- Essential for Spring Boot 3.x migration
- Quick feedback on startup problems

---

## Priority 3 - Nice to Have

### 3.1 Add .dockerignore File

**File to create:** `.dockerignore`

**What to change:**
```
# NEW FILE
target/
.git/
.gitignore
*.md
.idea/
.vscode/
*.iml
.DS_Store
```

**Why:**
- Reduces Docker build context size
- Faster builds by excluding unnecessary files
- Prevents sensitive files from being copied
- Best practice for Docker builds

**Risk:** 🟢 **Low**
- No impact on functionality
- Only affects build performance
- Easy to adjust if needed
- Standard Docker practice

---

### 3.2 Add Structured Logging Configuration

**File to change:** [`src/main/resources/logback.xml`](legacy-app/spring-boot-2-sample-app/src/main/resources/logback.xml)

**What to change:**
```xml
<!-- ADD JSON logging for better observability -->
<appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <includeContext>true</includeContext>
        <includeMdc>true</includeMdc>
    </encoder>
</appender>

<root level="INFO">
    <appender-ref ref="JSON" />
</root>
```

**Why:**
- JSON logs are easier to parse and analyze
- Better integration with log aggregation tools
- Improved observability in containerized environments
- Industry best practice for microservices

**Risk:** 🟢 **Low**
- Requires additional dependency (logstash-logback-encoder)
- Log format changes may affect existing parsers
- Easy to revert to text logs
- Improves operational visibility

---

### 3.3 Add Prometheus Metrics Endpoint

**File to change:** [`pom.xml`](legacy-app/spring-boot-2-sample-app/pom.xml) and [`application.properties`](legacy-app/spring-boot-2-sample-app/src/main/resources/application.properties)

**What to change:**
```xml
<!-- ADD to pom.xml -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```properties
# ADD to application.properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.metrics.export.prometheus.enabled=true
```

**Why:**
- Prometheus is industry standard for metrics
- Better monitoring and alerting capabilities
- Native support in Spring Boot 3.x
- Essential for production observability

**Risk:** 🟢 **Low**
- Adds new endpoint (no breaking changes)
- Minimal performance overhead
- Easy to disable if not needed
- Improves operational insights

---

### 3.4 Add Integration Test for Actuator Endpoints

**File to create:** `src/test/java/sample/actuator/ActuatorEndpointsIT.java`

**What to change:**
```java
// NEW FILE
package sample.actuator;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ActuatorEndpointsIT {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void healthEndpointReturnsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity("/actuator/health", String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void infoEndpointReturnsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity("/actuator/info", String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void metricsEndpointReturnsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity("/actuator/metrics", String.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
```

**Why:**
- Validates actuator endpoints work correctly
- Important for monitoring and operations
- Catches configuration issues
- Ensures health checks function properly

**Risk:** 🟢 **Low**
- New test doesn't affect existing code
- May reveal actuator configuration issues
- Improves confidence in deployment
- Essential for production readiness

---

### 3.5 Add Security Headers Configuration

**File to create:** `src/main/java/sample/actuator/SecurityConfig.java`

**What to change:**
```java
// NEW FILE
package sample.actuator;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                .frameOptions(frame -> frame.deny())
                .xssProtection(xss -> xss.enable())
            );
        return http.build();
    }
}
```

**Why:**
- Adds security headers (CSP, X-Frame-Options, XSS Protection)
- Protects against common web vulnerabilities
- Best practice for web applications
- Minimal performance impact

**Risk:** 🟡 **Medium**
- Requires spring-boot-starter-security dependency
- May break existing functionality if too restrictive
- Need to test with actual usage patterns
- Can be adjusted based on requirements

---

### 3.6 Add API Documentation with SpringDoc

**File to change:** [`pom.xml`](legacy-app/spring-boot-2-sample-app/pom.xml)

**What to change:**
```xml
<!-- ADD to pom.xml -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

**Why:**
- Automatic API documentation generation
- Interactive API testing via Swagger UI
- OpenAPI 3.0 specification support
- Better developer experience

**Risk:** 🟢 **Low**
- Adds new endpoints (/swagger-ui.html, /v3/api-docs)
- Minimal performance overhead
- Easy to disable in production
- Improves API discoverability

---

### 3.7 Add Performance Test Suite

**File to create:** `src/test/java/sample/actuator/PerformanceTest.java`

**What to change:**
```java
// NEW FILE
package sample.actuator;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;

import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PerformanceTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void endpointResponseTimeUnder100ms() {
        Instant start = Instant.now();
        restTemplate.getForEntity("/", String.class);
        Duration duration = Duration.between(start, Instant.now());
        
        assertTrue(duration.toMillis() < 100, 
            "Response time should be under 100ms, was: " + duration.toMillis() + "ms");
    }
}
```

**Why:**
- Validates performance after migration
- Ensures no performance regression
- Establishes performance baseline
- Catches performance issues early

**Risk:** 🟢 **Low**
- New test doesn't affect existing code
- May need threshold adjustments
- Helps validate Java 21 performance improvements
- Good practice for production readiness

---

## Migration Execution Plan

### Phase 1: Preparation (Day 1)
1. Create feature branch: `feature/spring-boot-3-migration`
2. Update Java to 21 (Priority 1.1)
3. Update Maven plugins (Priority 1.6)
4. Add missing tests (Priority 2.7, 2.8)
5. Run existing test suite to establish baseline

### Phase 2: Core Migration (Day 2)
1. Update Spring Boot version to 3.3.x (Priority 1.2)
2. Migrate javax.* to jakarta.* (Priority 1.3)
3. Migrate JUnit 4 to JUnit 5 (Priority 1.5)
4. Update configuration properties (Priority 1.8, 2.1)
5. Fix compilation errors
6. Run test suite

### Phase 3: Docker & Deployment (Day 3)
1. Update Docker base images (Priority 1.4)
2. Fix actuator configuration (Priority 1.7)
3. Optimize Docker build (Priority 2.4, 2.5, 2.6)
4. Add .dockerignore (Priority 3.1)
5. Test Docker build and health checks

### Phase 4: Code Quality (Day 4)
1. Modernize health indicators (Priority 2.2)
2. Update request mappings (Priority 2.3)
3. Add structured logging (Priority 3.2)
4. Add Prometheus metrics (Priority 3.3)
5. Code review and cleanup

### Phase 5: Testing & Validation (Day 5)
1. Run full test suite
2. Integration testing (Priority 3.4)
3. Performance testing (Priority 3.7)
4. Security scanning
5. Documentation updates

---

## Risk Mitigation Strategies

### High-Risk Items
- **Java Version Upgrade:** Test thoroughly on development environment first
- **Spring Boot 3.x Migration:** Use Spring Boot Migrator tool for automated checks
- **Jakarta Namespace:** Use IDE refactoring tools for bulk updates
- **Docker Changes:** Test in staging environment before production

### Testing Strategy
- Run existing tests after each change
- Add new tests before making changes
- Use feature flags for gradual rollout
- Maintain rollback plan

### Rollback Plan
- Keep Spring Boot 2.x branch available
- Document all configuration changes
- Test rollback procedure
- Have database backup strategy

---

## Success Criteria

✅ All tests passing (existing + new)  
✅ Application starts successfully  
✅ All endpoints responding correctly  
✅ Docker health checks passing  
✅ No security vulnerabilities in dependencies  
✅ Performance equal or better than baseline  
✅ Documentation updated  
✅ Team trained on Spring Boot 3.x changes

---

## Post-Migration Tasks

1. Monitor application in production for 1 week
2. Update CI/CD pipelines
3. Update deployment documentation
4. Train team on Spring Boot 3.x features
5. Plan for future Spring Boot updates
6. Review and optimize performance
7. Update security scanning tools
8. Schedule dependency update reviews

---

**End of Modernization Plan**