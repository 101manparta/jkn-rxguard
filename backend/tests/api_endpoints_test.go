package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"rxguard-backend/internal/api"
	"rxguard-backend/internal/auth"
	"rxguard-backend/internal/cache"
	"rxguard-backend/internal/config"
	"rxguard-backend/internal/database"
	"rxguard-backend/internal/domain"
	"rxguard-backend/internal/risk"
	"rxguard-backend/internal/terminal"
)

func setupTestRouter() (*gin.Engine, *auth.AuthService, database.Repository) {
	gin.SetMode(gin.TestMode)
	cfg := &config.Config{
		Port:             "8080",
		Env:              "test",
		AllowedOrigins:   []string{"*"},
		RateLimitEnabled: false,
	}

	repo := database.NewMemoryRepository()
	c := cache.NewCache("", "", "", 0, false)
	authSvc := auth.NewAuthService("test-secret-key-32-characters-long", 15*time.Minute, 24*time.Hour)
	riskEng := risk.NewRiskEngine(repo, nil)
	parser := terminal.NewParser(repo)

	handlers := api.NewHandlers(repo, c, authSvc, riskEng, parser)
	router := api.SetupRouter(cfg, handlers, authSvc)

	return router, authSvc, repo
}

func TestAPI_HealthEndpoints(t *testing.T) {
	router, _, _ := setupTestRouter()

	endpoints := []string{"/health", "/ready", "/live"}
	for _, ep := range endpoints {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", ep, nil)
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Endpoint %s returned status %d, want %d", ep, w.Code, http.StatusOK)
		}
	}
}

func TestAPI_AuthenticationFlow(t *testing.T) {
	router, _, _ := setupTestRouter()

	// 1. Successful Login as Analyst
	body, _ := json.Marshal(map[string]string{
		"username": "analyst.demo",
		"password": "password",
	})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Login returned status %d, body: %s", w.Code, w.Body.String())
	}

	var res struct {
		Success bool                `json:"success"`
		Data    domain.AuthResponse `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil || !res.Success {
		t.Fatalf("Failed to parse login response: %v", err)
	}

	if res.Data.AccessToken == "" || res.Data.RefreshToken == "" {
		t.Errorf("Tokens missing from login response")
	}

	analystToken := res.Data.AccessToken

	// 2. Call /api/v1/auth/me with Bearer token
	wMe := httptest.NewRecorder()
	reqMe, _ := http.NewRequest("GET", "/api/v1/auth/me", nil)
	reqMe.Header.Set("Authorization", "Bearer "+analystToken)
	router.ServeHTTP(wMe, reqMe)

	if wMe.Code != http.StatusOK {
		t.Errorf("/api/v1/auth/me returned status %d", wMe.Code)
	}
}

func TestAPI_RBAC_Enforcement(t *testing.T) {
	router, authSvc, repo := setupTestRouter()

	// Generate analyst token
	analystUser, _ := repo.GetUserByUsername(nil, "analyst.demo")
	analystToken, _, _ := authSvc.GenerateAccessToken(analystUser)

	// Generate admin token
	adminUser, _ := repo.GetUserByUsername(nil, "admin.demo")
	adminToken, _, _ := authSvc.GenerateAccessToken(adminUser)

	// Analyst attempting to access /api/v1/admin/users MUST be forbidden (403)
	wAnalyst := httptest.NewRecorder()
	reqAnalyst, _ := http.NewRequest("GET", "/api/v1/admin/users", nil)
	reqAnalyst.Header.Set("Authorization", "Bearer "+analystToken)
	router.ServeHTTP(wAnalyst, reqAnalyst)

	if wAnalyst.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for analyst accessing admin endpoint, got %d", wAnalyst.Code)
	}

	// Admin accessing /api/v1/admin/users MUST succeed (200)
	wAdmin := httptest.NewRecorder()
	reqAdmin, _ := http.NewRequest("GET", "/api/v1/admin/users", nil)
	reqAdmin.Header.Set("Authorization", "Bearer "+adminToken)
	router.ServeHTTP(wAdmin, reqAdmin)

	if wAdmin.Code != http.StatusOK {
		t.Errorf("Expected 200 OK for admin accessing admin endpoint, got %d", wAdmin.Code)
	}
}

func TestAPI_IntelligenceEndpoints(t *testing.T) {
	router, authSvc, repo := setupTestRouter()

	analystUser, _ := repo.GetUserByUsername(nil, "analyst.demo")
	token, _, _ := authSvc.GenerateAccessToken(analystUser)
	bearer := "Bearer " + token

	// 1. Overview
	wOverview := httptest.NewRecorder()
	reqOverview, _ := http.NewRequest("GET", "/api/v1/overview", nil)
	reqOverview.Header.Set("Authorization", bearer)
	router.ServeHTTP(wOverview, reqOverview)
	if wOverview.Code != http.StatusOK {
		t.Errorf("/api/v1/overview failed with status %d", wOverview.Code)
	}

	// 2. Participant P00182
	wPart := httptest.NewRecorder()
	reqPart, _ := http.NewRequest("GET", "/api/v1/participants/P00182", nil)
	reqPart.Header.Set("Authorization", bearer)
	router.ServeHTTP(wPart, reqPart)
	if wPart.Code != http.StatusOK {
		t.Errorf("/api/v1/participants/P00182 failed with status %d", wPart.Code)
	}

	// 3. Network graph
	wNet := httptest.NewRecorder()
	reqNet, _ := http.NewRequest("GET", "/api/v1/network", nil)
	reqNet.Header.Set("Authorization", bearer)
	router.ServeHTTP(wNet, reqNet)
	if wNet.Code != http.StatusOK {
		t.Errorf("/api/v1/network failed with status %d", wNet.Code)
	}

	// 4. Terminal query
	cmdBody, _ := json.Marshal(map[string]string{"command": "search peserta P00182"})
	wTerm := httptest.NewRecorder()
	reqTerm, _ := http.NewRequest("POST", "/api/v1/terminal/query", bytes.NewBuffer(cmdBody))
	reqTerm.Header.Set("Authorization", bearer)
	reqTerm.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(wTerm, reqTerm)
	if wTerm.Code != http.StatusOK {
		t.Errorf("/api/v1/terminal/query failed with status %d", wTerm.Code)
	}
}
