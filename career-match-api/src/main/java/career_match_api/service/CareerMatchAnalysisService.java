package career_match_api.service;

import org.springframework.stereotype.Service;

@Service
public class CareerMatchAnalysisService {

    private final ResumeMatchingService resumeMatchingService;
    private final ATSAnalysisService atsAnalysisService;
    private final JobATSAnalysisService jobATSAnalysisService;
    private final SkillGapService skillGapService;


    public CareerMatchAnalysisService(
            ResumeMatchingService resumeMatchingService,
            ATSAnalysisService atsAnalysisService,
            JobATSAnalysisService jobATSAnalysisService,
            SkillGapService skillGapService) {

        this.resumeMatchingService =
                resumeMatchingService;

        this.atsAnalysisService =
                atsAnalysisService;

        this.jobATSAnalysisService =
                jobATSAnalysisService;

        this.skillGapService =
                skillGapService;
    }


    public CareerMatchResult analyze(
            Long resumeId,
            Long jobId) {


        // =====================================================
        // RESUME + JOB MATCHING
        // =====================================================

        ResumeMatchingService.MatchResult matchResult =
                resumeMatchingService.matchResumeWithJob(
                        resumeId,
                        jobId
                );


        // =====================================================
        // GENERAL RESUME ATS
        // =====================================================

        ATSAnalysisService.ATSResult atsResult =
                atsAnalysisService.analyzeResume(
                        resumeId
                );


        // =====================================================
        // JOB-SPECIFIC ATS
        // =====================================================

        JobATSAnalysisService.JobATSResult jobATSResult =
                jobATSAnalysisService.analyze(
                        resumeId,
                        jobId
                );


        // =====================================================
        // SKILL GAP ANALYSIS
        // =====================================================

        SkillGapService.SkillGapResult skillGapResult =
                skillGapService.analyzeSkillGap(
                        matchResult.getMatchedSkills(),
                        matchResult.getMissingSkills()
                );


        // =====================================================
        // COMBINED RESULT
        // =====================================================

        return new CareerMatchResult(

                matchResult.getResumeId(),

                matchResult.getJobId(),

                matchResult.getJobTitle(),

                matchResult.getMatchPercentage(),

                atsResult.getAtsScore(),

                jobATSResult.getKeywordCoverage(),

                jobATSResult.getResumeATSScore(),

                jobATSResult.getJobSpecificATSScore(),

                matchResult.getRequiredSkills(),

                matchResult.getMatchedSkills(),

                matchResult.getMissingSkills(),

                atsResult.getStrengths(),

                atsResult.getImprovements(),

                skillGapResult.getSkillRecommendations()
        );
    }


    // =========================================================
    // CAREER MATCH RESULT
    // =========================================================

    public static class CareerMatchResult {

        private Long resumeId;

        private Long jobId;

        private String jobTitle;

        private double matchPercentage;

        private double atsScore;

        private double keywordCoverage;

        private double resumeATSScore;

        private double jobSpecificATSScore;

        private java.util.List<String> requiredSkills;

        private java.util.List<String> matchedSkills;

        private java.util.List<String> missingSkills;

        private java.util.List<String> atsStrengths;

        private java.util.List<String> atsImprovements;

        private java.util.List<
                SkillGapService.SkillRecommendation>
                skillRecommendations;


        public CareerMatchResult(

                Long resumeId,

                Long jobId,

                String jobTitle,

                double matchPercentage,

                double atsScore,

                double keywordCoverage,

                double resumeATSScore,

                double jobSpecificATSScore,

                java.util.List<String> requiredSkills,

                java.util.List<String> matchedSkills,

                java.util.List<String> missingSkills,

                java.util.List<String> atsStrengths,

                java.util.List<String> atsImprovements,

                java.util.List<
                        SkillGapService.SkillRecommendation>
                        skillRecommendations) {


            this.resumeId =
                    resumeId;

            this.jobId =
                    jobId;

            this.jobTitle =
                    jobTitle;

            this.matchPercentage =
                    matchPercentage;

            this.atsScore =
                    atsScore;

            this.keywordCoverage =
                    keywordCoverage;

            this.resumeATSScore =
                    resumeATSScore;

            this.jobSpecificATSScore =
                    jobSpecificATSScore;

            this.requiredSkills =
                    requiredSkills;

            this.matchedSkills =
                    matchedSkills;

            this.missingSkills =
                    missingSkills;

            this.atsStrengths =
                    atsStrengths;

            this.atsImprovements =
                    atsImprovements;

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


        public double getMatchPercentage() {

            return matchPercentage;
        }


        public double getAtsScore() {

            return atsScore;
        }


        public double getKeywordCoverage() {

            return keywordCoverage;
        }


        public double getResumeATSScore() {

            return resumeATSScore;
        }


        public double getJobSpecificATSScore() {

            return jobSpecificATSScore;
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


        public java.util.List<String>
        getAtsStrengths() {

            return atsStrengths;
        }


        public java.util.List<String>
        getAtsImprovements() {

            return atsImprovements;
        }


        public java.util.List<
                SkillGapService.SkillRecommendation>
        getSkillRecommendations() {

            return skillRecommendations;
        }
    }
}