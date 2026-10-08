-- RXGUARD Database Migration: 000002_seed_data.down.sql

DELETE FROM audit_logs;
DELETE FROM investigation_actions;
DELETE FROM investigations;
DELETE FROM alerts;
DELETE FROM transactions;
DELETE FROM prescriptions;
DELETE FROM medications;
DELETE FROM facilities;
DELETE FROM participants;
DELETE FROM risk_rules;
DELETE FROM refresh_tokens;
DELETE FROM users;
DELETE FROM roles;
