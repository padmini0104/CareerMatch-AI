package career_match_api.service;

import career_match_api.entity.Resume;
import career_match_api.entity.User;
import career_match_api.repository.ResumeRepository;
import career_match_api.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeTextExtractorService textExtractorService;
    private final SkillExtractorService skillExtractorService;

    private final String uploadDirectory = "uploads/resumes/";

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            ResumeTextExtractorService textExtractorService,
            SkillExtractorService skillExtractorService) {

        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.textExtractorService = textExtractorService;
        this.skillExtractorService = skillExtractorService;
    }

    public Resume uploadResume(
            String email,
            MultipartFile file) throws IOException {

        // Find logged-in user using JWT email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Validate empty file
        if (file.isEmpty()) {
            throw new RuntimeException(
                    "Resume file is empty");
        }

        // Get original filename
        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null
                || originalFileName.isBlank()) {

            throw new RuntimeException(
                    "Invalid file name");
        }

        // Get file extension
        String lowerFileName =
                originalFileName.toLowerCase(Locale.ROOT);

        boolean isPdf =
                lowerFileName.endsWith(".pdf");

        boolean isDocx =
                lowerFileName.endsWith(".docx");

        // Allow only PDF and DOCX
        if (!isPdf && !isDocx) {
            throw new RuntimeException(
                    "Only PDF and DOCX files are allowed");
        }

        // Get content type
        String contentType = file.getContentType();

        // Use standard MIME type when possible
        if (isPdf) {
            contentType = "application/pdf";
        } else if (isDocx) {
            contentType =
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }

        // Create upload directory
        Path uploadPath =
                Paths.get(uploadDirectory);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate safe unique filename
        String fileExtension =
                isPdf ? ".pdf" : ".docx";

        String storedFileName =
                UUID.randomUUID()
                        + fileExtension;

        Path filePath =
                uploadPath.resolve(storedFileName);

        // Save file
        Files.copy(
                file.getInputStream(),
                filePath
        );

        // Extract text
        String extractedText = "";

        if (isPdf) {

            extractedText =
                    textExtractorService
                            .extractTextFromPdf(filePath);

        } else if (isDocx) {

            extractedText =
                    textExtractorService
                            .extractTextFromDocx(filePath);
        }

        // Extract skills
        List<String> extractedSkills =
                new ArrayList<>();

        if (!extractedText.isBlank()) {

            extractedSkills =
                    skillExtractorService
                            .extractSkills(extractedText);
        }

        System.out.println(
                "Detected Skills: "
                        + extractedSkills
        );

        // Create resume entity
        Resume resume = new Resume();

        // Keep original filename for display
        resume.setFileName(originalFileName);

        resume.setFileType(contentType);

        // Store only the safe generated filename
        resume.setFilePath(filePath.toString());

        resume.setExtractedText(extractedText);

        resume.setExtractedSkills(extractedSkills);

        resume.setUploadedAt(LocalDateTime.now());

        // Associate resume with logged-in user
        resume.setUser(user);

        return resumeRepository.save(resume);
    }

    public List<Resume> getUserResumesByEmail(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return resumeRepository.findByUserId(
                user.getId()
        );
    }

    // =====================================================
    // DELETE RESUME
    // =====================================================

    public void deleteResume(
            Long resumeId,
            String email) throws IOException {

        // Find logged-in user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Find resume
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new RuntimeException("Resume not found"));

        // Security check:
        // Make sure the resume belongs to
        // the currently logged-in user.
        if (resume.getUser() == null
                || !resume.getUser().getId()
                        .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to delete this resume");
        }

        // Get physical file path
        String filePath = resume.getFilePath();

        // Delete physical file first
        if (filePath != null
                && !filePath.isBlank()) {

            Path path =
                    Paths.get(filePath);

            try {

                Files.deleteIfExists(path);

            } catch (IOException exception) {

                throw new IOException(
                        "Unable to delete the uploaded resume file",
                        exception
                );
            }
        }

        // Delete database record
        resumeRepository.delete(resume);
    }
}