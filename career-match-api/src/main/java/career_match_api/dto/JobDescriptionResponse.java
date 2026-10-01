package career_match_api.dto;

import career_match_api.entity.JobDescription;

import java.time.LocalDateTime;

public class JobDescriptionResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;

    public JobDescriptionResponse() {
    }

    public JobDescriptionResponse(
            Long id,
            String title,
            String description,
            LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
    }

    public static JobDescriptionResponse fromEntity(
            JobDescription jobDescription) {

        return new JobDescriptionResponse(
                jobDescription.getId(),
                jobDescription.getTitle(),
                jobDescription.getDescription(),
                jobDescription.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}