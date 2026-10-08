package domain

import (
	"time"
)

// User and Auth models
type UserRole string

const (
	RoleAdmin   UserRole = "ADMIN"
	RoleAnalyst UserRole = "ANALYST"
	RoleAuditor UserRole = "AUDITOR"
)

type UserStatus string

const (
	UserStatusActive   UserStatus = "ACTIVE"
	UserStatusDisabled UserStatus = "DISABLED"
)

type User struct {
	ID               string     `json:"id"`
	Username         string     `json:"username"`
	PasswordHash     string     `json:"-"`
	Name             string     `json:"name"`
	Role             UserRole   `json:"role"`
	Status           UserStatus `json:"status"`
	FailedLoginCount int        `json:"failed_login_count"`
	LastLoginAt      *time.Time `json:"last_login_at,omitempty"`
	AccessCount      int        `json:"access_count"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type RefreshToken struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	TokenHash string    `json:"token_hash"`
	ExpiresAt time.Time `json:"expires_at"`
	Revoked   bool      `json:"revoked"`
	CreatedAt time.Time `json:"created_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	User         User   `json:"user"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Healthcare Intelligence Models
type RiskLevel string

const (
	RiskLevelLow        RiskLevel = "RENDAH"
	RiskLevelMedium     RiskLevel = "SEDANG"
	RiskLevelSuspicious RiskLevel = "MENCURIGAKAN"
	RiskLevelHigh       RiskLevel = "TINGGI"
	RiskLevelCritical   RiskLevel = "KRITIS"
)

type AlertSeverity string

const (
	SeverityCritical AlertSeverity = "CRITICAL"
	SeverityHigh     AlertSeverity = "HIGH"
	SeverityMedium   AlertSeverity = "MEDIUM"
	SeverityLow      AlertSeverity = "LOW"
)

type AlertStatus string

const (
	AlertStatusOpen          AlertStatus = "OPEN"
	AlertStatusUnderReview   AlertStatus = "UNDER REVIEW"
	AlertStatusEscalated     AlertStatus = "ESCALATED"
	AlertStatusFalsePositive AlertStatus = "FALSE POSITIVE"
	AlertStatusResolved      AlertStatus = "RESOLVED"
)

type Participant struct {
	ID                   string    `json:"id"`
	RiskScore            int       `json:"riskScore"`
	RiskLevel            RiskLevel `json:"riskLevel"`
	FacilitiesCount      int       `json:"facilitiesCount"`
	MedicationEvents     int       `json:"medicationEvents"`
	LastActivity         string    `json:"lastActivity"`
	Signals              []string  `json:"signals"`
	AssociatedFacilities []string  `json:"associatedFacilities"`
	AssociatedMedications []string `json:"associatedMedications"`
	Status               string    `json:"status"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type Facility struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Type             string    `json:"type"`
	Region           string    `json:"region"`
	TransactionCount int       `json:"transactionCount"`
	RiskEvents       int       `json:"riskEvents"`
	RiskScore        int       `json:"riskScore"`
	Status           string    `json:"status"`
	LastInspection   string    `json:"lastInspection"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Medication struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Category         string    `json:"category"`
	TransactionCount int       `json:"transactionCount"`
	FacilityCount    int       `json:"facilityCount"`
	RiskEvents       int       `json:"riskEvents"`
	RiskScore        int       `json:"riskScore"`
	Signals          []string  `json:"signals"`
	RefillCycleDays  int       `json:"refillCycleDays"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Prescription struct {
	ID            string    `json:"id"`
	ParticipantID string    `json:"participant_id"`
	FacilityID    string    `json:"facility_id"`
	MedicationID  string    `json:"medication_id"`
	PrescribedAt  time.Time `json:"prescribed_at"`
	Status        string    `json:"status"`
	Quantity      int       `json:"quantity"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
}

type Transaction struct {
	ID              string        `json:"id"`
	PrescriptionID  string        `json:"prescription_id,omitempty"`
	Timestamp       string        `json:"timestamp"`
	ParticipantID   string        `json:"participantId"`
	FacilityID      string        `json:"facilityId"`
	MedicationID    string        `json:"medicationId"`
	RiskSignal      string        `json:"riskSignal"`
	RiskSeverity    AlertSeverity `json:"riskSeverity"`
	Amount          int64         `json:"amount"`
	Quantity        int           `json:"quantity"`
	TransactionDate time.Time     `json:"transaction_date"`
	CreatedAt       time.Time     `json:"created_at"`
}

type RiskRule struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Weight      int       `json:"weight"`
	Status      string    `json:"status"` // ACTIVE, DISABLED
	Description string    `json:"description"`
	LastUpdated string    `json:"lastUpdated"`
	UpdatedBy   string    `json:"updatedBy"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RiskSignal struct {
	ID          string    `json:"id"`
	EntityType  string    `json:"entity_type"`
	EntityID    string    `json:"entity_id"`
	RuleCode    string    `json:"rule_code"`
	Weight      int       `json:"weight"`
	SignalType  string    `json:"signal_type"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type RiskAlert struct {
	ID              string        `json:"id"`
	InvestigationID string        `json:"investigationId,omitempty"`
	Timestamp       string        `json:"timestamp"`
	EntityID        string        `json:"entityId"`
	EntityType      string        `json:"entityType"`
	RiskType        string        `json:"riskType"`
	Severity        AlertSeverity `json:"severity"`
	RiskScore       int           `json:"riskScore"`
	Status          AlertStatus   `json:"status"`
	Summary         string        `json:"summary"`
	FacilityID      string        `json:"facilityId"`
	MedicationID    string        `json:"medicationId"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

type SignalBreakdown struct {
	Label       string `json:"label"`
	Weight      int    `json:"weight"`
	Description string `json:"description"`
}

type InvestigationTimelineItem struct {
	Date             string `json:"date"`
	Time             string `json:"time"`
	FacilityID       string `json:"facilityId"`
	FacilityName     string `json:"facilityName"`
	MedicationID     string `json:"medicationId"`
	MedicationName   string `json:"medicationName"`
	Quantity         int    `json:"quantity"`
	Flag             string `json:"flag,omitempty"`
	RiskFlagSeverity string `json:"riskFlagSeverity,omitempty"` // low, medium, high
}

type InvestigationEvidence struct {
	TransactionCount int `json:"transactionCount"`
	FacilityCount    int `json:"facilityCount"`
	MedicationCount  int `json:"medicationCount"`
	TimeframeDays    int `json:"timeframeDays"`
}

type InvestigationNote struct {
	ID        string `json:"id"`
	Author    string `json:"author"`
	Timestamp string `json:"timestamp"`
	Content   string `json:"content"`
}

type Investigation struct {
	ID                  string                    `json:"id"`
	AlertID             string                    `json:"alertId"`
	TargetParticipantID string                    `json:"targetParticipantId"`
	RiskScore           int                       `json:"riskScore"`
	RiskLevel           RiskLevel                 `json:"riskLevel"`
	Status              AlertStatus               `json:"status"`
	AssignedTo          string                    `json:"assignedTo"`
	OpenedAt            string                    `json:"openedAt"`
	Evidence            InvestigationEvidence     `json:"evidence"`
	Signals             []SignalBreakdown         `json:"signals"`
	Timeline            []InvestigationTimelineItem `json:"timeline"`
	Notes               []InvestigationNote       `json:"notes"`
	ResolutionSummary   string                    `json:"resolutionSummary,omitempty"`
	CreatedAt           time.Time                 `json:"created_at"`
	UpdatedAt           time.Time                 `json:"updated_at"`
}

type InvestigationActionRequest struct {
	Action            string `json:"action" binding:"required"` // VIEW, NOTE, UNDER_REVIEW, ESCALATE, CONFIRM_ANOMALY, FALSE_POSITIVE, RESOLVE
	Content           string `json:"content,omitempty"`
	ResolutionSummary string `json:"resolution_summary,omitempty"`
}

// Network Graph Models
type NetworkNodeData struct {
	ID        string `json:"id"`
	Label     string `json:"label"`
	Type      string `json:"type"` // participant, facility, medication, prescription, alert
	RiskScore int    `json:"riskScore"`
	Degree    int    `json:"degree"`
	Subtitle  string `json:"subtitle,omitempty"`
}

type NetworkEdgeData struct {
	ID               string  `json:"id"`
	Source           string  `json:"source"`
	Target           string  `json:"target"`
	Label            string  `json:"label,omitempty"`
	Weight           float64 `json:"weight,omitempty"`
	RelationshipType string  `json:"relationship_type,omitempty"`
}

type NetworkGraphResponse struct {
	Nodes []NetworkNodeData `json:"nodes"`
	Edges []NetworkEdgeData `json:"edges"`
}

// Audit Models
type AuditLog struct {
	ID        string    `json:"id"`
	Timestamp string    `json:"timestamp"`
	User      string    `json:"user"`
	Action    string    `json:"action"`
	Resource  string    `json:"resource"`
	Result    string    `json:"result"` // SUCCESS, DENIED, FAILED
	Details   string    `json:"details"`
	IPHash    string    `json:"ip_hash,omitempty"`
	RequestID string    `json:"request_id,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// Overview Summary
type OverviewSummary struct {
	RiskIndex          float64           `json:"riskIndex"`
	ActiveAlerts       int               `json:"activeAlerts"`
	CriticalAlerts     int               `json:"criticalAlerts"`
	HighAlerts         int               `json:"highAlerts"`
	NetworkClusters    int               `json:"networkClusters"`
	RecentAlerts       []RiskAlert       `json:"recentAlerts"`
	RecentTransactions []Transaction     `json:"recentTransactions"`
	SystemStatus       map[string]string `json:"systemStatus"`
}

// Terminal Command Parser Models
type TerminalQueryRequest struct {
	Command string `json:"command" binding:"required"`
}

type TerminalQueryResponse struct {
	Command     string      `json:"command"`
	Type        string      `json:"type"` // participant, medication, facility, alert, investigation, filter, help, system, not_found
	Title       string      `json:"title"`
	StatusText  string      `json:"statusText,omitempty"`
	RiskScore   *int        `json:"riskScore,omitempty"`
	RiskLevel   string      `json:"riskLevel,omitempty"`
	Signals     []string    `json:"signals,omitempty"`
	EntityID    string      `json:"entityId,omitempty"`
	TargetRoute string      `json:"targetRoute,omitempty"`
	RawText     string      `json:"rawText,omitempty"`
	Data        interface{} `json:"data,omitempty"`
}
