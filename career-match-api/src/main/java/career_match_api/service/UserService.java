package career_match_api.service;

import career_match_api.entity.User;
import career_match_api.repository.UserRepository;
import career_match_api.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailOtpService emailOtpService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailOtpService emailOtpService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailOtpService = emailOtpService;
    }

    public User registerUser(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        User savedUser = userRepository.save(user);

        emailOtpService.generateAndSendOtp(
                savedUser.getEmail()
        );

        return savedUser;
    }

    public User verifyEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setEmailVerified(true);

        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        ));

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        if (!user.isEmailVerified()) {
            throw new RuntimeException(
                    "Please verify your email before logging in"
            );
        }

        return user;
    }

    public String generateLoginToken(String email) {
        return jwtService.generateToken(email);
    }

    public void sendForgotPasswordOtp(String email) {

        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("Email not registered");
        }

        emailOtpService.generateAndSendOtp(email);
    }

    public void resetPassword(
            String email,
            String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);
    }

    public void sendDeleteAccountOtp(String email) {

        if (userRepository.findByEmail(email).isEmpty()) {
            throw new RuntimeException("User not found");
        }

        emailOtpService.generateAndSendOtp(email);
    }

    public void deleteAccount(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        userRepository.delete(user);
    }
}