package career_match_api.controller;

import career_match_api.entity.JobDescription;
import career_match_api.entity.Resume;
import career_match_api.entity.User;
import career_match_api.repository.JobDescriptionRepository;
import career_match_api.repository.ResumeRepository;
import career_match_api.repository.UserRepository;
import career_match_api.service.ResumeMatchingService;
import career_match_api.service.SkillGapService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matching")
public class ResumeMatchingController {

    private final ResumeMatchingService resumeMatchingService;

    private final SkillGapService skillGapService;

    private final ResumeRepository resumeRepository;

    private final JobDescriptionRepository jobDescriptionRepository;

    private final UserRepository userRepository;


    public ResumeMatchingController(
            ResumeMatchingService resumeMatchingService,
            SkillGapService skillGapService,
            ResumeRepository resumeRepository,
            JobDescriptionRepository jobDescriptionRepository,
            UserRepository userRepository) {

        this.resumeMatchingService =
                resumeMatchingService;

        this.skillGapService =
                skillGapService;

        this.resumeRepository =
                resumeRepository;

        this.jobDescriptionRepository =
                jobDescriptionRepository;

        this.userRepository =
                userRepository;
    }


    @PostMapping("/resume/{resumeId}/job/{jobId}")
    public ResponseEntity<MatchAnalysisResponse>
            matchResumeWithJob(
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
        // CALCULATE RESUME-JOB MATCH
        // =====================================================

        ResumeMatchingService.MatchResult matchResult =
                resumeMatchingService.matchResumeWithJob(
                        resumeId,
                        jobId
                );


        // =====================================================
        // ANALYZE SKILL GAP
        // =====================================================

        SkillGapService.SkillGapResult skillGapResult =
                skillGapService.analyzeSkillGap(
                        matchResult.getMatchedSkills(),
                        matchResult.getMissingSkills()
                );


        // =====================================================
        // COMBINE RESULTS
        // =====================================================

        MatchAnalysisResponse response =
                new MatchAnalysisResponse(
                        matchResult.getResumeId(),
                        matchResult.getJobId(),
                        matchResult.getJobTitle(),
                        matchResult.getRequiredSkills(),
                        skillGapResult.getMatchedSkills(),
                        skillGapResult.getMissingSkills(),
                        matchResult.getMatchPercentage(),
                        skillGapResult.getSkillRecommendations()
                );


        return ResponseEntity.ok(response);
    }


    // =========================================================
    // RESPONSE CLASS
    // =========================================================

    public static class MatchAnalysisResponse {

        private Long resumeId;

        private Long jobId;

        private String jobTitle;

        private java.util.List<String> requiredSkills;

        private java.util.List<String> matchedSkills;

        private java.util.List<String> missingSkills;

        private double matchPercentage;

        private java.util.List<
                SkillGapService.SkillRecommendation>
                skillRecommendations;


        public MatchAnalysisResponse(
                Long resumeId,
                Long jobId,
                String jobTitle,
                java.util.List<String> requiredSkills,
                java.util.List<String> matchedSkills,
                java.util.List<String> missingSkills,
                double matchPercentage,
                java.util.List<
                        SkillGapService.SkillRecommendation>
                        skillRecommendations) {

            this.resumeId =
                    resumeId;

            this.jobId =
                    jobId;

            this.jobTitle =
                    jobTitle;

            this.requiredSkills =
                    requiredSkills;

            this.matchedSkills =
                    matchedSkills;

            this.missingSkills =
                    missingSkills;

            this.matchPercentage =
                    matchPercentage;

            this.skillRecommendations =
                    skillRecommendations;
        }


        public Long getResumeId() {
            return resumeId;
        }


        public Long getJobId() {
            return jobId;
        }


        public String getJobTitle() {
            return jobTitle;
        }


        public java.util.List<String>
        getRequiredSkills() {

            return requiredSkills;
        }


        public java.util.List<String>
        getMatchedSkills() {

            return matchedSkills;
        }


        public java.util.List<String>
        getMissingSkills() {

            return missingSkills;
        }


        public double getMatchPercentage() {
            return matchPercentage;
        }


        public java.util.List<
                SkillGapService.SkillRecommendation>
        getSkillRecommendations() {

            return skillRecommendations;
        }
    }
}