-- RXGUARD Database Migration: 000002_seed_data.up.sql
-- Seed Simulated Intelligence Data

-- Roles
INSERT INTO roles (id, name, description) VALUES
('ROLE-1', 'ADMIN', 'Administrator Kontrol Sistem - Akses Penuh Konfigurasi & Audit'),
('ROLE-2', 'ANALYST', 'Analis Investigasi Risiko - Akses Triage, Pemetaan Relasi & Investigasi'),
('ROLE-3', 'AUDITOR', 'Pengawas Kepatuhan Eksternal - Akses Log Audit & Laporan');

-- Users ($2a$10$wT8f1i8z6oPqH6G8x0l0ue0K.vKqE7L7uT9xX6b/5rX.7Y6Z8WbKu is bcrypt for "demo123" or demo login)
INSERT INTO users (id, username, password_hash, name, role, status, access_count) VALUES
('USR-001', 'analyst.demo', '$2a$10$3m6Isq8cKjQZfD7F3U.s1uL5f4H3R1rBq2X7N8M9K0P1L2V3B4N5M', 'Analis Investigasi Utama 001', 'ANALYST', 'ACTIVE', 148),
('USR-002', 'admin.demo', '$2a$10$3m6Isq8cKjQZfD7F3U.s1uL5f4H3R1rBq2X7N8M9K0P1L2V3B4N5M', 'Administrator Kontrol Sistem 001', 'ADMIN', 'ACTIVE', 312),
('USR-003', 'analyst02', '$2a$10$3m6Isq8cKjQZfD7F3U.s1uL5f4H3R1rBq2X7N8M9K0P1L2V3B4N5M', 'Analis Investigasi Lapangan 002', 'ANALYST', 'ACTIVE', 94),
('USR-004', 'auditor01', '$2a$10$3m6Isq8cKjQZfD7F3U.s1uL5f4H3R1rBq2X7N8M9K0P1L2V3B4N5M', 'Pengawas Kepatuhan Eksternal', 'AUDITOR', 'ACTIVE', 42);

-- Participants
INSERT INTO participants (id, risk_score, risk_level, facilities_count, medication_events, status, last_activity) VALUES
('P00182', 87, 'TINGGI', 4, 17, 'Perlu Ditinjau', '10 Mnt lalu'),
('P00291', 78, 'TINGGI', 3, 14, 'Dalam Investigasi', '32 Mnt lalu'),
('P00381', 64, 'MENCURIGAKAN', 3, 11, 'Perlu Ditinjau', '1 Jam lalu'),
('P00412', 92, 'KRITIS', 5, 26, 'Perlu Ditinjau', '5 Mnt lalu'),
('P00554', 45, 'SEDANG', 2, 8, 'Aktif', '3 Jam lalu'),
('P00620', 24, 'RENDAH', 1, 5, 'Aktif', '6 Jam lalu'),
('P00711', 59, 'SEDANG', 2, 9, 'Aktif', '4 Jam lalu');

-- Facilities
INSERT INTO facilities (id, name, type, region, transaction_count, risk_events, risk_score, status, last_inspection) VALUES
('FKTP0182', 'Klinik Pratama Sehat Mandiri', 'FKTP Klinik Pratama', 'Rayon Metro Barat', 3840, 64, 84, 'Audit Khusus', '2026-09-28'),
('FKTP0291', 'Klinik Rawat Medika Utama', 'FKTP Klinik Pratama', 'Rayon Metro Barat', 4120, 49, 79, 'Pengawasan', '2026-09-15'),
('FKTP0301', 'Puskesmas Harapan Bangsa', 'FKTP Puskesmas', 'Rayon Satelit Utara', 7620, 38, 62, 'Normal', '2026-10-01'),
('FKRTL0045', 'RS Tipe C Graha Medika Sentra', 'FKRTL RS Tipe C', 'Rayon Metro Pusat', 14210, 82, 71, 'Pengawasan', '2026-09-11'),
('FKTP0512', 'Puskesmas Delta Sentosa', 'FKTP Puskesmas', 'Rayon Satelit Selatan', 5890, 22, 38, 'Normal', '2026-10-04');

-- Medications
INSERT INTO medications (id, name, category, transaction_count, facility_count, risk_events, risk_score, refill_cycle_days) VALUES
('MEDX', 'Metformin-Glibenclav 500/5mg (Simulasi)', 'Endokrin & Diabetes Kronis', 12821, 382, 83, 82, 30),
('MEDY', 'Analgesik Opioid-Sintetik 50mg (Simulasi)', 'Analgesik Terkontrol', 4210, 94, 67, 91, 14),
('MED-INS01', 'Insulin Glargine 100 IU/mL Pen (Simulasi)', 'Anti-Diabetik Parenteral', 8940, 215, 41, 68, 28),
('MED-CARD02', 'Atorvastatin Kalium 40mg (Simulasi)', 'Kardiovaskular & Lipid', 18450, 460, 34, 49, 30),
('MED-NEURO05', 'Pregabalin Forte 150mg (Simulasi)', 'Neurologi & Psikiatri', 6120, 112, 52, 76, 21);

