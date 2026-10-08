-- RXGUARD Database Migration: 000001_init_schema.up.sql
-- Production Normalized Relational Schema for Healthcare Risk Intelligence

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL REFERENCES roles(name),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    failed_login_count INT DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE,
    access_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
    id VARCHAR(32) PRIMARY KEY, -- Pseudonymized e.g. P00182
    risk_score INT NOT NULL DEFAULT 0,
    risk_level VARCHAR(32) NOT NULL DEFAULT 'RENDAH',
    facilities_count INT DEFAULT 0,
    medication_events INT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'Aktif',
    last_activity VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(32) PRIMARY KEY, -- Pseudonymized e.g. FKTP0182
    name VARCHAR(128) NOT NULL,
    type VARCHAR(64) NOT NULL,
    region VARCHAR(64) NOT NULL,
    transaction_count INT DEFAULT 0,
    risk_events INT DEFAULT 0,
    risk_score INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'Normal',
    last_inspection VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medications (
    id VARCHAR(32) PRIMARY KEY, -- Pseudonymized e.g. MEDX
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    transaction_count INT DEFAULT 0,
    facility_count INT DEFAULT 0,
    risk_events INT DEFAULT 0,
    risk_score INT DEFAULT 0,
    refill_cycle_days INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(32) PRIMARY KEY, -- e.g. RX18291
    participant_id VARCHAR(32) NOT NULL REFERENCES participants(id),
    facility_id VARCHAR(32) NOT NULL REFERENCES facilities(id),
    medication_id VARCHAR(32) NOT NULL REFERENCES medications(id),
    prescribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) DEFAULT 'VALID',
    quantity INT DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(32) PRIMARY KEY, -- e.g. TX-9841
    prescription_id VARCHAR(32) REFERENCES prescriptions(id),
    timestamp VARCHAR(32) NOT NULL,
    participant_id VARCHAR(32) NOT NULL REFERENCES participants(id),
    facility_id VARCHAR(32) NOT NULL REFERENCES facilities(id),
    medication_id VARCHAR(32) NOT NULL REFERENCES medications(id),
    risk_signal VARCHAR(64) NOT NULL,
    risk_severity VARCHAR(16) NOT NULL,
    amount BIGINT NOT NULL DEFAULT 0,
    quantity INT NOT NULL DEFAULT 1,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_rules (
    id VARCHAR(32) PRIMARY KEY, -- e.g. RULE_001
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    weight INT NOT NULL DEFAULT 10,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    last_updated VARCHAR(64),
    updated_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_signals (
    id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(32) NOT NULL,
    rule_code VARCHAR(64) NOT NULL REFERENCES risk_rules(code),
    weight INT NOT NULL,
    signal_type VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(32) PRIMARY KEY, -- e.g. ALERT0281
    investigation_id VARCHAR(32),
    timestamp VARCHAR(32) NOT NULL,
    entity_id VARCHAR(32) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    risk_type VARCHAR(128) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    risk_score INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    summary TEXT NOT NULL,
    facility_id VARCHAR(32) NOT NULL,
    medication_id VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investigations (
    id VARCHAR(32) PRIMARY KEY, -- e.g. INV0281
    alert_id VARCHAR(32) REFERENCES alerts(id),
    target_participant_id VARCHAR(32) NOT NULL REFERENCES participants(id),
    risk_score INT NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'UNDER REVIEW',
    assigned_to VARCHAR(64) NOT NULL,
    opened_at VARCHAR(64) NOT NULL,
    resolution_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investigation_actions (
    id VARCHAR(64) PRIMARY KEY,
    investigation_id VARCHAR(32) NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    action VARCHAR(32) NOT NULL,
    author VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY, -- e.g. AUDIT-8910
    timestamp VARCHAR(32) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    resource VARCHAR(128) NOT NULL,
    result VARCHAR(16) NOT NULL,
    details TEXT,
    ip_hash VARCHAR(64),
    request_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for frequent intelligence queries
CREATE INDEX IF NOT EXISTS idx_participants_risk ON participants(risk_score, risk_level);
CREATE INDEX IF NOT EXISTS idx_transactions_participant ON transactions(participant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_facility ON transactions(facility_id);
CREATE INDEX IF NOT EXISTS idx_transactions_medication ON transactions(medication_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_alerts_entity ON alerts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
