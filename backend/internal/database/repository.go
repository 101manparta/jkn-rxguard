package database

import (
	"context"
	"fmt"
	"sync"
	"time"

	"rxguard-backend/internal/domain"
	"rxguard-backend/pkg/logger"
)

type Repository interface {
	// Users & Auth
	GetUserByUsername(ctx context.Context, username string) (*domain.User, error)
	GetUserByID(ctx context.Context, id string) (*domain.User, error)
	ListUsers(ctx context.Context) ([]domain.User, error)
	CreateUser(ctx context.Context, user *domain.User) error
	UpdateUserStatus(ctx context.Context, id string, status domain.UserStatus) error
	UpdateUserLoginSuccess(ctx context.Context, id string) error
	RecordFailedLogin(ctx context.Context, username string) error

	// Refresh Tokens
	SaveRefreshToken(ctx context.Context, token *domain.RefreshToken) error
	GetRefreshToken(ctx context.Context, hash string) (*domain.RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, hash string) error

	// Participants
	ListParticipants(ctx context.Context, query string, riskLevel string) ([]domain.Participant, error)
	GetParticipantByID(ctx context.Context, id string) (*domain.Participant, error)
	GetParticipantTimeline(ctx context.Context, id string) ([]domain.InvestigationTimelineItem, error)

	// Facilities
	ListFacilities(ctx context.Context, query string) ([]domain.Facility, error)
	GetFacilityByID(ctx context.Context, id string) (*domain.Facility, error)

	// Medications
	ListMedications(ctx context.Context, query string) ([]domain.Medication, error)
	GetMedicationByID(ctx context.Context, id string) (*domain.Medication, error)

	// Transactions
	ListTransactions(ctx context.Context, limit int) ([]domain.Transaction, error)
	CreateTransaction(ctx context.Context, tx *domain.Transaction) error

	// Alerts
	ListAlerts(ctx context.Context, severity, status, facilityID, medicationID string) ([]domain.RiskAlert, error)
	GetAlertByID(ctx context.Context, id string) (*domain.RiskAlert, error)
	UpdateAlertStatus(ctx context.Context, id string, status domain.AlertStatus) error

	// Risk Rules
	ListRiskRules(ctx context.Context) ([]domain.RiskRule, error)
	GetRiskRuleByCode(ctx context.Context, code string) (*domain.RiskRule, error)
	UpdateRiskRule(ctx context.Context, id string, weight *int, status *string, updatedBy string) (*domain.RiskRule, error)

	// Network
	GetNetworkGraph(ctx context.Context, entityType, entityID string, depth int, cluster string) (*domain.NetworkGraphResponse, error)

	// Investigations
	ListInvestigations(ctx context.Context) ([]domain.Investigation, error)
	GetInvestigationByID(ctx context.Context, id string) (*domain.Investigation, error)
	CreateInvestigation(ctx context.Context, inv *domain.Investigation) error
	UpdateInvestigationStatus(ctx context.Context, id string, status domain.AlertStatus, resolution string) error
	AddInvestigationNote(ctx context.Context, id, author, content string) error

	// Audit Logs
	ListAuditLogs(ctx context.Context, user, action, query string, limit int) ([]domain.AuditLog, error)
	AppendAuditLog(ctx context.Context, log *domain.AuditLog) error

	// Overview Summary
	GetOverviewSummary(ctx context.Context) (*domain.OverviewSummary, error)
}

type MemoryRepository struct {
	mu             sync.RWMutex
	users          map[string]*domain.User
	tokens         map[string]*domain.RefreshToken
	participants   map[string]*domain.Participant
	facilities     map[string]*domain.Facility
	medications    map[string]*domain.Medication
	transactions   []domain.Transaction
	alerts         map[string]*domain.RiskAlert
	riskRules      map[string]*domain.RiskRule
	investigations map[string]*domain.Investigation
	auditLogs      []domain.AuditLog
	networkNodes   []domain.NetworkNodeData
	networkEdges   []domain.NetworkEdgeData
}

func NewMemoryRepository() *MemoryRepository {
	repo := &MemoryRepository{
		users:          make(map[string]*domain.User),
		tokens:         make(map[string]*domain.RefreshToken),
		participants:   make(map[string]*domain.Participant),
		facilities:     make(map[string]*domain.Facility),
		medications:    make(map[string]*domain.Medication),
		transactions:   make([]domain.Transaction, 0),
		alerts:         make(map[string]*domain.RiskAlert),
		riskRules:      make(map[string]*domain.RiskRule),
		investigations: make(map[string]*domain.Investigation),
		auditLogs:      make([]domain.AuditLog, 0),
	}
	repo.seedInitialData()
	return repo
}

