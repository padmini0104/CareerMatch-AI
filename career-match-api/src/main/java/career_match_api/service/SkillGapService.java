package career_match_api.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SkillGapService {

    public SkillGapResult analyzeSkillGap(
            List<String> matchedSkills,
            List<String> missingSkills) {

        List<SkillRecommendation> skillRecommendations =
                new ArrayList<>();


        // =====================================================
        // CREATE RECOMMENDATION FOR EACH MISSING SKILL
        // =====================================================

        for (String skill : missingSkills) {

            String priority;

            String recommendation;


            switch (skill.toLowerCase()) {


                // =============================================
                // HIGH PRIORITY
                // =============================================

                case "spring boot":

                    priority = "High";

                    recommendation =
                            "Learn Spring Boot fundamentals, "
                            + "dependency injection, REST APIs, "
                            + "Spring Data JPA and database integration.";

                    break;


                case "rest api":

                    priority = "High";

                    recommendation =
                            "Learn REST API development using "
                            + "HTTP methods, JSON, request/response "
                            + "handling, status codes and Postman.";

                    break;


                case "sql":

                    priority = "High";

                    recommendation =
                            "Practice SQL queries, joins, "
                            + "subqueries, grouping, indexing "
                            + "and database design.";

                    break;


                case "java":

                    priority = "High";

                    recommendation =
                            "Strengthen Java fundamentals, "
                            + "OOP, collections, exception handling "
                            + "and problem solving.";

                    break;


                case "data structures and algorithms":

                    priority = "High";

                    recommendation =
                            "Practice arrays, strings, linked lists, "
                            + "stacks, queues, trees, searching, "
                            + "sorting and algorithmic problem solving.";

                    break;


                // =============================================
                // MEDIUM PRIORITY
                // =============================================

                case "docker":

                    priority = "Medium";

                    recommendation =
                            "Learn Docker basics, Dockerfiles, "
                            + "images, containers and "
                            + "Docker Compose.";

                    break;


                case "git":

                    priority = "Medium";

                    recommendation =
                            "Learn Git commands, branching, "
                            + "merging, pull requests and "
                            + "GitHub workflows.";

                    break;


                // =============================================
                // DEFAULT
                // =============================================

                default:

                    priority = "Low";

                    recommendation =
                            "Learn and practice "
                            + skill
                            + " through projects, "
                            + "hands-on exercises and "
                            + "practical examples.";

                    break;
            }


            skillRecommendations.add(
                    new SkillRecommendation(
                            skill,
                            priority,
                            recommendation
                    )
            );
        }


        return new SkillGapResult(
                matchedSkills,
                missingSkills,
                skillRecommendations
        );
    }


    // =========================================================
    // SKILL RECOMMENDATION
    // =========================================================

    public static class SkillRecommendation {

        private String skill;

        private String priority;

        private String recommendation;


        public SkillRecommendation(
                String skill,
                String priority,
                String recommendation) {

            this.skill = skill;

            this.priority = priority;

            this.recommendation = recommendation;
        }


        public String getSkill() {
            return skill;
        }


        public String getPriority() {
            return priority;
        }


        public String getRecommendation() {
            return recommendation;
        }
    }


    // =========================================================
    // SKILL GAP RESULT
    // =========================================================

    public static class SkillGapResult {

        private List<String> matchedSkills;

        private List<String> missingSkills;

        private List<SkillRecommendation> skillRecommendations;


        public SkillGapResult(
                List<String> matchedSkills,
                List<String> missingSkills,
                List<SkillRecommendation> skillRecommendations) {

            this.matchedSkills = matchedSkills;

            this.missingSkills = missingSkills;

            this.skillRecommendations =
                    skillRecommendations;
        }


        public List<String> getMatchedSkills() {

            return matchedSkills;
        }


        public List<String> getMissingSkills() {

            return missingSkills;
        }


        public List<SkillRecommendation>
        getSkillRecommendations() {

            return skillRecommendations;
        }
    }
}