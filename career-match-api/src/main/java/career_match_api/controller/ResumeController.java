package career_match_api.controller;

import career_match_api.dto.ResumeResponse;
import career_match_api.entity.Resume;
import career_match_api.service.ResumeService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication)
            throws IOException {

        String email = authentication.getName();

        Resume resume =
                resumeService.uploadResume(email, file);

        return ResponseEntity.ok(
                ResumeResponse.fromEntity(resume)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            Authentication authentication) {

        String email = authentication.getName();

        List<ResumeResponse> responses =
                resumeService.getUserResumesByEmail(email)
                        .stream()
                        .map(ResumeResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // =====================================================
    // DELETE RESUME
    // =====================================================

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long resumeId,
            Authentication authentication)
            throws IOException {

        String email = authentication.getName();

        resumeService.deleteResume(
                resumeId,
                email
        );

        return ResponseEntity.noContent().build();
    }
}