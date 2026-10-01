package career_match_api.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SkillExtractorService {

    private final List<String> skills = List.of(
            "Java",
            "C",
            "Python",
            "SQL",
            "Data Structures and Algorithms",
            "Object-Oriented Programming",
            "OOP",
            "Collections",
            "File Handling",
            "Exception Handling",
            "HTML",
            "CSS",
            "JavaScript",
            "Microsoft Excel",
            "Power BI",
            "Tableau",
            "Data Analysis",
            "Data Visualization",
            "Machine Learning",
            "Random Forest",
            "Pandas",
            "NumPy",
            "Scikit-learn",
            "Git",
            "Jenkins",
            "Eclipse IDE",
            "Visual Studio Code",

            // Backend and development skills
            "Spring Boot",
            "REST API",
            "Docker",

            // Cybersecurity
            "Cybersecurity",
            "Web Application Security",
            "Network Security",
            "Security Testing",
            "Security Automation"
    );

    public List<String> extractSkills(String resumeText) {

        if (resumeText == null || resumeText.isBlank()) {
            return Collections.emptyList();
        }

        return skills.stream()
                .filter(skill -> {

                    String pattern =
                            "(?i)(?<![a-zA-Z0-9])"
                            + Pattern.quote(skill)
                            + "(?![a-zA-Z0-9])";

                    return Pattern.compile(pattern)
                            .matcher(resumeText)
                            .find();
                })
                .distinct()
                .collect(Collectors.toList());
    }
}