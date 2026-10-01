package career_match_api.service;

import career_match_api.entity.Resume;
import career_match_api.repository.ResumeRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ATSAnalysisService {

    private final ResumeRepository resumeRepository;

    public ATSAnalysisService(
            ResumeRepository resumeRepository) {

        this.resumeRepository = resumeRepository;
    }


    public ATSResult analyzeResume(Long resumeId) {

        Resume resume =
                resumeRepository.findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );


        String text =
                resume.getExtractedText();


        if (text == null || text.isBlank()) {

            throw new RuntimeException(
                    "No extracted text available for this resume"
            );
        }


        String lowerText =
                text.toLowerCase();


        List<String> strengths =
                new ArrayList<>();

        List<String> improvements =
                new ArrayList<>();


        double score = 0;


        // =====================================================
        // 1. CONTACT INFORMATION - 10 POINTS
        // =====================================================

        boolean hasEmail =
                Pattern.compile(
                        "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
                )
                .matcher(text)
                .find();


        boolean hasPhone =
                Pattern.compile(
                        "(?<!\\d)(?:\\+91[-\\s]?)?[6-9]\\d{9}(?!\\d)"
                )
                .matcher(text)
                .find();


        if (hasEmail) {

            score += 5;

            strengths.add(
                    "Professional email address detected"
            );

        } else {

            improvements.add(
                    "Add a professional email address"
            );
        }


        if (hasPhone) {

            score += 5;

            strengths.add(
                    "Phone number detected"
            );

        } else {

            improvements.add(
                    "Add a valid phone number"
            );
        }


        // =====================================================
        // 2. RESUME SECTIONS - 20 POINTS
        // =====================================================

        int sectionScore = 0;


        if (containsAny(
                lowerText,
                "education",
                "academic",
                "qualification"
        )) {

            sectionScore += 5;

            strengths.add(
                    "Education section detected"
            );

        } else {

            improvements.add(
                    "Add a clearly labeled Education section"
            );
        }


        if (containsAny(
                lowerText,
                "skills",
                "technical skills",
                "technologies"
        )) {

            sectionScore += 5;

            strengths.add(
                    "Skills section detected"
            );

        } else {

            improvements.add(
                    "Add a clearly labeled Skills section"
            );
        }


        if (containsAny(
                lowerText,
                "projects",
                "project experience"
        )) {

            sectionScore += 5;

            strengths.add(
                    "Projects section detected"
            );

        } else {

            improvements.add(
                    "Add a Projects section with relevant projects"
            );
        }


        if (containsAny(
                lowerText,
                "experience",
                "internship",
                "work experience",
                "professional experience"
        )) {

            sectionScore += 5;

            strengths.add(
                    "Experience or internship section detected"
            );

        } else {

            improvements.add(
                    "Consider adding internship or experience information if applicable"
            );
        }


        score += sectionScore;


        // =====================================================
        // 3. SKILLS - 15 POINTS
        // =====================================================

        List<String> extractedSkills =
                resume.getExtractedSkills();


        if (extractedSkills != null
                && !extractedSkills.isEmpty()) {

            int skillCount =
                    extractedSkills.size();


            if (skillCount >= 10) {

                score += 15;

                strengths.add(
                        "Strong number of technical skills detected"
                );

            } else if (skillCount >= 5) {

                score += 10;

                strengths.add(
                        "Multiple technical skills detected"
                );

                improvements.add(
                        "Consider adding more relevant technical skills"
                );

            } else {

                score += 5;

                improvements.add(
                        "Add more relevant technical skills"
                );
            }

        } else {

            improvements.add(
                    "Add relevant technical skills"
            );
        }


        // =====================================================
        // 4. PROJECTS / EXPERIENCE - 15 POINTS
        // =====================================================

        boolean hasProjectDetails =
                containsAny(
                        lowerText,
                        "developed",
                        "implemented",
                        "designed",
                        "created",
                        "built",
                        "project"
                );


        boolean hasExperienceDetails =
                containsAny(
                        lowerText,
                        "internship",
                        "intern",
                        "experience",
                        "worked",
                        "responsible"
                );


        if (hasProjectDetails
                && hasExperienceDetails) {

            score += 15;

            strengths.add(
                    "Projects and experience details detected"
            );

        } else if (hasProjectDetails) {

            score += 12;

            strengths.add(
                    "Project implementation details detected"
            );

            improvements.add(
                    "Add more professional or internship experience if applicable"
            );

        } else if (hasExperienceDetails) {

            score += 10;

            strengths.add(
                    "Experience information detected"
            );

            improvements.add(
                    "Add detailed project descriptions"
            );

        } else {

            score += 3;

            improvements.add(
                    "Add detailed project or experience descriptions"
            );
        }


        // =====================================================
        // 5. EDUCATION - 10 POINTS
        // =====================================================

        boolean hasDegree =
                containsAny(
                        lowerText,
                        "b.tech",
                        "btech",
                        "bachelor",
                        "b.e",
                        "be ",
                        "degree",
                        "computer science"
                );


        if (hasDegree) {

            score += 10;

            strengths.add(
                    "Academic qualification detected"
            );

        } else {

            improvements.add(
                    "Include your degree and academic qualification"
            );
        }


        // =====================================================
        // 6. CERTIFICATIONS - 5 POINTS
        // =====================================================

        boolean hasCertifications =
                containsAny(
                        lowerText,
                        "certification",
                        "certifications",
                        "certificate"
                );


        if (hasCertifications) {

            score += 5;

            strengths.add(
                    "Certifications detected"
            );

        } else {

            improvements.add(
                    "Add relevant certifications if available"
            );
        }


        // =====================================================
        // 7. QUANTIFIABLE ACHIEVEMENTS - 10 POINTS
        // =====================================================

        boolean hasNumbers =
                Pattern.compile(
                        "(?s).*\\b\\d+(?:\\.\\d+)?%.*"
                )
                .matcher(text)
                .find();


        boolean hasMetrics =
                Pattern.compile(
                        "(?s).*\\b\\d+\\+?\\s*(?:users|projects|records|"
                        + "datasets|employees|customers|months|years|"
                        + "features|test cases|cases).*"
                )
                .matcher(lowerText)
                .find();


        if (hasNumbers || hasMetrics) {

            score += 10;

            strengths.add(
                    "Quantifiable information or metrics detected"
            );

        } else {

            improvements.add(
                    "Add measurable achievements such as percentages, "
                    + "performance improvements, project results, or scale"
            );
        }


        // =====================================================
        // 8. ACTION-ORIENTED LANGUAGE - 10 POINTS
        // =====================================================

        String[] actionWords = {

                "developed",
                "implemented",
                "designed",
                "created",
                "built",
                "analyzed",
                "optimized",
                "automated",
                "managed",
                "integrated",
                "tested",
                "deployed",
                "configured",
                "improved",
                "achieved"

        };


        int actionWordCount = 0;


        for (String actionWord : actionWords) {

            if (lowerText.contains(actionWord)) {
                actionWordCount++;
            }
        }


        if (actionWordCount >= 6) {

            score += 10;

            strengths.add(
                    "Strong use of action-oriented language"
            );

        } else if (actionWordCount >= 3) {

            score += 7;

            strengths.add(
                    "Good use of action-oriented language"
            );

            improvements.add(
                    "Use more action verbs when describing your work"
            );

        } else if (actionWordCount >= 1) {

            score += 4;

            improvements.add(
                    "Use stronger action verbs such as developed, "
                    + "implemented, optimized and automated"
            );

        } else {

            improvements.add(
                    "Use action verbs to describe your contributions"
            );
        }


        // =====================================================
        // 9. RESUME LENGTH / READABILITY - 5 POINTS
        // =====================================================

        String[] words =
                text.trim().split("\\s+");


        int wordCount =
                words.length;


        if (wordCount >= 300
                && wordCount <= 1200) {

            score += 5;

            strengths.add(
                    "Resume contains an appropriate amount of content"
            );

        } else if (wordCount < 300) {

            score += 2;

            improvements.add(
                    "Resume may be too short; add relevant achievements, "
                    + "project details and skills"
            );

        } else {

            score += 3;

            improvements.add(
                    "Resume may contain excessive content; "
                    + "consider removing less relevant information"
            );
        }


        // =====================================================
        // FINAL SCORE
        // =====================================================

        score =
                Math.min(score, 100);


        score =
                Math.round(score * 100.0)
                        / 100.0;


        return new ATSResult(
                resumeId,
                score,
                strengths,
                improvements
        );
    }


    // =========================================================
    // HELPER METHOD
    // =========================================================

    private boolean containsAny(
            String text,
            String... keywords) {

        for (String keyword : keywords) {

            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }


    // =========================================================
    // RESULT CLASS
    // =========================================================

    public static class ATSResult {

        private Long resumeId;

        private double atsScore;

        private List<String> strengths;

        private List<String> improvements;


        public ATSResult(
                Long resumeId,
                double atsScore,
                List<String> strengths,
                List<String> improvements) {

            this.resumeId = resumeId;

            this.atsScore = atsScore;

            this.strengths = strengths;

            this.improvements = improvements;
        }


        public Long getResumeId() {
            return resumeId;
        }


        public double getAtsScore() {
            return atsScore;
        }


        public List<String> getStrengths() {
            return strengths;
        }


        public List<String> getImprovements() {
            return improvements;
        }
    }
}