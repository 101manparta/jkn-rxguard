package worker

import (
	"context"
	"sync"
	"time"

	"rxguard-backend/internal/cache"
	"rxguard-backend/internal/database"
	"rxguard-backend/pkg/logger"
)

type Worker struct {
	repo   database.Repository
	cache  cache.Cache
	stopCh chan struct{}
	wg     sync.WaitGroup
}

func NewWorker(repo database.Repository, cache cache.Cache) *Worker {
	return &Worker{
		repo:   repo,
		cache:  cache,
		stopCh: make(chan struct{}),
	}
}

func (w *Worker) Start() {
	w.wg.Add(1)
	go w.runRiskCacheRefresher()
	logger.Info("Background risk & cache worker initialized successfully")
}

func (w *Worker) Stop() {
	close(w.stopCh)
	w.wg.Wait()
	logger.Info("Background worker stopped gracefully")
}

func (w *Worker) runRiskCacheRefresher() {
	defer w.wg.Done()
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-w.stopCh:
			return
		case <-ticker.C:
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			// Warm cache with overview summary
			if summary, err := w.repo.GetOverviewSummary(ctx); err == nil {
				logger.Debug("Worker refreshed overview telemetry", map[string]interface{}{
					"active_alerts": summary.ActiveAlerts,
					"risk_index":    summary.RiskIndex,
				})
			}
			cancel()
		}
	}
}
