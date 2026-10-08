package tests

import (
	"testing"
	"time"

	"rxguard-backend/internal/auth"
	"rxguard-backend/internal/domain"
)

func TestAuthService_PasswordHashing(t *testing.T) {
	svc := auth.NewAuthService("test-secret-key-32-characters-long", 15*time.Minute, 24*time.Hour)

	password := "SecretAnalystPass123!"
	hash, err := svc.HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if !svc.CheckPassword(password, hash) {
		t.Errorf("Password verification failed for correct password")
	}

	if svc.CheckPassword("WrongPassword123!", hash) {
		t.Errorf("Password verification succeeded for wrong password")
	}
}

func TestAuthService_JWTGenerationAndValidation(t *testing.T) {
	svc := auth.NewAuthService("test-secret-key-32-characters-long", 5*time.Minute, 24*time.Hour)

	user := &domain.User{
		ID:       "USR-TEST-01",
		Username: "analyst.test",
		Role:     domain.RoleAnalyst,
	}

	tokenStr, expSec, err := svc.GenerateAccessToken(user)
	if err != nil {
		t.Fatalf("Failed to generate access token: %v", err)
	}

	if tokenStr == "" || expSec <= 0 {
		t.Errorf("Invalid token output: token=%s, exp=%d", tokenStr, expSec)
	}

	claims, err := svc.ValidateAccessToken(tokenStr)
	if err != nil {
		t.Fatalf("Failed to validate access token: %v", err)
	}

	if claims.UserID != user.ID || claims.Username != user.Username || claims.Role != user.Role {
		t.Errorf("Claims mismatch: got %+v, want %+v", claims, user)
	}
}

func TestAuthService_InvalidToken(t *testing.T) {
	svc := auth.NewAuthService("test-secret-key-32-characters-long", 5*time.Minute, 24*time.Hour)

	_, err := svc.ValidateAccessToken("invalid.malformed.token")
	if err == nil {
		t.Errorf("Expected error for malformed token, got nil")
	}

	// Token signed with different secret
	otherSvc := auth.NewAuthService("other-different-secret-key-32-char", 5*time.Minute, 24*time.Hour)
	tokenStr, _, _ := otherSvc.GenerateAccessToken(&domain.User{ID: "U1", Username: "u", Role: domain.RoleAdmin})

	_, err = svc.ValidateAccessToken(tokenStr)
	if err == nil {
		t.Errorf("Expected signature verification error, got nil")
	}
}

func TestAuthService_RefreshToken(t *testing.T) {
	svc := auth.NewAuthService("test-secret-key-32-characters-long", 5*time.Minute, 24*time.Hour)

	raw, hash, exp, err := svc.GenerateRefreshToken()
	if err != nil {
		t.Fatalf("Failed to generate refresh token: %v", err)
	}

	if len(raw) != 64 || len(hash) != 64 {
		t.Errorf("Expected 64-char hex strings, got raw=%d hash=%d", len(raw), len(hash))
	}

	if time.Until(exp) <= 0 {
		t.Errorf("ExpiresAt should be in the future")
	}

	if svc.HashRefreshToken(raw) != hash {
		t.Errorf("HashRefreshToken mismatch with generated hash")
	}
}
