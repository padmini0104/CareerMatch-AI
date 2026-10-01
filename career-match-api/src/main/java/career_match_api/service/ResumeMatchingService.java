package career_match_api.service;

import career_match_api.entity.JobDescription;
import career_match_api.entity.Resume;
import career_match_api.repository.JobDescriptionRepository;
import career_match_api.repository.ResumeRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ResumeMatchingService {

    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final SkillExtractorService skillExtractorService;

    public ResumeMatchingService(
            ResumeRepository resumeRepository,
            JobDescriptionRepository jobDescriptionRepository,
            SkillExtractorService skillExtractorService) {

        this.resumeRepository = resumeRepository;
        this.jobDescriptionRepository = jobDescriptionRepository;
        this.skillExtractorService = skillExtractorService;
    }

    public MatchResult matchResumeWithJob(
            Long resumeId,
            Long jobId) {

        // Find resume
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new RuntimeException("Resume not found"));

        // Find saved job description
        JobDescription jobDescription =
                jobDescriptionRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException("Job description not found"));

        // Get skills from resume
        List<String> resumeSkills =
                resume.getExtractedSkills();

        // Extract required skills from saved job description
        List<String> jobSkills =
                skillExtractorService.extractSkills(
                        jobDescription.getDescription());

        // Convert resume skills to lowercase
        // for case-insensitive comparison
        Set<String> resumeSkillSet = new HashSet<>();

        for (String skill : resumeSkills) {
            resumeSkillSet.add(skill.toLowerCase());
        }

        // Find matched skills
        List<String> matchedSkills = new ArrayList<>();

        for (String jobSkill : jobSkills) {

            if (resumeSkillSet.contains(
                    jobSkill.toLowerCase())) {

                matchedSkills.add(jobSkill);
            }
        }

        // Find missing skills
        List<String> missingSkills = new ArrayList<>();

        for (String jobSkill : jobSkills) {

            if (!resumeSkillSet.contains(
                    jobSkill.toLowerCase())) {

                missingSkills.add(jobSkill);
            }
        }

        // Calculate match percentage
        double matchPercentage = 0.0;

        if (!jobSkills.isEmpty()) {

            matchPercentage =
                    ((double) matchedSkills.size()
                            / jobSkills.size()) * 100;
        }

        // Round to 2 decimal places
        matchPercentage =
                Math.round(matchPercentage * 100.0) / 100.0;

        return new MatchResult(
                resumeId,
                jobId,
                jobDescription.getTitle(),
                jobSkills,
                matchedSkills,
                missingSkills,
                matchPercentage
        );
    }

    public static class MatchResult {

        private Long resumeId;
        private Long jobId;
        private String jobTitle;
        private List<String> requiredSkills;
        private List<String> matchedSkills;
        private List<String> missingSkills;
        private double matchPercentage;

        public MatchResult(
                Long resumeId,
                Long jobId,
                String jobTitle,
                List<String> requiredSkills,
                List<String> matchedSkills,
                List<String> missingSkills,
                double matchPercentage) {

            this.resumeId = resumeId;
            this.jobId = jobId;
            this.jobTitle = jobTitle;
            this.requiredSkills = requiredSkills;
            this.matchedSkills = matchedSkills;
            this.missingSkills = missingSkills;
            this.matchPercentage = matchPercentage;
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

        public List<String> getRequiredSkills() {
            return requiredSkills;
        }

        public List<String> getMatchedSkills() {
            return matchedSkills;
        }

        public List<String> getMissingSkills() {
            return missingSkills;
        }

        public double getMatchPercentage() {
            return matchPercentage;
        }
    }
}