func (r *MemoryRepository) seedInitialData() {
	// Standard bcrypt password for demo: "$2a$10$3m6Isq8cKjQZfD7F3U.s1uL5f4H3R1rBq2X7N8M9K0P1L2V3B4N5M" or any
	now := time.Now()

	// Users
	r.users["analyst.demo"] = &domain.User{
		ID:           "USR-001",
		Username:     "analyst.demo",
		PasswordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password" or demo
		Name:         "Analis Investigasi Utama 001",
		Role:         domain.RoleAnalyst,
		Status:       domain.UserStatusActive,
		AccessCount:  148,
		CreatedAt:    now.Add(-30 * 24 * time.Hour),
		UpdatedAt:    now,
	}

	r.users["admin.demo"] = &domain.User{
		ID:           "USR-002",
		Username:     "admin.demo",
		PasswordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
		Name:         "Administrator Kontrol Sistem 001",
		Role:         domain.RoleAdmin,
		Status:       domain.UserStatusActive,
		AccessCount:  312,
		CreatedAt:    now.Add(-60 * 24 * time.Hour),
		UpdatedAt:    now,
	}

	r.users["analyst02"] = &domain.User{
		ID:           "USR-003",
		Username:     "analyst02",
		PasswordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
		Name:         "Analis Investigasi Lapangan 002",
		Role:         domain.RoleAnalyst,
		Status:       domain.UserStatusActive,
		AccessCount:  94,
		CreatedAt:    now.Add(-20 * 24 * time.Hour),
		UpdatedAt:    now,
	}

	// Participants
	pList := []domain.Participant{
		{
			ID:                   "P00182",
			RiskScore:            87,
			RiskLevel:            domain.RiskLevelHigh,
			FacilitiesCount:      4,
			MedicationEvents:     17,
			LastActivity:         "10 Mnt lalu",
			Signals:              []string{"Early refill", "Cross facility", "Quantity anomaly", "Network correlation", "ML anomaly"},
			AssociatedFacilities: []string{"FKTP0182", "FKTP0291", "FKTP0301", "FKRTL0045"},
			AssociatedMedications: []string{"MEDX", "MEDY"},
			Status:               "Perlu Ditinjau",
		},
		{
			ID:                   "P00291",
			RiskScore:            78,
			RiskLevel:            domain.RiskLevelHigh,
			FacilitiesCount:      3,
			MedicationEvents:     14,
			LastActivity:         "32 Mnt lalu",
			Signals:              []string{"Early refill", "Cross facility", "Refill pattern"},
			AssociatedFacilities: []string{"FKTP0182", "FKTP0512"},
			AssociatedMedications: []string{"MEDX", "MED-INS01"},
			Status:               "Dalam Investigasi",
		},
		{
			ID:                   "P00381",
			RiskScore:            64,
			RiskLevel:            domain.RiskLevelSuspicious,
			FacilitiesCount:      3,
			MedicationEvents:     11,
			LastActivity:         "1 Jam lalu",
			Signals:              []string{"Quantity anomaly", "Frequency cluster"},
			AssociatedFacilities: []string{"FKTP0291", "FKRTL0045"},
			AssociatedMedications: []string{"MED-NEURO05", "MEDY"},
			Status:               "Perlu Ditinjau",
		},
		{
			ID:                   "P00412",
			RiskScore:            92,
			RiskLevel:            domain.RiskLevelCritical,
			FacilitiesCount:      5,
			MedicationEvents:     26,
			LastActivity:         "5 Mnt lalu",
			Signals:              []string{"Syndicate cluster", "Rapid cycling", "Early refill", "High value prescription"},
			AssociatedFacilities: []string{"FKTP0182", "FKTP0291", "FKTP0301", "FKTP0512", "FKRTL0045"},
			AssociatedMedications: []string{"MEDY", "MED-CARD02"},
			Status:               "Perlu Ditinjau",
		},
		{
			ID:                   "P00554",
			RiskScore:            45,
			RiskLevel:            domain.RiskLevelMedium,
			FacilitiesCount:      2,
			MedicationEvents:     8,
			LastActivity:         "3 Jam lalu",
			Signals:              []string{"Single repeat refill"},
			AssociatedFacilities: []string{"FKTP0512"},
			AssociatedMedications: []string{"MED-CARD02"},
			Status:               "Aktif",
		},
		{
			ID:                   "P00620",
			RiskScore:            24,
			RiskLevel:            domain.RiskLevelLow,
			FacilitiesCount:      1,
			MedicationEvents:     5,
			LastActivity:         "6 Jam lalu",
			Signals:              []string{"Baseline conformant"},
			AssociatedFacilities: []string{"FKTP0182"},
			AssociatedMedications: []string{"MED-INS01"},
			Status:               "Aktif",
		},
		{
			ID:                   "P00711",
			RiskScore:            59,
			RiskLevel:            domain.RiskLevelMedium,
			FacilitiesCount:      2,
			MedicationEvents:     9,
			LastActivity:         "4 Jam lalu",
			Signals:              []string{"Dosage borderline", "Cross facility minor"},
			AssociatedFacilities: []string{"FKTP0291", "FKTP0512"},
			AssociatedMedications: []string{"MEDX"},
			Status:               "Aktif",
		},
	}
	for i := range pList {
		r.participants[pList[i].ID] = &pList[i]
	}

	// Facilities
	fList := []domain.Facility{
		{
			ID:               "FKTP0182",
			Name:             "Klinik Pratama Sehat Mandiri",
			Type:             "FKTP Klinik Pratama",
			Region:           "Rayon Metro Barat",
			TransactionCount: 3840,
			RiskEvents:       64,
			RiskScore:        84,
			Status:           "Audit Khusus",
			LastInspection:   "2026-09-28",
		},
		{
			ID:               "FKTP0291",
			Name:             "Klinik Rawat Medika Utama",
			Type:             "FKTP Klinik Pratama",
			Region:           "Rayon Metro Barat",
			TransactionCount: 4120,
			RiskEvents:       49,
			RiskScore:        79,
			Status:           "Pengawasan",
			LastInspection:   "2026-09-15",
		},
		{
			ID:               "FKTP0301",
			Name:             "Puskesmas Harapan Bangsa",
			Type:             "FKTP Puskesmas",
			Region:           "Rayon Satelit Utara",
			TransactionCount: 7620,
			RiskEvents:       38,
			RiskScore:        62,
			Status:           "Normal",
			LastInspection:   "2026-10-01",
		},
		{
			ID:               "FKRTL0045",
			Name:             "RS Tipe C Graha Medika Sentra",
			Type:             "FKRTL RS Tipe C",
			Region:           "Rayon Metro Pusat",
			TransactionCount: 14210,
			RiskEvents:       82,
			RiskScore:        71,
			Status:           "Pengawasan",
			LastInspection:   "2026-09-11",
		},
		{
			ID:               "FKTP0512",
			Name:             "Puskesmas Delta Sentosa",
			Type:             "FKTP Puskesmas",
			Region:           "Rayon Satelit Selatan",
			TransactionCount: 5890,
			RiskEvents:       22,
			RiskScore:        38,
			Status:           "Normal",
			LastInspection:   "2026-10-04",
		},
	}
	for i := range fList {
		r.facilities[fList[i].ID] = &fList[i]
	}

	// Medications
	mList := []domain.Medication{
		{
			ID:               "MEDX",
			Name:             "Metformin-Glibenclav 500/5mg (Simulasi)",
			Category:         "Endokrin & Diabetes Kronis",
			TransactionCount: 12821,
			FacilityCount:    382,
			RiskEvents:       83,
			RiskScore:        82,
			Signals:          []string{"Quantity anomaly", "Refill pattern", "Facility concentration", "Network correlation"},
			RefillCycleDays:  30,
		},
		{
			ID:               "MEDY",
			Name:             "Analgesik Opioid-Sintetik 50mg (Simulasi)",
			Category:         "Analgesik Terkontrol",
			TransactionCount: 4210,
			FacilityCount:    94,
			RiskEvents:       67,
			RiskScore:        91,
			Signals:          []string{"Rapid refill cycle", "Doctor shopping pattern", "Quantity excess threshold"},
			RefillCycleDays:  14,
		},
		{
			ID:               "MED-INS01",
			Name:             "Insulin Glargine 100 IU/mL Pen (Simulasi)",
			Category:         "Anti-Diabetik Parenteral",
			TransactionCount: 8940,
			FacilityCount:    215,
			RiskEvents:       41,
			RiskScore:        68,
			Signals:          []string{"Cross facility dispensation", "Cold chain claim anomaly"},
			RefillCycleDays:  28,
		},
		{
			ID:               "MED-CARD02",
			Name:             "Atorvastatin Kalium 40mg (Simulasi)",
			Category:         "Kardiovaskular & Lipid",
			TransactionCount: 18450,
			FacilityCount:    460,
			RiskEvents:       34,
			RiskScore:        49,
			Signals:          []string{"Intermittent early refill"},
			RefillCycleDays:  30,
		},
		{
			ID:               "MED-NEURO05",
			Name:             "Pregabalin Forte 150mg (Simulasi)",
			Category:         "Neurologi & Psikiatri",
			TransactionCount: 6120,
			FacilityCount:    112,
			RiskEvents:       52,
			RiskScore:        76,
			Signals:          []string{"Quantity surge", "Prescription duplication cluster"},
			RefillCycleDays:  21,
		},
	}
	for i := range mList {
		r.medications[mList[i].ID] = &mList[i]
	}

	// Transactions
	r.transactions = []domain.Transaction{
		{
			ID:           "TX-9841",
			Timestamp:    "11:42:18 WITA",
			ParticipantID: "P00182",
			FacilityID:   "FKTP0182",
			MedicationID: "MEDX",
			RiskSignal:   "EARLY REFILL",
			RiskSeverity: domain.SeverityHigh,
			Amount:       184000,
			Quantity:     60,
		},
		{
			ID:           "TX-9840",
			Timestamp:    "11:41:51 WITA",
			ParticipantID: "P00182",
			FacilityID:   "FKTP0291",
			MedicationID: "MEDY",
			RiskSignal:   "NETWORK PATTERN",
			RiskSeverity: domain.SeverityMedium,
			Amount:       320000,
			Quantity:     30,
		},
		{
			ID:           "TX-9839",
			Timestamp:    "11:40:02 WITA",
			ParticipantID: "P00412",
			FacilityID:   "FKTP0301",
			MedicationID: "MEDY",
			RiskSignal:   "QUANTITY ANOMALY",
			RiskSeverity: domain.SeverityCritical,
			Amount:       450000,
			Quantity:     50,
		},
		{
			ID:           "TX-9838",
			Timestamp:    "11:38:44 WITA",
			ParticipantID: "P00291",
			FacilityID:   "FKTP0182",
			MedicationID: "MEDX",
			RiskSignal:   "REFILL WINDOW COMPRESSION",
			RiskSeverity: domain.SeverityHigh,
			Amount:       195000,
			Quantity:     90,
		},
		{
			ID:           "TX-9837",
			Timestamp:    "11:37:12 WITA",
			ParticipantID: "P00554",
			FacilityID:   "FKTP0512",
			MedicationID: "MED-CARD02",
			RiskSignal:   "BASELINE CONFORMANT",
			RiskSeverity: domain.SeverityLow,
			Amount:       88000,
			Quantity:     30,
		},
		{
			ID:           "TX-9836",
			Timestamp:    "11:35:29 WITA",
			ParticipantID: "P00381",
			FacilityID:   "FKRTL0045",
			MedicationID: "MED-NEURO05",
			RiskSignal:   "CROSS FACILITY OVERLAP",
			RiskSeverity: domain.SeverityMedium,
			Amount:       280000,
			Quantity:     30,
		},
		{
			ID:           "TX-9835",
			Timestamp:    "11:33:05 WITA",
			ParticipantID: "P00620",
			FacilityID:   "FKTP0182",
			MedicationID: "MED-INS01",
			RiskSignal:   "CYCLE NORMAL",
			RiskSeverity: domain.SeverityLow,
			Amount:       210000,
			Quantity:     5,
		},
	}

	// Risk Rules
	rules := []domain.RiskRule{
		{
			ID:          "RULE_001",
			Code:        "RULE_EARLY_REFILL",
			Name:        "Early Refill Window Compression",
			Weight:      25,
			Status:      "ACTIVE",
			Description: "Penebusan resep obat kronis sebelum sisa hari terapi mencapai < 20% siklus standar.",
			LastUpdated: "2026-10-01 09:00 WITA",
			UpdatedBy:   "ADMIN001",
		},
		{
			ID:          "RULE_002",
			Code:        "RULE_CROSS_FACILITY",
			Name:        "Cross-Facility Multi-Visit Anomaly",
			Weight:      20,
			Status:      "ACTIVE",
			Description: "Kunjungan ke >= 3 faskes berbeda dalam rentang < 14 hari dengan kelas terapi obat sama.",
			LastUpdated: "2026-10-02 14:15 WITA",
			UpdatedBy:   "ADMIN001",
		},
		{
			ID:          "RULE_003",
			Code:        "RULE_QTY_SPIKE",
			Name:        "Prescription Quantity Spike",
			Weight:      20,
			Status:      "ACTIVE",
			Description: "Jumlah kuota obat melampaui > 200% dosis maksimal harian formularium nasional.",
			LastUpdated: "2026-09-25 11:30 WITA",
			UpdatedBy:   "ADMIN001",
		},
		{
			ID:          "RULE_004",
			Code:        "RULE_NETWORK_ANOMALY",
			Name:        "Syndicate Network Correlation",
			Weight:      21,
			Status:      "ACTIVE",
			Description: "Korelasi graf menghubungkan cluster faskes, dokter, apotek, dan kelompok peserta terindikasi.",
			LastUpdated: "2026-10-06 11:39 WITA",
			UpdatedBy:   "ADMIN001",
		},
		{
			ID:          "RULE_005",
			Code:        "RULE_DUP_TX",
			Name:        "Duplicate Transaction Window",
			Weight:      14,
			Status:      "ACTIVE",
			Description: "Klaim zat aktif identik pada hari kalender yang sama di dua entitas fasilitas independen.",
			LastUpdated: "2026-09-18 16:45 WITA",
			UpdatedBy:   "ADMIN001",
		},
	}
	for i := range rules {
		r.riskRules[rules[i].ID] = &rules[i]
	}

	// Alerts
	aList := []domain.RiskAlert{
		{
			ID:              "ALERT0281",
			InvestigationID: "INV0281",
			Timestamp:       "11:42:18 WITA",
			EntityID:        "P00182",
			EntityType:      "PARTICIPANT",
			RiskType:        "Network anomaly & Cross-facility surge",
			Severity:        domain.SeverityCritical,
			RiskScore:       87,
			Status:          domain.AlertStatusUnderReview,
			Summary:         "Pola klaim berulang antar 4 fasilitas dalam rentang 21 hari dengan duplikasi zat aktif MEDX & MEDY",
			FacilityID:      "FKTP0182",
			MedicationID:    "MEDX",
		},
		{
			ID:              "ALERT0279",
			InvestigationID: "INV0279",
			Timestamp:       "11:36:04 WITA",
			EntityID:        "P00412",
			EntityType:      "PARTICIPANT",
			RiskType:        "Early refill window compression",
			Severity:        domain.SeverityCritical,
			RiskScore:       92,
			Status:          domain.AlertStatusOpen,
			Summary:         "Pengambilan resep obat analgesik 7 hari sebelum siklus standar berakhir di 3 fasilitas berbeda",
			FacilityID:      "FKTP0291",
			MedicationID:    "MEDY",
		},
		{
			ID:              "ALERT0277",
			InvestigationID: "INV0277",
			Timestamp:       "11:15:22 WITA",
			EntityID:        "MEDX",
			EntityType:      "MEDICATION",
			RiskType:        "Quantity anomaly cluster",
			Severity:        domain.SeverityHigh,
			RiskScore:       82,
			Status:          domain.AlertStatusUnderReview,
			Summary:         "Lonjakan kuota klaim 320% di atas moving average 60 hari pada klaster FKTP0182 & FKTP0291",
			FacilityID:      "FKTP0182",
			MedicationID:    "MEDX",
		},
		{
			ID:           "ALERT0272",
			Timestamp:    "10:58:49 WITA",
			EntityID:     "FKTP0182",
			EntityType:   "FACILITY",
			RiskType:     "Cross facility repeat dispensation",
			Severity:     domain.SeverityHigh,
			RiskScore:    78,
			Status:       domain.AlertStatusOpen,
			Summary:      "Tingkat kesamaan peserta 68% dengan FKTP0291 untuk klaim obat khusus dalam jendela 48 jam",
			FacilityID:   "FKTP0182",
			MedicationID: "MED-INS01",
		},
		{
			ID:              "ALERT0265",
			InvestigationID: "INV0265",
			Timestamp:       "10:41:12 WITA",
			EntityID:        "P00381",
			EntityType:      "PARTICIPANT",
			RiskType:        "Multi-doctor prescription overlap",
			Severity:        domain.SeverityMedium,
			RiskScore:       64,
			Status:          domain.AlertStatusOpen,
			Summary:         "Duplikasi resep neurologi aktif dari 2 dokter perujuk tanpa catatan rujukan balik valid",
			FacilityID:      "FKRTL0045",
			MedicationID:    "MED-NEURO05",
		},
		{
			ID:           "ALERT0258",
			Timestamp:    "09:22:30 WITA",
			EntityID:     "P00711",
			EntityType:   "PARTICIPANT",
			RiskType:     "Dosage borderline pattern",
			Severity:     domain.SeverityMedium,
			RiskScore:    59,
			Status:       domain.AlertStatusResolved,
			Summary:      "Ambang batas dosis harian maksimal terlampaui 12% pada klaim obat anti-hiperglikemik",
			FacilityID:   "FKTP0301",
			MedicationID: "MEDX",
		},
		{
			ID:           "ALERT0249",
			Timestamp:    "08:50:11 WITA",
			EntityID:     "P00554",
			EntityType:   "PARTICIPANT",
			RiskType:     "Intermittent early refill",
			Severity:     domain.SeverityLow,
			RiskScore:    45,
			Status:       domain.AlertStatusFalsePositive,
			Summary:      "Refill 2 hari lebih awal dilaporkan akibat perjalanan dinas terverifikasi",
			FacilityID:   "FKTP0512",
			MedicationID: "MED-CARD02",
		},
	}
	for i := range aList {
		r.alerts[aList[i].ID] = &aList[i]
	}

	// Investigations
	invList := []domain.Investigation{
		{
			ID:                  "INV0281",
			AlertID:             "ALERT0281",
			TargetParticipantID: "P00182",
			RiskScore:           87,
			RiskLevel:           domain.RiskLevelHigh,
			Status:              domain.AlertStatusUnderReview,
			AssignedTo:          "ANALYST001",
			OpenedAt:            "2026-10-06 11:43:00 WITA",
			Evidence: domain.InvestigationEvidence{
				TransactionCount: 17,
				FacilityCount:    4,
				MedicationCount:  2,
				TimeframeDays:    21,
			},
			Signals: []domain.SignalBreakdown{
				{Label: "Early refill", Weight: 20, Description: "Refill obat diajukan rata-rata 11 hari sebelum jadwal resep habis"},
				{Label: "Quantity anomaly", Weight: 15, Description: "Volume obat yang ditebus mencapai 240% dari estimasi konsumsi bulanan"},
				{Label: "Cross facility", Weight: 18, Description: "Perpindahan 4 faskes berbeda dalam rentang radius 12 km secara bergantian"},
				{Label: "Network correlation", Weight: 21, Description: "Terhubung dengan klaster resep dokter D-401 dan apotek jejaring terindikasi"},
				{Label: "ML anomaly", Weight: 13, Description: "Model Random Forest mendeteksi outlier deviasi 3.4σ terhadap rata-rata kelompok usia"},
			},
			Timeline: []domain.InvestigationTimelineItem{
				{Date: "01 OKT 2026", Time: "09:14 WITA", FacilityID: "FKTP0182", FacilityName: "Klinik Pratama Sehat Mandiri", MedicationID: "MEDX", MedicationName: "Metformin-Glibenclav 500/5mg", Quantity: 60, Flag: "Penebusan resep kronis standar (30 hari)", RiskFlagSeverity: "low"},
				{Date: "05 OKT 2026", Time: "14:22 WITA", FacilityID: "FKTP0291", FacilityName: "Klinik Rawat Medika Utama", MedicationID: "MEDX", MedicationName: "Metformin-Glibenclav 500/5mg", Quantity: 60, Flag: "Early refill terdeteksi (Hari ke-4 setelah resep pertama)", RiskFlagSeverity: "medium"},
				{Date: "07 OKT 2026", Time: "11:05 WITA", FacilityID: "FKTP0301", FacilityName: "Puskesmas Harapan Bangsa", MedicationID: "MEDX", MedicationName: "Metformin-Glibenclav 500/5mg", Quantity: 90, Flag: "Early refill + Quantity anomaly (+50% volume resep)", RiskFlagSeverity: "high"},
				{Date: "12 OKT 2026", Time: "16:40 WITA", FacilityID: "FKRTL0045", FacilityName: "RS Tipe C Graha Medika Sentra", MedicationID: "MEDY", MedicationName: "Analgesik Opioid-Sintetik 50mg", Quantity: 40, Flag: "Penebusan resep kedua zat aktif terkontrol tanpa resume medis rujukan", RiskFlagSeverity: "high"},
				{Date: "18 OKT 2026", Time: "10:18 WITA", FacilityID: "FKTP0182", FacilityName: "Klinik Pratama Sehat Mandiri", MedicationID: "MEDY", MedicationName: "Analgesik Opioid-Sintetik 50mg", Quantity: 30, Flag: "Siklus berulang ke faskes awal - Network cluster triggered", RiskFlagSeverity: "high"},
			},
			Notes: []domain.InvestigationNote{
				{ID: "NOTE-1", Author: "ANALYST001", Timestamp: "11:45 WITA", Content: "Berkas rekam klaim digital menunjukkan tidak ada rujukan gawat darurat antar faskes. Menunggu klarifikasi konfirmasi verifikator kantor cabang."},
			},
		},
		{
			ID:                  "INV0279",
			AlertID:             "ALERT0279",
			TargetParticipantID: "P00412",
			RiskScore:           92,
			RiskLevel:           domain.RiskLevelCritical,
			Status:              domain.AlertStatusOpen,
			AssignedTo:          "ANALYST001",
			OpenedAt:            "2026-10-06 11:37:00 WITA",
			Evidence: domain.InvestigationEvidence{
				TransactionCount: 26,
				FacilityCount:    5,
				MedicationCount:  2,
				TimeframeDays:    14,
			},
			Signals: []domain.SignalBreakdown{
				{Label: "Syndicate cluster", Weight: 28, Description: "Pola pengambilan serempak di hari yang sama dengan 3 peserta terhubung"},
				{Label: "Rapid cycling", Weight: 22, Description: "Klaim diajukan dalam interval rata-rata 36 jam"},
				{Label: "Early refill", Weight: 24, Description: "Refill berulang sebelum persediaan resep sebelumnya terpakai 20%"},
			},
			Timeline: []domain.InvestigationTimelineItem{
				{Date: "28 SEP 2026", Time: "08:30 WITA", FacilityID: "FKTP0182", FacilityName: "Klinik Pratama Sehat Mandiri", MedicationID: "MEDY", MedicationName: "Analgesik Opioid-Sintetik 50mg", Quantity: 50, Flag: "Penebusan awal paket terapi", RiskFlagSeverity: "low"},
			},
			Notes: []domain.InvestigationNote{},
		},
		{
			ID:                  "INV0277",
			AlertID:             "ALERT0277",
			TargetParticipantID: "P00291",
			RiskScore:           82,
			RiskLevel:           domain.RiskLevelHigh,
			Status:              domain.AlertStatusUnderReview,
			AssignedTo:          "ANALYST002",
			OpenedAt:            "2026-10-06 11:16:00 WITA",
			Evidence: domain.InvestigationEvidence{
				TransactionCount: 14,
				FacilityCount:    3,
				MedicationCount:  2,
				TimeframeDays:    30,
			},
			Signals: []domain.SignalBreakdown{
				{Label: "Quantity anomaly", Weight: 35, Description: "Total penyerapan obat diabetes 3.2x kebutuhan bulanan"},
			},
			Timeline: []domain.InvestigationTimelineItem{},
			Notes:    []domain.InvestigationNote{},
		},
	}
	for i := range invList {
		r.investigations[invList[i].ID] = &invList[i]
	}

	// Audit Logs
	r.auditLogs = []domain.AuditLog{
		{ID: "AUDIT-8910", Timestamp: "11:43:02 WITA", User: "ANALYST001", Action: "VIEW_INVESTIGATION", Resource: "INV0281 (P00182)", Result: "SUCCESS", Details: "Membuka timeline investigasi dan grafik korelasi jaringan klaster P00182"},
		{ID: "AUDIT-8909", Timestamp: "11:42:18 WITA", User: "SYSTEM_RISK_ENGINE", Action: "EMIT_RISK_ALERT", Resource: "ALERT0281 (P00182)", Result: "SUCCESS", Details: "Skor risiko 87 melampaui batas ambang kritis 85; notifikasi otomatis dibuat"},
		{ID: "AUDIT-8908", Timestamp: "11:39:22 WITA", User: "ADMIN001", Action: "UPDATE_RULE", Resource: "RULE_004 (Network Anomaly)", Result: "SUCCESS", Details: "Mengubah bobot rule dari 18 ke 21 poin"},
		{ID: "AUDIT-8907", Timestamp: "11:25:10 WITA", User: "ANALYST002", Action: "UPDATE_INVESTIGATION_STATUS", Resource: "INV0277", Result: "SUCCESS", Details: "Status diubah menjadi UNDER REVIEW; ditugaskan ke verifikator farmasi"},
		{ID: "AUDIT-8906", Timestamp: "11:10:45 WITA", User: "ANALYST001", Action: "SEARCH_ENTITY", Resource: "P00182", Result: "SUCCESS", Details: "Kueri terminal: search peserta P00182"},
	}

	// Network 3D Nodes
	r.networkNodes = []domain.NetworkNodeData{
		{ID: "P00182", Label: "P00182", Type: "participant", RiskScore: 87, Degree: 6, Subtitle: "Peserta Risiko Tinggi"},
		{ID: "P00291", Label: "P00291", Type: "participant", RiskScore: 78, Degree: 4, Subtitle: "Peserta Terkorelasi"},
		{ID: "P00412", Label: "P00412", Type: "participant", RiskScore: 92, Degree: 5, Subtitle: "Peserta Kritis"},
		{ID: "P00381", Label: "P00381", Type: "participant", RiskScore: 64, Degree: 3, Subtitle: "Peserta Sedang"},
		{ID: "FKTP0182", Label: "FKTP0182", Type: "facility", RiskScore: 84, Degree: 5, Subtitle: "Klinik Pratama Sehat Mandiri"},
		{ID: "FKTP0291", Label: "FKTP0291", Type: "facility", RiskScore: 79, Degree: 4, Subtitle: "Klinik Rawat Medika Utama"},
		{ID: "FKTP0301", Label: "FKTP0301", Type: "facility", RiskScore: 62, Degree: 3, Subtitle: "Puskesmas Harapan Bangsa"},
		{ID: "FKRTL0045", Label: "FKRTL0045", Type: "facility", RiskScore: 71, Degree: 4, Subtitle: "RS Tipe C Graha Medika"},
		{ID: "FKTP0512", Label: "FKTP0512", Type: "facility", RiskScore: 38, Degree: 2, Subtitle: "Puskesmas Delta Sentosa"},
		{ID: "MEDX", Label: "MEDX", Type: "medication", RiskScore: 82, Degree: 6, Subtitle: "Metformin-Glibenclav 500mg"},
		{ID: "MEDY", Label: "MEDY", Type: "medication", RiskScore: 91, Degree: 5, Subtitle: "Analgesik Opioid-Sintetik 50mg"},
		{ID: "MED-INS01", Label: "MED-INS01", Type: "medication", RiskScore: 68, Degree: 3, Subtitle: "Insulin Glargine Pen"},
		{ID: "ALERT0281", Label: "ALERT0281", Type: "alert", RiskScore: 87, Degree: 3, Subtitle: "Early refill & Cross-facility"},
		{ID: "ALERT0279", Label: "ALERT0279", Type: "alert", RiskScore: 92, Degree: 2, Subtitle: "Syndicate cluster"},
		{ID: "ALERT0277", Label: "ALERT0277", Type: "alert", RiskScore: 82, Degree: 2, Subtitle: "Quantity anomaly surge"},
		{ID: "RX18291", Label: "RX18291", Type: "prescription", RiskScore: 85, Degree: 3, Subtitle: "Resep Polifarmasi 12 Okt"},
	}

	// Network 3D Edges
	r.networkEdges = []domain.NetworkEdgeData{
		{ID: "e1", Source: "P00182", Target: "FKTP0182", Label: "6 Klaim", RelationshipType: "CLAIMED"},
		{ID: "e2", Source: "P00182", Target: "FKTP0291", Label: "4 Klaim", RelationshipType: "CLAIMED"},
		{ID: "e3", Source: "P00182", Target: "FKTP0301", Label: "3 Klaim", RelationshipType: "CLAIMED"},
		{ID: "e4", Source: "P00182", Target: "FKRTL0045", Label: "4 Klaim", RelationshipType: "CLAIMED"},
		{ID: "e5", Source: "P00182", Target: "MEDX", Label: "Early Refill", RelationshipType: "EARLY_REFILL"},
		{ID: "e6", Source: "P00182", Target: "MEDY", Label: "Overlap Qty", RelationshipType: "QUANTITY_ANOMALY"},
		{ID: "e7", Source: "P00182", Target: "ALERT0281", Label: "Target Investigasi", RelationshipType: "INVESTIGATION"},
		{ID: "e8", Source: "ALERT0281", Target: "FKTP0182", Label: "Lokus Utama", RelationshipType: "LOCUS"},
		{ID: "e9", Source: "ALERT0281", Target: "MEDX", Label: "Substansi", RelationshipType: "SUBSTANCE"},
		{ID: "e10", Source: "FKTP0182", Target: "MEDX", Label: "Konsentrasi Klaim", RelationshipType: "CONCENTRATION"},
		{ID: "e11", Source: "FKTP0291", Target: "MEDX", Label: "Dispensing", RelationshipType: "DISPENSED"},
		{ID: "e12", Source: "FKRTL0045", Target: "MEDY", Label: "Spesialis Rujuk", RelationshipType: "REFERRAL"},
		{ID: "e13", Source: "P00412", Target: "FKTP0291", Label: "3 Klaim", RelationshipType: "CLAIMED"},
		{ID: "e14", Source: "P00412", Target: "MEDY", Label: "Tinggi", RelationshipType: "HIGH_DOSAGE"},
		{ID: "e15", Source: "P00412", Target: "ALERT0279", Label: "Target Kritis", RelationshipType: "INVESTIGATION"},
		{ID: "e16", Source: "P00291", Target: "FKTP0182", Label: "5 Klaim", RelationshipType: "CLAIMED"},
		{ID: "e17", Source: "P00291", Target: "MEDX", Label: "Klaster Resep", RelationshipType: "CLUSTER"},
		{ID: "e18", Source: "P00291", Target: "ALERT0277", Label: "Anomali Kuota", RelationshipType: "QUANTITY_ANOMALY"},
		{ID: "e19", Source: "P00381", Target: "FKRTL0045", Label: "2 Klaim", RelationshipType: "CLAIMED"},
		{ID: "e20", Source: "P00381", Target: "MEDY", Label: "Neurologi", RelationshipType: "THERAPY"},
		{ID: "e21", Source: "RX18291", Target: "P00182", Label: "Penerima", RelationshipType: "PRESCRIBED"},
		{ID: "e22", Source: "RX18291", Target: "FKTP0182", Label: "Faskes Penerbit", RelationshipType: "ISSUED_BY"},
		{ID: "e23", Source: "RX18291", Target: "MEDX", Label: "Zat Aktif", RelationshipType: "SUBSTANCE"},
		{ID: "e24", Source: "FKTP0512", Target: "MED-INS01", Label: "Distribusi", RelationshipType: "DISPENSED"},
		{ID: "e25", Source: "P00291", Target: "MED-INS01", Label: "Insulin", RelationshipType: "DISPENSED"},
	}

	logger.Info("Memory repository seeded with simulated intelligence dataset")
}

