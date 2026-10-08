package terminal

import (
	"context"
	"fmt"
	"strings"

	"rxguard-backend/internal/database"
	"rxguard-backend/internal/domain"
)

type Parser struct {
	repo database.Repository
}

func NewParser(repo database.Repository) *Parser {
	return &Parser{repo: repo}
}

func (p *Parser) ParseAndExecute(ctx context.Context, rawCmd string) (*domain.TerminalQueryResponse, error) {
	trimmed := strings.TrimSpace(rawCmd)
	if trimmed == "" {
		return &domain.TerminalQueryResponse{
			Command: rawCmd,
			Type:    "system",
			Title:   "Command kosong",
			RawText: "Ketik 'help' untuk melihat daftar command yang didukung.",
		}, nil
	}

	lower := strings.ToLower(trimmed)

	if lower == "help" {
		helpText := `Daftar perintah intelijen yang didukung:
  search peserta [ID]      - Analisis risiko peserta (cth: search peserta P00182)
  search obat [ID]         - Profil risiko peresepan obat (cth: search obat MEDX)
  search fasilitas [ID]    - Audit risiko faskes (cth: search fasilitas FKTP0182)
  risk critical            - Tampilkan daftar alert tingkat KRITIS
  risk high                - Tampilkan daftar alert tingkat TINGGI
  network [ID]             - Eksplorasi graf relasi entitas 3D (cth: network P00182)
  investigate [ID]         - Buka lembar investigasi (cth: investigate INV0281)
  alerts                   - Buka daftar risk alert aktif
  clear                    - Bersihkan hasil terminal
  help                     - Tampilkan panduan ini`

		return &domain.TerminalQueryResponse{
			Command: rawCmd,
			Type:    "help",
			Title:   "PANDUAN PERINTAH TERMINAL RXGUARD",
			RawText: helpText,
		}, nil
	}

	if lower == "clear" {
		return &domain.TerminalQueryResponse{
			Command: rawCmd,
			Type:    "system",
			Title:   "Terminal dibersihkan",
			RawText: "[OK] Layar dan hasil terminal telah di-reset.",
		}, nil
	}

	if lower == "alerts" {
		alerts, _ := p.repo.ListAlerts(ctx, "", "", "", "")
		return &domain.TerminalQueryResponse{
			Command:     rawCmd,
			Type:        "filter",
			Title:       "DAFTAR NOTIFIKASI RISIKO",
			StatusText:  fmt.Sprintf("%d Total Risk Alerts Aktif", len(alerts)),
			TargetRoute: "/terminal/alerts",
			RawText:     "Memuat tabel deteksi anomali operasional real-time.",
			Data:        alerts,
		}, nil
	}

	if strings.HasPrefix(lower, "search peserta") {
		parts := strings.Fields(trimmed)
		id := "P00182"
		if len(parts) >= 3 {
			id = strings.ToUpper(parts[2])
		}

		participant, err := p.repo.GetParticipantByID(ctx, id)
		if err != nil {
			return &domain.TerminalQueryResponse{
				Command: rawCmd,
				Type:    "not_found",
				Title:   fmt.Sprintf("Peserta %s Tidak Ditemukan", id),
				RawText: "Entitas pseudonym peserta tidak terdaftar dalam database simulasi.",
			}, nil
		}

		score := participant.RiskScore
		return &domain.TerminalQueryResponse{
			Command:     rawCmd,
			Type:        "participant",
			Title:       fmt.Sprintf("PESERTA %s", participant.ID),
			StatusText:  participant.Status,
			RiskScore:   &score,
			RiskLevel:   string(participant.RiskLevel),
			Signals:     participant.Signals,
			EntityID:    participant.ID,
			TargetRoute: fmt.Sprintf("/terminal/participants?id=%s", participant.ID),
			Data:        participant,
		}, nil
	}

	if strings.HasPrefix(lower, "search obat") {
		parts := strings.Fields(trimmed)
		id := "MEDX"
		if len(parts) >= 3 {
			id = strings.ToUpper(parts[2])
		}

		med, err := p.repo.GetMedicationByID(ctx, id)
		if err != nil {
			return &domain.TerminalQueryResponse{
				Command: rawCmd,
				Type:    "not_found",
				Title:   fmt.Sprintf("Obat %s Tidak Ditemukan", id),
				RawText: "Zat aktif atau kode obat simulasi tidak ditemukan dalam katalog risiko.",
			}, nil
		}

		score := med.RiskScore
		level := "SEDANG"
		if score > 80 {
			level = "TINGGI"
		}

		return &domain.TerminalQueryResponse{
			Command:     rawCmd,
			Type:        "medication",
			Title:       fmt.Sprintf("OBAT %s - %s", med.ID, med.Name),
			StatusText:  med.Category,
			RiskScore:   &score,
			RiskLevel:   level,
			Signals:     med.Signals,
			EntityID:    med.ID,
			TargetRoute: fmt.Sprintf("/terminal/medications?id=%s", med.ID),
			Data:        med,
		}, nil
	}

	if strings.HasPrefix(lower, "search fasilitas") {
		parts := strings.Fields(trimmed)
		id := "FKTP0182"
		if len(parts) >= 3 {
			id = strings.ToUpper(parts[2])
		}

		fac, err := p.repo.GetFacilityByID(ctx, id)
		if err != nil {
			return &domain.TerminalQueryResponse{
				Command: rawCmd,
				Type:    "not_found",
				Title:   fmt.Sprintf("Fasilitas %s Tidak Ditemukan", id),
				RawText: "Kode faskes tidak ditemukan dalam registry simulasi.",
			}, nil
		}

		score := fac.RiskScore
		return &domain.TerminalQueryResponse{
			Command:     rawCmd,
			Type:        "facility",
			Title:       fmt.Sprintf("FASKES %s - %s", fac.ID, fac.Name),
			StatusText:  fac.Type,
			RiskScore:   &score,
			RiskLevel:   fac.Status,
			Signals:     []string{fmt.Sprintf("%d kejadian risiko terdeteksi", fac.RiskEvents), fmt.Sprintf("%d total klaim", fac.TransactionCount)},
			EntityID:    fac.ID,
			TargetRoute: fmt.Sprintf("/terminal/facilities?id=%s", fac.ID),
			Data:        fac,
		}, nil
	}

	if lower == "risk critical" || lower == "risk high" {
		severity := "HIGH"
		if strings.Contains(lower, "critical") {
			severity = "CRITICAL"
		}
		return &domain.TerminalQueryResponse{
			Command:     rawCmd,
			Type:        "filter",
			Title:       fmt.Sprintf("FILTER RISK ALERTS: %s", severity),
			StatusText:  fmt.Sprintf("Menampilkan semua notifikasi risiko berkategori %s", severity),
			TargetRoute: fmt.Sprintf("/terminal/alerts?severity=%s", severity),
			RawText:     "Ditemukan sinyal anomali prioritas tinggi dalam feed intelijen.",
		}, nil
	}

	if strings.HasPrefix(lower, "network") {
		parts := strings.Fields(trimmed)
		id := "P00182"
		if len(parts) >= 2 {
			id = strings.ToUpper(parts[1])
		}

		return &domain.TerminalQueryResponse{
			Command:     rawCmd,
			Type:        "participant",
			Title:       fmt.Sprintf("GRAF JARINGAN: %s", id),
			StatusText:  "Eksplorasi topologi relasi klaim 3D",
			TargetRoute: fmt.Sprintf("/terminal/network?focus=%s", id),
			RawText:     fmt.Sprintf("Memetakan relasi klaim, fasilitas rujukan, dan sirkulasi obat terhubung entitas %s.", id),
		}, nil
	}

	if strings.HasPrefix(lower, "investigate") {
		parts := strings.Fields(trimmed)
		id := "INV0281"
		if len(parts) >= 2 {
			id = strings.ToUpper(parts[1])
		}
		if strings.HasPrefix(id, "ALERT") {
			// Find investigation by alert ID
			if alert, err := p.repo.GetAlertByID(ctx, id); err == nil && alert.InvestigationID != "" {
				id = alert.InvestigationID
			}
		}

		inv, err := p.repo.GetInvestigationByID(ctx, id)
		if err != nil {
			id = "INV0281"
			inv, _ = p.repo.GetInvestigationByID(ctx, id)
		}

		score := inv.RiskScore
		signals := make([]string, 0, len(inv.Signals))
		for _, s := range inv.Signals {
			signals = append(signals, fmt.Sprintf("%s (+%d)", s.Label, s.Weight))
		}

		return &domain.TerminalQueryResponse{
			Command:     rawCmd,
			Type:        "investigation",
			Title:       fmt.Sprintf("INVESTIGASI %s", inv.ID),
			StatusText:  fmt.Sprintf("Status: %s", inv.Status),
			RiskScore:   &score,
			RiskLevel:   string(inv.RiskLevel),
			Signals:     signals,
			EntityID:    inv.ID,
			TargetRoute: fmt.Sprintf("/terminal/investigations?id=%s", inv.ID),
			Data:        inv,
		}, nil
	}

	return &domain.TerminalQueryResponse{
		Command: rawCmd,
		Type:    "not_found",
		Title:   fmt.Sprintf("Perintah '%s' Tidak Dikenal", trimmed),
		RawText: "Sintaks tidak valid. Ketik 'help' untuk panduan perintah terminal.",
	}, nil
}
