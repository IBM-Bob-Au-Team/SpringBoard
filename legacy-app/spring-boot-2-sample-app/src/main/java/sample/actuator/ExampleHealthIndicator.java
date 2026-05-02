/*
 * Copyright 2012-2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package sample.actuator;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Custom health indicator that provides application health status information.
 * This component is automatically registered with Spring Boot Actuator and contributes
 * to the overall health endpoint response.
 *
 * @author Spring Boot Team
 * @since 3.1.5
 */
@Component
public class ExampleHealthIndicator implements HealthIndicator {

	/**
	 * Performs a health check and returns the health status.
	 * This implementation always returns UP status with a counter detail.
	 *
	 * @return Health object containing the status and additional details
	 */
	@Override
	public Health health() {
		return Health.up().withDetail("counter", 42).build();
	}

}