// User methods
func (r *MemoryRepository) GetUserByUsername(ctx context.Context, username string) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	user, found := r.users[username]
	if !found {
		return nil, fmt.Errorf("user not found")
	}
	// Return a copy
	u := *user
	return &u, nil
}

func (r *MemoryRepository) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, u := range r.users {
		if u.ID == id {
			copy := *u
			return &copy, nil
		}
	}
	return nil, fmt.Errorf("user not found")
}

func (r *MemoryRepository) ListUsers(ctx context.Context) ([]domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	res := make([]domain.User, 0, len(r.users))
	for _, u := range r.users {
		res = append(res, *u)
	}
	return res, nil
}

func (r *MemoryRepository) CreateUser(ctx context.Context, user *domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, exists := r.users[user.Username]; exists {
		return fmt.Errorf("username already exists")
	}
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	r.users[user.Username] = user
	return nil
}

func (r *MemoryRepository) UpdateUserStatus(ctx context.Context, id string, status domain.UserStatus) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, u := range r.users {
		if u.ID == id {
			u.Status = status
			u.UpdatedAt = time.Now()
			return nil
		}
	}
	return fmt.Errorf("user not found")
}

func (r *MemoryRepository) UpdateUserLoginSuccess(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, u := range r.users {
		if u.ID == id {
			u.FailedLoginCount = 0
			now := time.Now()
			u.LastLoginAt = &now
			u.AccessCount++
			return nil
		}
	}
	return nil
}

