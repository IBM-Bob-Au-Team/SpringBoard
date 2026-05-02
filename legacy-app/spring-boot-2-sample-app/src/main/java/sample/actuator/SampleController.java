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

import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;

import org.springframework.context.annotation.Description;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * REST controller for handling hello message requests.
 * Provides endpoints for retrieving and posting hello messages.
 *
 * @author Spring Boot Team
 * @since 3.1.5
 */
@Controller
@Description("A controller for handling requests for hello messages")
public class SampleController {

	private final HelloWorldService helloWorldService;

	/**
	 * Constructs a new SampleController with the specified HelloWorldService.
	 *
	 * @param helloWorldService the service used to generate hello messages
	 */
	public SampleController(HelloWorldService helloWorldService) {
		this.helloWorldService = helloWorldService;
	}

	/**
	 * Handles GET requests to the root endpoint and returns a hello message.
	 *
	 * @return a map containing the hello message from the service
	 */
	@GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, String> hello() {
		return Collections.singletonMap("message",
				this.helloWorldService.getHelloMessage());
	}

	/**
	 * Handles POST requests to the root endpoint with a validated message.
	 * Returns a response containing the message, title, and current date.
	 *
	 * @param message the validated message object from the request body
	 * @return a map containing the message details, title, and timestamp
	 */
	@PostMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public Map<String, Object> olleh(@Validated Message message) {
		Map<String, Object> model = new LinkedHashMap<>();
		model.put("message", message.getValue());
		model.put("title", "Hello Home");
		model.put("date", new Date());
		return model;
	}

	/**
	 * Test endpoint that always throws an exception.
	 * Used for testing error handling and monitoring.
	 *
	 * @return never returns normally
	 * @throws IllegalArgumentException always thrown to simulate a server error
	 */
	@RequestMapping("/foo")
	@ResponseBody
	public String foo() {
		throw new IllegalArgumentException("Server error");
	}

	/**
	 * Inner class representing a message with validation constraints.
	 */
	protected static class Message {

		@NotBlank(message = "Message value cannot be empty")
		private String value;

		/**
		 * Gets the message value.
		 *
		 * @return the message value
		 */
		public String getValue() {
			return this.value;
		}

		/**
		 * Sets the message value.
		 *
		 * @param value the message value to set
		 */
		public void setValue(String value) {
			this.value = value;
		}

	}

}
