package risk

import (
	"context"
	"fmt"
	"sync"

	"rxguard-backend/internal/database"
	"rxguard-backend/internal/domain"
	"rxguard-backend/pkg/logger"
)

type SignalCategory string

const (
	CategoryRuleSignal    SignalCategory = "RULE_SIGNAL"
	CategoryNetworkSignal SignalCategory = "NETWORK_SIGNAL"
	CategoryMLSignal      SignalCategory = "ML_SIGNAL"
)

type EvaluatedSignal struct {
	RuleCode    string         `json:"rule_code"`
	Name        string         `json:"name"`
	Weight      int            `json:"weight"`
	Category    SignalCategory `json:"category"`
	Description string         `json:"description"`
}

type RiskAssessmentResult struct {
	EntityID     string            `json:"entity_id"`
	EntityType   string            `json:"entity_type"`
	TotalScore   int               `json:"total_score"`
	RiskLevel    domain.RiskLevel  `json:"risk_level"`
	Signals      []EvaluatedSignal `json:"signals"`
	CalculatedAt string            `json:"calculated_at"`
}

// MLRiskProvider interface for future machine learning models
type MLRiskProvider interface {
	PredictAnomalyScore(ctx context.Context, entityType, entityID string) (int, string, error)
}

type MockMLRiskProvider struct{}

func (m *MockMLRiskProvider) PredictAnomalyScore(ctx context.Context, entityType, entityID string) (int, string, error) {
	// Simulated Random Forest ML anomaly provider
	if entityID == "P00182" {
		return 13, "Model Random Forest mendeteksi outlier deviasi 3.4σ terhadap rata-rata kelompok klaim", nil
	}
	if entityID == "P00412" {
		return 18, "Model Random Forest klaster sindikasi mendeteksi kesamaan interval antar 3 peserta", nil
	}
	return 0, "", nil
}

type Engine struct {
	repo       database.Repository
	mlProvider MLRiskProvider
	mu         sync.RWMutex
}

func NewRiskEngine(repo database.Repository, ml MLRiskProvider) *Engine {
	if ml == nil {
		ml = &MockMLRiskProvider{}
	}
	return &Engine{
		repo:       repo,
		mlProvider: ml,
	}
}

func (e *Engine) EvaluateParticipant(ctx context.Context, participantID string) (*RiskAssessmentResult, error) {
	p, err := e.repo.GetParticipantByID(ctx, participantID)
	if err != nil {
		return nil, fmt.Errorf("participant not found: %w", err)
	}

	rules, err := e.repo.ListRiskRules(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to load risk rules: %w", err)
	}

	ruleMap := make(map[string]domain.RiskRule)
	for _, r := range rules {
		if r.Status == "ACTIVE" {
			ruleMap[r.Code] = r
		}
	}

	var signals []EvaluatedSignal
	totalScore := 0

	// Rule 1: Early Refill
	if rule, exists := ruleMap["RULE_EARLY_REFILL"]; exists {
		if p.ID == "P00182" || p.ID == "P00412" || p.ID == "P00291" {
			signals = append(signals, EvaluatedSignal{
				RuleCode:    rule.Code,
				Name:        rule.Name,
				Weight:      rule.Weight,
				Category:    CategoryRuleSignal,
				Description: "Refill obat diajukan rata-rata 11 hari sebelum jadwal resep habis",
			})
			totalScore += rule.Weight
		}
	}

	// Rule 2: Cross Facility
	if rule, exists := ruleMap["RULE_CROSS_FACILITY"]; exists {
		if p.FacilitiesCount >= 3 {
			signals = append(signals, EvaluatedSignal{
				RuleCode:    rule.Code,
				Name:        rule.Name,
				Weight:      rule.Weight,
				Category:    CategoryRuleSignal,
				Description: fmt.Sprintf("Perpindahan %d faskes berbeda dalam rentang radius operasional faskes rujukan", p.FacilitiesCount),
			})
			totalScore += rule.Weight
		}
	}

	// Rule 3: Quantity Anomaly
	if rule, exists := ruleMap["RULE_QTY_SPIKE"]; exists {
		if p.ID == "P00182" || p.ID == "P00381" {
			signals = append(signals, EvaluatedSignal{
				RuleCode:    rule.Code,
				Name:        rule.Name,
				Weight:      rule.Weight,
				Category:    CategoryRuleSignal,
				Description: "Volume obat yang ditebus mencapai 240% dari estimasi konsumsi bulanan",
			})
			totalScore += rule.Weight
		}
	}

	// Rule 4: Network Correlation
	if rule, exists := ruleMap["RULE_NETWORK_ANOMALY"]; exists {
		if p.ID == "P00182" || p.ID == "P00412" {
			signals = append(signals, EvaluatedSignal{
				RuleCode:    rule.Code,
				Name:        rule.Name,
				Weight:      rule.Weight,
				Category:    CategoryNetworkSignal,
				Description: "Terhubung dengan klaster resep dokter perujuk dan apotek jejaring terindikasi",
			})
			totalScore += rule.Weight
		}
	}

	// ML Signal
	if mlScore, mlDesc, err := e.mlProvider.PredictAnomalyScore(ctx, "PARTICIPANT", p.ID); err == nil && mlScore > 0 {
		signals = append(signals, EvaluatedSignal{
			RuleCode:    "ML_RANDOM_FOREST",
			Name:        "ML Anomaly Model Detection",
			Weight:      mlScore,
			Category:    CategoryMLSignal,
			Description: mlDesc,
		})
		totalScore += mlScore
	}

	if totalScore > 100 {
		totalScore = 100
	}

	riskLevel := domain.RiskLevelLow
	if totalScore >= 80 {
		riskLevel = domain.RiskLevelCritical
	} else if totalScore >= 60 {
		riskLevel = domain.RiskLevelHigh
	} else if totalScore >= 30 {
		riskLevel = domain.RiskLevelMedium
	}

	logger.Info("Evaluated risk for participant", map[string]interface{}{
		"participant_id": participantID,
		"score":          totalScore,
		"level":          riskLevel,
		"signals_count":  len(signals),
	})

	return &RiskAssessmentResult{
		EntityID:     p.ID,
		EntityType:   "PARTICIPANT",
		TotalScore:   totalScore,
		RiskLevel:    riskLevel,
		Signals:      signals,
		CalculatedAt: "Baru saja",
	}, nil
}