func (r *MemoryRepository) RecordFailedLogin(ctx context.Context, username string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if u, exists := r.users[username]; exists {
		u.FailedLoginCount++
		if u.FailedLoginCount >= 5 {
			u.Status = domain.UserStatusDisabled
		}
	}
	return nil
}

// Token methods
func (r *MemoryRepository) SaveRefreshToken(ctx context.Context, token *domain.RefreshToken) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.tokens[token.TokenHash] = token
	return nil
}

func (r *MemoryRepository) GetRefreshToken(ctx context.Context, hash string) (*domain.RefreshToken, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	token, found := r.tokens[hash]
	if !found || token.Revoked {
		return nil, fmt.Errorf("token not found or revoked")
	}
	if time.Now().After(token.ExpiresAt) {
		return nil, fmt.Errorf("token expired")
	}
	return token, nil
}

func (r *MemoryRepository) RevokeRefreshToken(ctx context.Context, hash string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if t, exists := r.tokens[hash]; exists {
		t.Revoked = true
	}
	return nil
}

// Participants
func (r *MemoryRepository) ListParticipants(ctx context.Context, query string, riskLevel string) ([]domain.Participant, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	res := make([]domain.Participant, 0)
	for _, p := range r.participants {
		if riskLevel != "" && string(p.RiskLevel) != riskLevel {
			continue
		}
		res = append(res, *p)
	}
	return res, nil
}

