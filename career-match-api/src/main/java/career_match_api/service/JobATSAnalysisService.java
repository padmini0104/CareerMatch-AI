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
public class JobATSAnalysisService {

    private final ResumeRepository resumeRepository;

    private final JobDescriptionRepository jobDescriptionRepository;

    private final SkillExtractorService skillExtractorService;

    private final ATSAnalysisService atsAnalysisService;


    public JobATSAnalysisService(
            ResumeRepository resumeRepository,
            JobDescriptionRepository jobDescriptionRepository,
            SkillExtractorService skillExtractorService,
            ATSAnalysisService atsAnalysisService) {

        this.resumeRepository = resumeRepository;

        this.jobDescriptionRepository =
                jobDescriptionRepository;

        this.skillExtractorService =
                skillExtractorService;

        this.atsAnalysisService =
                atsAnalysisService;
    }


    public JobATSResult analyze(
            Long resumeId,
            Long jobId) {


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
        // EXTRACT JOB SKILLS
        // =====================================================

        List<String> jobSkills =
                skillExtractorService.extractSkills(
                        job.getDescription()
                );


        // =====================================================
        // GET RESUME SKILLS
        // =====================================================

        List<String> resumeSkills =
                resume.getExtractedSkills();


        // =====================================================
        // CONVERT RESUME SKILLS TO LOWERCASE
        // =====================================================

        Set<String> resumeSkillSet =
                new HashSet<>();


        if (resumeSkills != null) {

            for (String skill : resumeSkills) {

                if (skill != null) {

                    resumeSkillSet.add(
                            skill.toLowerCase()
                    );
                }
            }
        }


        // =====================================================
        // FIND MATCHED KEYWORDS
        // =====================================================

        List<String> matchedKeywords =
                new ArrayList<>();


        for (String skill : jobSkills) {

            if (resumeSkillSet.contains(
                    skill.toLowerCase()
            )) {

                matchedKeywords.add(skill);
            }
        }


        // =====================================================
        // FIND MISSING KEYWORDS
        // =====================================================

        List<String> missingKeywords =
                new ArrayList<>();


        for (String skill : jobSkills) {

            if (!resumeSkillSet.contains(
                    skill.toLowerCase()
            )) {

                missingKeywords.add(skill);
            }
        }


        // =====================================================
        // CALCULATE KEYWORD COVERAGE
        // =====================================================

        double keywordCoverage = 0.0;


        if (!jobSkills.isEmpty()) {

            keywordCoverage =
                    ((double) matchedKeywords.size()
                            / jobSkills.size())
                            * 100;
        }


        keywordCoverage =
                Math.round(
                        keywordCoverage * 100.0
                ) / 100.0;


        // =====================================================
        // GET GENERAL RESUME ATS SCORE
        // =====================================================

        ATSAnalysisService.ATSResult atsResult =
                atsAnalysisService.analyzeResume(
                        resumeId
                );


        double resumeATSScore =
                atsResult.getAtsScore();


        // =====================================================
        // CALCULATE JOB-SPECIFIC ATS SCORE
        //
        // 60% = General Resume ATS Quality
        // 40% = Job Keyword Coverage
        // =====================================================

        double jobSpecificATSScore =
                (resumeATSScore * 0.60)
                +
                (keywordCoverage * 0.40);


        jobSpecificATSScore =
                Math.round(
                        jobSpecificATSScore * 100.0
                ) / 100.0;


        // =====================================================
        // RETURN RESULT
        // =====================================================

        return new JobATSResult(

                resumeId,

                jobId,

                job.getTitle(),

                jobSkills,

                matchedKeywords,

                missingKeywords,

                keywordCoverage,

                resumeATSScore,

                jobSpecificATSScore
        );
    }


    // =========================================================
    // RESULT CLASS
    // =========================================================

    public static class JobATSResult {

        private Long resumeId;

        private Long jobId;

        private String jobTitle;

        private List<String> jobKeywords;

        private List<String> matchedKeywords;

        private List<String> missingKeywords;

        private double keywordCoverage;

        private double resumeATSScore;

        private double jobSpecificATSScore;


        public JobATSResult(

                Long resumeId,

                Long jobId,

                String jobTitle,

                List<String> jobKeywords,

                List<String> matchedKeywords,

                List<String> missingKeywords,

                double keywordCoverage,

                double resumeATSScore,

                double jobSpecificATSScore) {


            this.resumeId =
                    resumeId;

            this.jobId =
                    jobId;

            this.jobTitle =
                    jobTitle;

            this.jobKeywords =
                    jobKeywords;

            this.matchedKeywords =
                    matchedKeywords;

            this.missingKeywords =
                    missingKeywords;

            this.keywordCoverage =
                    keywordCoverage;

            this.resumeATSScore =
                    resumeATSScore;

            this.jobSpecificATSScore =
                    jobSpecificATSScore;
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


        public List<String> getJobKeywords() {

            return jobKeywords;
        }


        public List<String> getMatchedKeywords() {

            return matchedKeywords;
        }


        public List<String> getMissingKeywords() {

            return missingKeywords;
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
    }
}