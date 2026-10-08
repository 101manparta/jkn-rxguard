package tests

import (
	"context"
	"testing"

	"rxguard-backend/internal/database"
	"rxguard-backend/internal/domain"
	"rxguard-backend/internal/risk"
	"rxguard-backend/internal/terminal"
)

func TestRiskEngine_Evaluation(t *testing.T) {
	repo := database.NewMemoryRepository()
	engine := risk.NewRiskEngine(repo, nil)

	ctx := context.Background()

	// Evaluate high-risk participant P00182
	assessment, err := engine.EvaluateParticipant(ctx, "P00182")
	if err != nil {
		t.Fatalf("Failed to evaluate participant P00182: %v", err)
	}

	if assessment.TotalScore < 60 {
		t.Errorf("Expected high risk score for P00182, got %d", assessment.TotalScore)
	}

	if assessment.RiskLevel != domain.RiskLevelHigh && assessment.RiskLevel != domain.RiskLevelCritical {
		t.Errorf("Expected TINGGI or KRITIS risk level, got %s", assessment.RiskLevel)
	}

	if len(assessment.Signals) == 0 {
		t.Errorf("Expected risk signals to be produced, got 0")
	}

	// Verify categories are populated
	hasRuleSignal := false
	for _, sig := range assessment.Signals {
		if sig.Category == risk.CategoryRuleSignal {
			hasRuleSignal = true
		}
	}
	if !hasRuleSignal {
		t.Errorf("Expected at least one RULE_SIGNAL")
	}
}

func TestTerminalParser_Commands(t *testing.T) {
	repo := database.NewMemoryRepository()
	parser := terminal.NewParser(repo)

	ctx := context.Background()

	testCases := []struct {
		cmd          string
		expectedType string
		mustContain  string
	}{
		{"help", "help", "PANDUAN PERINTAH"},
		{"clear", "system", "dibersihkan"},
		{"alerts", "filter", "DAFTAR NOTIFIKASI"},
		{"search peserta P00182", "participant", "P00182"},
		{"search obat MEDX", "medication", "MEDX"},
		{"search fasilitas FKTP0182", "facility", "FKTP0182"},
		{"risk critical", "filter", "CRITICAL"},
		{"network P00182", "participant", "P00182"},
		{"investigate INV0281", "investigation", "INV0281"},
	}

	for _, tc := range testCases {
		res, err := parser.ParseAndExecute(ctx, tc.cmd)
		if err != nil {
			t.Fatalf("Error parsing command %q: %v", tc.cmd, err)
		}
		if res.Type != tc.expectedType {
			t.Errorf("Command %q: expected type %s, got %s", tc.cmd, tc.expectedType, res.Type)
		}
	}
}