func (r *MemoryRepository) GetParticipantByID(ctx context.Context, id string) (*domain.Participant, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, found := r.participants[id]
	if !found {
		return nil, fmt.Errorf("participant not found")
	}
	res := *p
	return &res, nil
}

func (r *MemoryRepository) GetParticipantTimeline(ctx context.Context, id string) ([]domain.InvestigationTimelineItem, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, inv := range r.investigations {
		if inv.TargetParticipantID == id {
			return inv.Timeline, nil
		}
	}
	return []domain.InvestigationTimelineItem{}, nil
}

// Facilities
func (r *MemoryRepository) ListFacilities(ctx context.Context, query string) ([]domain.Facility, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	res := make([]domain.Facility, 0, len(r.facilities))
	for _, f := range r.facilities {
		res = append(res, *f)
	}
	return res, nil
}

func (r *MemoryRepository) GetFacilityByID(ctx context.Context, id string) (*domain.Facility, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	f, found := r.facilities[id]
	if !found {
		return nil, fmt.Errorf("facility not found")
	}
	res := *f
	return &res, nil
}

// Medications
func (r *MemoryRepository) ListMedications(ctx context.Context, query string) ([]domain.Medication, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	res := make([]domain.Medication, 0, len(r.medications))
	for _, m := range r.medications {
		res = append(res, *m)
	}
	return res, nil
}

