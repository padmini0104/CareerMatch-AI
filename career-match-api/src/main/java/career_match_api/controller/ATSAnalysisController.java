package career_match_api.controller;

import career_match_api.entity.Resume;
import career_match_api.entity.User;
import career_match_api.repository.ResumeRepository;
import career_match_api.repository.UserRepository;
import career_match_api.service.ATSAnalysisService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats")
public class ATSAnalysisController {

    private final ATSAnalysisService atsAnalysisService;

    private final ResumeRepository resumeRepository;

    private final UserRepository userRepository;


    public ATSAnalysisController(
            ATSAnalysisService atsAnalysisService,
            ResumeRepository resumeRepository,
            UserRepository userRepository) {

        this.atsAnalysisService =
                atsAnalysisService;

        this.resumeRepository =
                resumeRepository;

        this.userRepository =
                userRepository;
    }


    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<ATSAnalysisService.ATSResult>
            analyzeResume(
                    @PathVariable Long resumeId,
                    Authentication authentication) {


        // =====================================================
        // GET LOGGED-IN USER
        // =====================================================

        String email =
                authentication.getName();


        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


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
        // CHECK RESUME OWNERSHIP
        // =====================================================

        if (!resume.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to analyze this resume"
            );
        }


        // =====================================================
        // ANALYZE RESUME
        // =====================================================

        ATSAnalysisService.ATSResult result =
                atsAnalysisService.analyzeResume(
                        resumeId
                );


        return ResponseEntity.ok(result);
    }
}