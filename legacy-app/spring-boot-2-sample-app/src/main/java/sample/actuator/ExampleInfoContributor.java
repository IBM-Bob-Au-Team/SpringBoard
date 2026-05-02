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

import java.util.Collections;

import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.stereotype.Component;

/**
 * Custom info contributor that adds application-specific information to the
 * Actuator info endpoint. This component is automatically registered with
 * Spring Boot Actuator and contributes to the /actuator/info response.
 *
 * @author Spring Boot Team
 * @since 3.1.5
 */
@Component
public class ExampleInfoContributor implements InfoContributor {

	/**
	 * Contributes custom information to the info endpoint.
	 * Adds an "example" section with sample key-value pairs.
	 *
	 * @param builder the Info.Builder to add information to
	 */
	@Override
	public void contribute(Info.Builder builder) {
		builder.withDetail("example", Collections.singletonMap("someKey", "someValue"));
	}

}
