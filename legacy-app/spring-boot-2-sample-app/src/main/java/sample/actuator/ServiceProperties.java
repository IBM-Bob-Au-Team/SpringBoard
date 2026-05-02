/*
 * Copyright 2012-2016 the original author or authors.
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

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for service-related settings.
 * Properties are bound from application configuration with the "service" prefix.
 *
 * @author Spring Boot Team
 * @since 3.1.5
 */
@ConfigurationProperties(prefix = "service")
public class ServiceProperties {

	/**
	 * Name of the service.
	 */
	private String name = "World";

	/**
	 * Gets the service name.
	 *
	 * @return the service name
	 */
	public String getName() {
		return this.name;
	}

	/**
	 * Sets the service name.
	 *
	 * @param name the service name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

}
