package career_match_api.service;

import career_match_api.entity.JobDescription;
import career_match_api.entity.User;
import career_match_api.repository.JobDescriptionRepository;
import career_match_api.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;

    public JobDescriptionService(
            JobDescriptionRepository jobDescriptionRepository,
            UserRepository userRepository) {

        this.jobDescriptionRepository = jobDescriptionRepository;
        this.userRepository = userRepository;
    }

    public JobDescription createJobDescription(
            String email,
            String title,
            String description) {

        // Find the logged-in user using the JWT email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Validate job title
        if (title == null || title.isBlank()) {
            throw new RuntimeException(
                    "Job title is required");
        }

        // Validate job description
        if (description == null || description.isBlank()) {
            throw new RuntimeException(
                    "Job description is required");
        }

        // Create job description
        JobDescription jobDescription =
                new JobDescription();

        jobDescription.setTitle(title);
        jobDescription.setDescription(description);
        jobDescription.setCreatedAt(
                LocalDateTime.now());

        // Associate job with authenticated user
        jobDescription.setUser(user);

        return jobDescriptionRepository.save(
                jobDescription);
    }

    public List<JobDescription> getUserJobDescriptions(
            String email) {

        // Find the logged-in user using JWT email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Return only this user's jobs
        return jobDescriptionRepository.findByUserId(
                user.getId());
    }
}