-- Prescriptions
INSERT INTO prescriptions (id, participant_id, facility_id, medication_id, quantity, status, notes) VALUES
('RX18291', 'P00182', 'FKTP0182', 'MEDX', 60, 'DISPENSED', 'Resep kronis 30 hari standar'),
('RX18292', 'P00182', 'FKTP0291', 'MEDX', 60, 'DISPENSED', 'Resep ulang interval 4 hari'),
('RX18293', 'P00412', 'FKTP0182', 'MEDY', 50, 'DISPENSED', 'Resep kontrol analgesik'),
('RX18294', 'P00291', 'FKTP0182', 'MEDX', 90, 'DISPENSED', 'Resep kuota tinggi');

-- Transactions
INSERT INTO transactions (id, prescription_id, timestamp, participant_id, facility_id, medication_id, risk_signal, risk_severity, amount, quantity) VALUES
('TX-9841', 'RX18291', '11:42:18 WITA', 'P00182', 'FKTP0182', 'MEDX', 'EARLY REFILL', 'HIGH', 184000, 60),
('TX-9840', 'RX18292', '11:41:51 WITA', 'P00182', 'FKTP0291', 'MEDY', 'NETWORK PATTERN', 'MEDIUM', 320000, 30),
('TX-9839', 'RX18293', '11:40:02 WITA', 'P00412', 'FKTP0301', 'MEDY', 'QUANTITY ANOMALY', 'CRITICAL', 450000, 50),
('TX-9838', 'RX18294', '11:38:44 WITA', 'P00291', 'FKTP0182', 'MEDX', 'REFILL WINDOW COMPRESSION', 'HIGH', 195000, 90),
('TX-9837', NULL, '11:37:12 WITA', 'P00554', 'FKTP0512', 'MED-CARD02', 'BASELINE CONFORMANT', 'LOW', 88000, 30),
('TX-9836', NULL, '11:35:29 WITA', 'P00381', 'FKRTL0045', 'MED-NEURO05', 'CROSS FACILITY OVERLAP', 'MEDIUM', 280000, 30),
('TX-9835', NULL, '11:33:05 WITA', 'P00620', 'FKTP0182', 'MED-INS01', 'CYCLE NORMAL', 'LOW', 210000, 5);

-- Risk Rules
INSERT INTO risk_rules (id, code, name, weight, status, description, last_updated, updated_by) VALUES
('RULE_001', 'RULE_EARLY_REFILL', 'Early Refill Window Compression', 25, 'ACTIVE', 'Penebusan resep obat kronis sebelum sisa hari terapi mencapai < 20% siklus standar.', '2026-10-01 09:00 WITA', 'ADMIN001'),
('RULE_002', 'RULE_CROSS_FACILITY', 'Cross-Facility Multi-Visit Anomaly', 20, 'ACTIVE', 'Kunjungan ke >= 3 faskes berbeda dalam rentang < 14 hari dengan kelas terapi obat sama.', '2026-10-02 14:15 WITA', 'ADMIN001'),
('RULE_003', 'RULE_QTY_SPIKE', 'Prescription Quantity Spike', 20, 'ACTIVE', 'Jumlah kuota obat melampaui > 200% dosis maksimal harian formularium nasional.', '2026-09-25 11:30 WITA', 'ADMIN001'),
('RULE_004', 'RULE_NETWORK_ANOMALY', 'Syndicate Network Correlation', 21, 'ACTIVE', 'Korelasi graf menghubungkan cluster faskes, dokter, apotek, dan kelompok peserta terindikasi.', '2026-10-06 11:39 WITA', 'ADMIN001'),
('RULE_005', 'RULE_DUP_TX', 'Duplicate Transaction Window', 14, 'ACTIVE', 'Klaim zat aktif identik pada hari kalender yang sama di dua entitas fasilitas independen.', '2026-09-18 16:45 WITA', 'ADMIN001');

