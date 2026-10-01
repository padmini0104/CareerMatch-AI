package career_match_api.controller;

import career_match_api.entity.JobDescription;
import career_match_api.entity.Resume;
import career_match_api.entity.User;
import career_match_api.repository.JobDescriptionRepository;
import career_match_api.repository.ResumeRepository;
import career_match_api.repository.UserRepository;
import career_match_api.service.OllamaService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AICareerAdviceController {

    private final OllamaService ollamaService;
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;

    public AICareerAdviceController(
            OllamaService ollamaService,
            ResumeRepository resumeRepository,
            JobDescriptionRepository jobDescriptionRepository,
            UserRepository userRepository) {

        this.ollamaService = ollamaService;
        this.resumeRepository = resumeRepository;
        this.jobDescriptionRepository = jobDescriptionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/career-advice/resume/{resumeId}/job/{jobId}")
    public ResponseEntity<Map<String, Object>> getCareerAdvice(
            @PathVariable Long resumeId,
            @PathVariable Long jobId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new RuntimeException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not authorized to access this resume");
        }

        JobDescription jobDescription =
                jobDescriptionRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job description not found"));

        if (!jobDescription.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this job");
        }

        String careerAdvice =
                ollamaService.generateCareerAdvice(
                        resume.getExtractedText(),
                        jobDescription.getDescription()
                );

        Map<String, Object> response = Map.of(
                "resumeId", resumeId,
                "jobId", jobId,
                "jobTitle", jobDescription.getTitle(),
                "careerAdvice", careerAdvice
        );

        return ResponseEntity.ok(response);
    }
}