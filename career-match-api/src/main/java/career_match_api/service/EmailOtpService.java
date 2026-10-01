package career_match_api.service;

import career_match_api.entity.EmailOtp;
import career_match_api.repository.EmailOtpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class EmailOtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public EmailOtpService(
            EmailOtpRepository emailOtpRepository,
            EmailService emailService) {

        this.emailOtpRepository = emailOtpRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void generateAndSendOtp(String email) {

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        LocalDateTime expiresAt =
                LocalDateTime.now().plusMinutes(5);

        emailOtpRepository.deleteByEmail(email);

        EmailOtp emailOtp =
                new EmailOtp(
                        email,
                        otp,
                        expiresAt
                );

        emailOtpRepository.save(emailOtp);

        emailService.sendOtpEmail(email, otp);
    }

    @Transactional
    public boolean verifyOtp(
            String email,
            String enteredOtp) {

        EmailOtp emailOtp =
                emailOtpRepository
                        .findTopByEmailOrderByIdDesc(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "OTP not found"
                                ));

        if (LocalDateTime.now()
                .isAfter(emailOtp.getExpiresAt())) {

            emailOtpRepository.delete(emailOtp);

            throw new RuntimeException(
                    "OTP has expired"
            );
        }

        if (!emailOtp.getOtp()
                .equals(enteredOtp)) {

            throw new RuntimeException(
                    "Invalid OTP"
            );
        }

        emailOtpRepository.delete(emailOtp);

        return true;
    }
}