-- Alerts
INSERT INTO alerts (id, investigation_id, timestamp, entity_id, entity_type, risk_type, severity, risk_score, status, summary, facility_id, medication_id) VALUES
('ALERT0281', 'INV0281', '11:42:18 WITA', 'P00182', 'PARTICIPANT', 'Network anomaly & Cross-facility surge', 'CRITICAL', 87, 'UNDER REVIEW', 'Pola klaim berulang antar 4 fasilitas dalam rentang 21 hari dengan duplikasi zat aktif MEDX & MEDY', 'FKTP0182', 'MEDX'),
('ALERT0279', 'INV0279', '11:36:04 WITA', 'P00412', 'PARTICIPANT', 'Early refill window compression', 'CRITICAL', 92, 'OPEN', 'Pengambilan resep obat analgesik 7 hari sebelum siklus standar berakhir di 3 fasilitas berbeda', 'FKTP0291', 'MEDY'),
('ALERT0277', 'INV0277', '11:15:22 WITA', 'MEDX', 'MEDICATION', 'Quantity anomaly cluster', 'HIGH', 82, 'UNDER REVIEW', 'Lonjakan kuota klaim 320% di atas moving average 60 hari pada klaster FKTP0182 & FKTP0291', 'FKTP0182', 'MEDX'),
('ALERT0272', NULL, '10:58:49 WITA', 'FKTP0182', 'FACILITY', 'Cross facility repeat dispensation', 'HIGH', 78, 'OPEN', 'Tingkat kesamaan peserta 68% dengan FKTP0291 untuk klaim obat khusus dalam jendela 48 jam', 'FKTP0182', 'MED-INS01'),
('ALERT0265', 'INV0265', '10:41:12 WITA', 'P00381', 'PARTICIPANT', 'Multi-doctor prescription overlap', 'MEDIUM', 64, 'OPEN', 'Duplikasi resep neurologi aktif dari 2 dokter perujuk tanpa catatan rujukan balik valid', 'FKRTL0045', 'MED-NEURO05'),
('ALERT0258', NULL, '09:22:30 WITA', 'P00711', 'PARTICIPANT', 'Dosage borderline pattern', 'MEDIUM', 59, 'RESOLVED', 'Ambang batas dosis harian maksimal terlampaui 12% pada klaim obat anti-hiperglikemik', 'FKTP0301', 'MEDX'),
('ALERT0249', NULL, '08:50:11 WITA', 'P00554', 'PARTICIPANT', 'Intermittent early refill', 'LOW', 45, 'FALSE POSITIVE', 'Refill 2 hari lebih awal dilaporkan akibat perjalanan dinas terverifikasi', 'FKTP0512', 'MED-CARD02');

-- Investigations
INSERT INTO investigations (id, alert_id, target_participant_id, risk_score, risk_level, status, assigned_to, opened_at, resolution_summary) VALUES
('INV0281', 'ALERT0281', 'P00182', 87, 'TINGGI', 'UNDER REVIEW', 'ANALYST001', '2026-10-06 11:43:00 WITA', 'Menunggu klarifikasi kantor cabang verifikasi faskes farmasi'),
('INV0279', 'ALERT0279', 'P00412', 92, 'KRITIS', 'OPEN', 'ANALYST001', '2026-10-06 11:37:00 WITA', NULL),
('INV0277', 'ALERT0277', 'P00291', 82, 'TINGGI', 'UNDER REVIEW', 'ANALYST002', '2026-10-06 11:16:00 WITA', NULL),
('INV0265', 'ALERT0265', 'P00381', 64, 'MENCURIGAKAN', 'OPEN', 'ANALYST001', '2026-10-06 10:45:00 WITA', NULL);

-- Investigation Actions / Notes
INSERT INTO investigation_actions (id, investigation_id, action, author, content) VALUES
('ACT-01', 'INV0281', 'NOTE', 'ANALYST001', 'Berkas rekam klaim digital menunjukkan tidak ada rujukan gawat darurat antar faskes. Menunggu klarifikasi konfirmasi verifikator kantor cabang.'),
('ACT-02', 'INV0279', 'NOTE', 'ANALYST001', 'Tercatat kesamaan waktu transpor yang tidak wajar antara FKTP0182 dan FKTP0291.');

-- Audit Logs
INSERT INTO audit_logs (id, timestamp, user_id, action, resource, result, details) VALUES
('AUDIT-8910', '11:43:02 WITA', 'ANALYST001', 'VIEW_INVESTIGATION', 'INV0281 (P00182)', 'SUCCESS', 'Membuka timeline investigasi dan grafik korelasi jaringan klaster P00182'),
('AUDIT-8909', '11:42:18 WITA', 'SYSTEM_RISK_ENGINE', 'EMIT_RISK_ALERT', 'ALERT0281 (P00182)', 'SUCCESS', 'Skor risiko 87 melampaui batas ambang kritis 85; notifikasi otomatis dibuat'),
('AUDIT-8908', '11:39:22 WITA', 'ADMIN001', 'UPDATE_RULE', 'RULE_004 (Network Anomaly)', 'SUCCESS', 'Mengubah bobot rule dari 18 ke 21 poin'),
('AUDIT-8907', '11:25:10 WITA', 'ANALYST002', 'UPDATE_INVESTIGATION_STATUS', 'INV0277', 'SUCCESS', 'Status diubah menjadi UNDER REVIEW; ditugaskan ke verifikator farmasi'),
('AUDIT-8906', '11:10:45 WITA', 'ANALYST001', 'SEARCH_ENTITY', 'P00182', 'SUCCESS', 'Kueri terminal: search peserta P00182'),
('AUDIT-8905', '10:55:00 WITA', 'AUDITOR003', 'EXPORT_AUDIT_LOG', 'AUDIT_TRAIL_DAILY', 'SUCCESS', 'Ekspor log kepatuhan investigasi kuartal 4'),
('AUDIT-8904', '10:30:19 WITA', 'ADMIN001', 'VERIFY_SYSTEM_HEALTH', 'ML_ENGINE_CLUSTER_02', 'SUCCESS', 'Pengecekan model Random Forest anomali resep batch 48h');
