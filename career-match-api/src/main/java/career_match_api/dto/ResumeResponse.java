package career_match_api.dto;

import career_match_api.entity.Resume;

import java.time.LocalDateTime;
import java.util.List;

public class ResumeResponse {

    private Long id;
    private String fileName;
    private String fileType;
    private String filePath;
    private String extractedText;
    private List<String> extractedSkills;
    private LocalDateTime uploadedAt;

    public ResumeResponse() {
    }

    public ResumeResponse(
            Long id,
            String fileName,
            String fileType,
            String filePath,
            String extractedText,
            List<String> extractedSkills,
            LocalDateTime uploadedAt) {

        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.extractedText = extractedText;
        this.extractedSkills = extractedSkills;
        this.uploadedAt = uploadedAt;
    }

    public static ResumeResponse fromEntity(Resume resume) {

        return new ResumeResponse(
                resume.getId(),
                resume.getFileName(),
                resume.getFileType(),
                resume.getFilePath(),
                resume.getExtractedText(),
                resume.getExtractedSkills(),
                resume.getUploadedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public List<String> getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(List<String> extractedSkills) {
        this.extractedSkills = extractedSkills;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}