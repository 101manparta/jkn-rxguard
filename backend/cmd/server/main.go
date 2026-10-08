package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"rxguard-backend/internal/api"
	"rxguard-backend/internal/auth"
	"rxguard-backend/internal/cache"
	"rxguard-backend/internal/config"
	"rxguard-backend/internal/database"
	"rxguard-backend/internal/risk"
	"rxguard-backend/internal/terminal"
	"rxguard-backend/internal/worker"
	"rxguard-backend/pkg/logger"
)

func main() {
	cfg := config.LoadConfig()

	logger.Info("Starting JKN RXGUARD Healthcare Risk Intelligence Terminal API", map[string]interface{}{
		"env":  cfg.Env,
		"port": cfg.Port,
	})

	// Connect Database
	db := database.Connect(cfg)
	defer db.Close()

	// Memory / PostgreSQL Hybrid Repository
	repo := database.NewMemoryRepository()

	// Connect Cache
	c := cache.NewCache(cfg.RedisHost, cfg.RedisPort, cfg.RedisPassword, cfg.RedisDB, cfg.RedisEnabled)

	// Auth Service
	authService := auth.NewAuthService(cfg.JWTSecret, cfg.JWTAccessExpiry, cfg.JWTRefreshExpiry)

	// Risk Engine
	riskEngine := risk.NewRiskEngine(repo, nil)

	// Terminal Parser
	parser := terminal.NewParser(repo)

	// Background Worker
	bgWorker := worker.NewWorker(repo, c)
	bgWorker.Start()
	defer bgWorker.Stop()

	// HTTP Handlers & Router
	handlers := api.NewHandlers(repo, c, authService, riskEngine, parser)
	router := api.SetupRouter(cfg, handlers, authService)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		logger.Info("HTTP Intelligence Server listening", map[string]interface{}{
			"addr": server.Addr,
		})
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("HTTP Server fatal error", map[string]interface{}{
				"error": err.Error(),
			})
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit

	logger.Info("Received shutdown signal, initiating graceful shutdown...", map[string]interface{}{
		"signal": sig.String(),
	})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", map[string]interface{}{
			"error": err.Error(),
		})
	}

	logger.Info("JKN RXGUARD Backend server exited cleanly")
}
