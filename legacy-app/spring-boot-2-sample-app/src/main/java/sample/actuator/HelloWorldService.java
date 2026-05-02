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

import org.springframework.stereotype.Service;

/**
 * Service class that provides hello message functionality.
 * This service is used by the REST controller to generate greeting messages.
 *
 * @author Spring Boot Team
 * @since 3.1.5
 */
@Service
public class HelloWorldService {

	/**
	 * Retrieves a hello message indicating the application is running in a Docker container.
	 *
	 * @return a greeting message string
	 */
	public String getHelloMessage() {
		return "Spring boot says hello from a Docker container";
	}

}
