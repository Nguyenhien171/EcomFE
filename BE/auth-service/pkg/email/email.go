package email

import (
	"fmt"

	"go.uber.org/zap"
) 
type EmailService struct {
	log *zap.Logger
}

func NewEmailService(log *zap.Logger) *EmailService {
	return &EmailService{log: log}
}

func (s *EmailService) SendOTP(email, code string) error {
	// Đây là nơi bạn sẽ tích hợp với Resend hoặc dịch vụ email khác.
	// Ví dụ:
	// client := resend.NewClient("YOUR_RESEND_API_KEY")
	// _, err := client.Emails.Send(&resend.SendEmailRequest{
	// 	From:    "onboarding@resend.dev",
	// 	To:      []string{email},
	// 	Subject: "Your OTP for registration",
	// 	Html:    fmt.Sprintf("Your OTP is: <strong>%s</strong>", code),
	// })
	// if err != nil {
	// 	s.log.Error("Failed to send OTP email via Resend", zap.Error(err), zap.String("email", email))
	// 	return fmt.Errorf("failed to send OTP email: %w", err)
	// }

	s.log.Info("Simulating sending OTP email",
		zap.String("email", email),
		zap.String("otp", code),
		zap.String("message", "In a real application, this would send an email via Resend or similar service."),
	)
	fmt.Printf("--- MOCK EMAIL SENT ---\nTo: %s\nSubject: Your OTP\nBody: Your OTP is: %s\n-----------------------\n", email, code)
	return nil
} 