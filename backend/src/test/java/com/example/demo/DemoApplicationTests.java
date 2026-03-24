package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

	@Autowired
	private TestRestTemplate restTemplate;

	@Test
	void postDebateReturnsApiShape() {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		String body = "{\"topic\":\"test topic\",\"rounds\":2,\"style\":\"balanced\"}";
		ResponseEntity<String> r = restTemplate.postForEntity(
				"/api/debate",
				new HttpEntity<>(body, headers),
				String.class);
		assertEquals(HttpStatus.OK, r.getStatusCode());
		String json = r.getBody();
		assertNotNull(json);
		assertTrue(json.contains("\"turns\""));
		assertTrue(json.contains("\"evaluation\""));
		assertTrue(json.contains("\"winner\""));
		assertTrue(json.contains("\"metrics\""));
		assertTrue(json.contains("\"models\""));
	}
}
