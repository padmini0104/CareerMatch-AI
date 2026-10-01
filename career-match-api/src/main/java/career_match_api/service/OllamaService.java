package career_match_api.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class OllamaService {

    private final RestClient restClient;

    private static final String OLLAMA_URL =
            "http://localhost:11434";

    private static final String MODEL =
            "llama3.2";

    public OllamaService() {
        this.restClient = RestClient.builder()
                .baseUrl(OLLAMA_URL)
                .build();
    }

    public String generateCareerAdvice(
            String resumeText,
            String jobDescription) {

        String prompt = """
                You are an AI career assistant for a platform called CareerMatch AI.

                Analyze the candidate's resume against the provided job description.

                Give practical, concise, and personalized career advice.

                Focus on:

                1. Skills the candidate already has
                2. Important missing skills
                3. Resume improvements
                4. Projects the candidate could add or improve
                5. Recommended learning areas

                Candidate Resume:
                %s

                Job Description:
                %s

                Give the response using clear sections and bullet points.

                Important rules:
                - Do not invent qualifications.
                - Do not invent work experience.
                - Do not invent certifications.
                - Do not invent skills.
                - Base your advice only on the resume and job description.
                - Clearly distinguish existing skills from missing skills.
                - Keep the advice practical for a job seeker.
                """.formatted(
                resumeText,
                jobDescription
        );

        try {

            Map<String, Object> requestBody =
                    Map.of(
                            "model", MODEL,
                            "prompt", prompt,
                            "stream", false
                    );

            Map<String, Object> response =
                    restClient.post()
                            .uri("/api/generate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(requestBody)
                            .retrieve()
                            .body(Map.class);

            if (response == null) {
                throw new RuntimeException(
                        "No response received from Ollama"
                );
            }

            Object generatedResponse =
                    response.get("response");

            if (generatedResponse == null) {
                throw new RuntimeException(
                        "Ollama returned an empty response"
                );
            }

            return generatedResponse.toString().trim();

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to generate AI career advice: "
                            + exception.getMessage(),
                    exception
            );
        }
    }
}