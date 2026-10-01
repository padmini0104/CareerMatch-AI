package career_match_api.controller;

import career_match_api.dto.LoginRequest;
import career_match_api.dto.LoginResponse;
import career_match_api.dto.UserResponse;
import career_match_api.entity.User;
import career_match_api.service.EmailOtpService;
import career_match_api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final EmailOtpService emailOtpService;

    public UserController(
            UserService userService,
            EmailOtpService emailOtpService) {

        this.userService = userService;
        this.emailOtpService = emailOtpService;
    }

    @PostMapping("/register")
    public UserResponse registerUser(
            @Valid @RequestBody User user) {

        User savedUser =
                userService.registerUser(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    @PostMapping("/verify-email")
    public String verifyEmail(
            @RequestParam String email,
            @RequestParam String otp) {

        emailOtpService.verifyOtp(email, otp);

        userService.verifyEmail(email);

        return "Email verified successfully";
    }

    @PostMapping("/resend-otp")
    public String resendOtp(
            @RequestParam String email) {

        emailOtpService.generateAndSendOtp(email);

        return "OTP sent successfully";
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(
            @RequestParam String email) {

        userService.sendForgotPasswordOtp(email);

        return "Password reset OTP sent successfully";
    }

    @PostMapping("/reset-password")
    public String resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {

        emailOtpService.verifyOtp(email, otp);

        userService.resetPassword(
                email,
                newPassword
        );

        return "Password reset successfully";
    }

    @PostMapping("/delete-account/send-otp")
    public String sendDeleteAccountOtp(
            @RequestParam String email) {

        userService.sendDeleteAccountOtp(email);

        return "Account deletion OTP sent successfully";
    }

    @DeleteMapping("/delete-account")
    public String deleteAccount(
            @RequestParam String email,
            @RequestParam String otp) {

        emailOtpService.verifyOtp(email, otp);

        userService.deleteAccount(email);

        return "Account deleted successfully";
    }

    @PostMapping("/login")
    public LoginResponse loginUser(
            @Valid @RequestBody LoginRequest loginRequest) {

        User user = userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        String token =
                userService.generateLoginToken(
                        user.getEmail()
                );

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                "Login successful",
                token
        );
    }
}