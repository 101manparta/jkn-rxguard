package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
	"rxguard-backend/internal/config"
	"rxguard-backend/pkg/logger"
)

type DB struct {
	SqlDB     *sql.DB
	IsLive    bool
	IsMemory  bool
}

func Connect(cfg *config.Config) *DB {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s connect_timeout=2",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		logger.Warn("Failed to open postgres driver, falling back to memory repository", map[string]interface{}{
			"error": err.Error(),
		})
		return &DB{IsLive: false, IsMemory: true}
	}

	db.SetMaxOpenConns(cfg.DBMaxOpenConns)
	db.SetMaxIdleConns(cfg.DBMaxIdleConns)
	db.SetConnMaxLifetime(cfg.DBConnMaxLifetime)

	if err := db.Ping(); err != nil {
		logger.Warn("PostgreSQL ping failed, continuing in memory repository mode with simulated intelligence data", map[string]interface{}{
			"error": err.Error(),
			"host":  cfg.DBHost,
		})
		return &DB{SqlDB: db, IsLive: false, IsMemory: true}
	}

	logger.Info("Connected to PostgreSQL database successfully", map[string]interface{}{
		"host": cfg.DBHost,
		"db":   cfg.DBName,
	})
	return &DB{SqlDB: db, IsLive: true, IsMemory: false}
}

func (d *DB) Close() error {
	if d.SqlDB != nil {
		return d.SqlDB.Close()
	}
	return nil
}

func (d *DB) Ping() error {
	if d.SqlDB != nil && d.IsLive {
		return d.SqlDB.Ping()
	}
	if d.IsMemory {
		return nil
	}
	return fmt.Errorf("database unavailable")
}