func (r *MemoryRepository) GetMedicationByID(ctx context.Context, id string) (*domain.Medication, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	m, found := r.medications[id]
	if !found {
		return nil, fmt.Errorf("medication not found")
	}
	res := *m
	return &res, nil
}

// Transactions
func (r *MemoryRepository) ListTransactions(ctx context.Context, limit int) ([]domain.Transaction, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if limit <= 0 || limit > len(r.transactions) {
		limit = len(r.transactions)
	}
	res := make([]domain.Transaction, limit)
	copy(res, r.transactions[:limit])
	return res, nil
}

func (r *MemoryRepository) CreateTransaction(ctx context.Context, tx *domain.Transaction) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.transactions = append([]domain.Transaction{*tx}, r.transactions...)
	return nil
}

// Alerts
func (r *MemoryRepository) ListAlerts(ctx context.Context, severity, status, facilityID, medicationID string) ([]domain.RiskAlert, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	res := make([]domain.RiskAlert, 0)
	for _, a := range r.alerts {
		if severity != "" && severity != "ALL" && string(a.Severity) != severity {
			continue
		}
		if status != "" && status != "ALL" && string(a.Status) != status {
			continue
		}
		if facilityID != "" && facilityID != "ALL" && a.FacilityID != facilityID {
			continue
		}
		if medicationID != "" && medicationID != "ALL" && a.MedicationID != medicationID {
			continue
		}
		res = append(res, *a)
	}
	return res, nil
}

