package career_match_api.controller;

import career_match_api.dto.JobDescriptionResponse;
import career_match_api.entity.JobDescription;
import career_match_api.service.JobDescriptionService;
import career_match_api.service.SkillExtractorService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;
    private final SkillExtractorService skillExtractorService;

    public JobDescriptionController(
            JobDescriptionService jobDescriptionService,
            SkillExtractorService skillExtractorService) {

        this.jobDescriptionService = jobDescriptionService;
        this.skillExtractorService = skillExtractorService;
    }

    @PostMapping
    public ResponseEntity<JobDescriptionResponse> createJobDescription(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            Authentication authentication) {

        // Get logged-in user's email from JWT
        String email = authentication.getName();

        JobDescription jobDescription =
                jobDescriptionService.createJobDescription(
                        email,
                        title,
                        description
                );

        return ResponseEntity.ok(
                JobDescriptionResponse.fromEntity(jobDescription)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobDescriptionResponse>>
            getMyJobDescriptions(
                    Authentication authentication) {

        // Get logged-in user's email from JWT
        String email = authentication.getName();

        List<JobDescriptionResponse> responses =
                jobDescriptionService
                        .getUserJobDescriptions(email)
                        .stream()
                        .map(JobDescriptionResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/extract-skills")
    public ResponseEntity<List<String>> extractJobSkills(
            @RequestParam("description") String description) {

        List<String> extractedSkills =
                skillExtractorService.extractSkills(description);

        return ResponseEntity.ok(extractedSkills);
    }
}