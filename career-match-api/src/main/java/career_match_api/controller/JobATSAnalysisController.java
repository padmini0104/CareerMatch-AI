package career_match_api.controller;

import career_match_api.entity.JobDescription;
import career_match_api.entity.Resume;
import career_match_api.entity.User;
import career_match_api.repository.JobDescriptionRepository;
import career_match_api.repository.ResumeRepository;
import career_match_api.repository.UserRepository;
import career_match_api.service.JobATSAnalysisService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/job-ats")
public class JobATSAnalysisController {

    private final JobATSAnalysisService jobATSAnalysisService;

    private final ResumeRepository resumeRepository;

    private final JobDescriptionRepository jobDescriptionRepository;

    private final UserRepository userRepository;


    public JobATSAnalysisController(
            JobATSAnalysisService jobATSAnalysisService,
            ResumeRepository resumeRepository,
            JobDescriptionRepository jobDescriptionRepository,
            UserRepository userRepository) {

        this.jobATSAnalysisService =
                jobATSAnalysisService;

        this.resumeRepository =
                resumeRepository;

        this.jobDescriptionRepository =
                jobDescriptionRepository;

        this.userRepository =
                userRepository;
    }


    @GetMapping("/resume/{resumeId}/job/{jobId}")
    public ResponseEntity<JobATSAnalysisService.JobATSResult>
            analyzeJobATS(
                    @PathVariable Long resumeId,
                    @PathVariable Long jobId,
                    Authentication authentication) {


        // =====================================================
        // GET LOGGED-IN USER
        // =====================================================

        String email =
                authentication.getName();


        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        // =====================================================
        // FIND RESUME
        // =====================================================

        Resume resume =
                resumeRepository.findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );


        // =====================================================
        // CHECK RESUME OWNERSHIP
        // =====================================================

        if (!resume.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to analyze this resume"
            );
        }


        // =====================================================
        // FIND JOB
        // =====================================================

        JobDescription job =
                jobDescriptionRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job description not found"
                                )
                        );


        // =====================================================
        // CHECK JOB OWNERSHIP
        // =====================================================

        if (!job.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to analyze this job"
            );
        }


        // =====================================================
        // PERFORM JOB-SPECIFIC ATS ANALYSIS
        // =====================================================

        JobATSAnalysisService.JobATSResult result =
                jobATSAnalysisService.analyze(
                        resumeId,
                        jobId
                );


        return ResponseEntity.ok(result);
    }
}