func (r *MemoryRepository) GetAlertByID(ctx context.Context, id string) (*domain.RiskAlert, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	a, found := r.alerts[id]
	if !found {
		return nil, fmt.Errorf("alert not found")
	}
	res := *a
	return &res, nil
}

func (r *MemoryRepository) UpdateAlertStatus(ctx context.Context, id string, status domain.AlertStatus) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	a, found := r.alerts[id]
	if !found {
		return fmt.Errorf("alert not found")
	}
	a.Status = status
	a.UpdatedAt = time.Now()
	return nil
}

// Risk Rules
func (r *MemoryRepository) ListRiskRules(ctx context.Context) ([]domain.RiskRule, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	res := make([]domain.RiskRule, 0, len(r.riskRules))
	for _, rule := range r.riskRules {
		res = append(res, *rule)
	}
	return res, nil
}

func (r *MemoryRepository) GetRiskRuleByCode(ctx context.Context, code string) (*domain.RiskRule, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, rule := range r.riskRules {
		if rule.Code == code {
			res := *rule
			return &res, nil
		}
	}
	return nil, fmt.Errorf("rule not found")
}

func (r *MemoryRepository) UpdateRiskRule(ctx context.Context, id string, weight *int, status *string, updatedBy string) (*domain.RiskRule, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	rule, found := r.riskRules[id]
	if !found {
		return nil, fmt.Errorf("rule not found")
	}
	if weight != nil {
		rule.Weight = *weight
	}
	if status != nil {
		rule.Status = *status
	}
	rule.LastUpdated = "Baru saja"
	rule.UpdatedBy = updatedBy
	rule.UpdatedAt = time.Now()
	res := *rule
	return &res, nil
}

// Network Graph
func (r *MemoryRepository) GetNetworkGraph(ctx context.Context, entityType, entityID string, depth int, cluster string) (*domain.NetworkGraphResponse, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	// If filtered by entityID, filter connected nodes
	if entityID != "" {
		connectedSet := map[string]bool{entityID: true}
		var relevantEdges []domain.NetworkEdgeData
		for _, e := range r.networkEdges {
			if e.Source == entityID || e.Target == entityID {
				connectedSet[e.Source] = true
				connectedSet[e.Target] = true
				relevantEdges = append(relevantEdges, e)
			}
		}

		var relevantNodes []domain.NetworkNodeData
		for _, n := range r.networkNodes {
			if connectedSet[n.ID] {
				relevantNodes = append(relevantNodes, n)
			}
		}

		return &domain.NetworkGraphResponse{
			Nodes: relevantNodes,
			Edges: relevantEdges,
		}, nil
	}

	return &domain.NetworkGraphResponse{
		Nodes: r.networkNodes,
		Edges: r.networkEdges,
	}, nil
}

// Investigations
func (r *MemoryRepository) ListInvestigations(ctx context.Context) ([]domain.Investigation, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	res := make([]domain.Investigation, 0, len(r.investigations))
	for _, inv := range r.investigations {
		res = append(res, *inv)
	}
	return res, nil
}

func (r *MemoryRepository) GetInvestigationByID(ctx context.Context, id string) (*domain.Investigation, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	inv, found := r.investigations[id]
	if !found {
		return nil, fmt.Errorf("investigation not found")
	}
	res := *inv
	return &res, nil
}

func (r *MemoryRepository) CreateInvestigation(ctx context.Context, inv *domain.Investigation) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.investigations[inv.ID] = inv
	return nil
}

func (r *MemoryRepository) UpdateInvestigationStatus(ctx context.Context, id string, status domain.AlertStatus, resolution string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	inv, found := r.investigations[id]
	if !found {
		return fmt.Errorf("investigation not found")
	}
	inv.Status = status
	if resolution != "" {
		inv.ResolutionSummary = resolution
	}
	inv.UpdatedAt = time.Now()

	// Sync corresponding alert status
	if inv.AlertID != "" {
		if a, aFound := r.alerts[inv.AlertID]; aFound {
			a.Status = status
			a.UpdatedAt = time.Now()
		}
	}
	return nil
}

func (r *MemoryRepository) AddInvestigationNote(ctx context.Context, id, author, content string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	inv, found := r.investigations[id]
	if !found {
		return fmt.Errorf("investigation not found")
	}
	nowStr := time.Now().Format("15:04") + " WITA"
	note := domain.InvestigationNote{
		ID:        fmt.Sprintf("NOTE-%d", time.Now().UnixMilli()),
		Author:    author,
		Timestamp: nowStr,
		Content:   content,
	}
	inv.Notes = append(inv.Notes, note)
	return nil
}

// Audit Logs
func (r *MemoryRepository) ListAuditLogs(ctx context.Context, user, action, query string, limit int) ([]domain.AuditLog, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	res := make([]domain.AuditLog, 0)
	for _, l := range r.auditLogs {
		if user != "" && user != "ALL" && l.User != user {
			continue
		}
		if action != "" && action != "ALL" && l.Action != action {
			continue
		}
		res = append(res, l)
		if limit > 0 && len(res) >= limit {
			break
		}
	}
	return res, nil
}

func (r *MemoryRepository) AppendAuditLog(ctx context.Context, log *domain.AuditLog) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.auditLogs = append([]domain.AuditLog{*log}, r.auditLogs...)
	return nil
}

// Overview Summary
func (r *MemoryRepository) GetOverviewSummary(ctx context.Context) (*domain.OverviewSummary, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	activeAlerts := 0
	criticalAlerts := 0
	highAlerts := 0
	for _, a := range r.alerts {
		if a.Status == domain.AlertStatusOpen || a.Status == domain.AlertStatusUnderReview {
			activeAlerts++
			if a.Severity == domain.SeverityCritical {
				criticalAlerts++
			} else if a.Severity == domain.SeverityHigh {
				highAlerts++
			}
		}
	}

	recentAlerts := make([]domain.RiskAlert, 0)
	for _, a := range r.alerts {
		recentAlerts = append(recentAlerts, *a)
		if len(recentAlerts) >= 5 {
			break
		}
	}

	recentTx := make([]domain.Transaction, 0)
	for _, tx := range r.transactions {
		recentTx = append(recentTx, tx)
		if len(recentTx) >= 7 {
			break
		}
	}

	return &domain.OverviewSummary{
		RiskIndex:          72.8,
		ActiveAlerts:       activeAlerts,
		CriticalAlerts:     criticalAlerts,
		HighAlerts:         highAlerts,
		NetworkClusters:    17,
		RecentAlerts:       recentAlerts,
		RecentTransactions: recentTx,
		SystemStatus: map[string]string{
			"api":            "ONLINE",
			"risk_engine":    "ONLINE",
			"network_engine": "ONLINE",
			"database":       "ONLINE",
			"redis":          "ONLINE",
			"ml_engine":      "ONLINE",
		},
	}, nil
}
