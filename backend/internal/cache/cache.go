package cache

import (
	"context"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
	"rxguard-backend/pkg/logger"
)

type Cache interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value string, ttl time.Duration) error
	Delete(ctx context.Context, key string) error
	Ping(ctx context.Context) error
	IsAvailable() bool
}

type memoryItem struct {
	value     string
	expiresAt time.Time
}

type memoryCache struct {
	mu    sync.RWMutex
	items map[string]memoryItem
}

func newMemoryCache() *memoryCache {
	m := &memoryCache{
		items: make(map[string]memoryItem),
	}
	// Background cleanup of expired keys
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		for range ticker.C {
			m.mu.Lock()
			now := time.Now()
			for k, v := range m.items {
				if !v.expiresAt.IsZero() && now.After(v.expiresAt) {
					delete(m.items, k)
				}
			}
			m.mu.Unlock()
		}
	}()
	return m
}

func (m *memoryCache) Get(ctx context.Context, key string) (string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	item, found := m.items[key]
	if !found {
		return "", redis.Nil
	}
	if !item.expiresAt.IsZero() && time.Now().After(item.expiresAt) {
		return "", redis.Nil
	}
	return item.value, nil
}

func (m *memoryCache) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	var exp time.Time
	if ttl > 0 {
		exp = time.Now().Add(ttl)
	}
	m.items[key] = memoryItem{value: value, expiresAt: exp}
	return nil
}

func (m *memoryCache) Delete(ctx context.Context, key string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.items, key)
	return nil
}

func (m *memoryCache) Ping(ctx context.Context) error {
	return nil
}

func (m *memoryCache) IsAvailable() bool {
	return true
}

type HybridCache struct {
	client     *redis.Client
	memFallback *memoryCache
	isRedisUp  bool
}

func NewCache(redisHost, redisPort, redisPassword string, db int, enabled bool) Cache {
	mem := newMemoryCache()
	if !enabled || redisHost == "" {
		logger.Info("Redis disabled in config, using in-memory cache layer")
		return mem
	}

	addr := redisHost + ":" + redisPort
	rdb := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     redisPassword,
		DB:           db,
		DialTimeout:  1 * time.Second,
		ReadTimeout:  1 * time.Second,
		WriteTimeout: 1 * time.Second,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		logger.Warn("Redis ping failed, gracefully degrading to memory cache", map[string]interface{}{
			"error": err.Error(),
			"addr":  addr,
		})
		return &HybridCache{
			client:      rdb,
			memFallback: mem,
			isRedisUp:   false,
		}
	}

	logger.Info("Connected to Redis cache successfully", map[string]interface{}{"addr": addr})
	return &HybridCache{
		client:      rdb,
		memFallback: mem,
		isRedisUp:   true,
	}
}

func (h *HybridCache) Get(ctx context.Context, key string) (string, error) {
	if h.isRedisUp {
		val, err := h.client.Get(ctx, key).Result()
		if err == nil {
			return val, nil
		}
		if err == redis.Nil {
			return "", err
		}
		// Redis error, fallback
		h.isRedisUp = false
	}
	return h.memFallback.Get(ctx, key)
}

func (h *HybridCache) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	if h.isRedisUp {
		if err := h.client.Set(ctx, key, value, ttl).Err(); err != nil {
			h.isRedisUp = false
		} else {
			return nil
		}
	}
	return h.memFallback.Set(ctx, key, value, ttl)
}

func (h *HybridCache) Delete(ctx context.Context, key string) error {
	if h.isRedisUp {
		_ = h.client.Del(ctx, key).Err()
	}
	return h.memFallback.Delete(ctx, key)
}

func (h *HybridCache) Ping(ctx context.Context) error {
	if h.client != nil {
		if err := h.client.Ping(ctx).Err(); err == nil {
			h.isRedisUp = true
			return nil
		}
	}
	return h.memFallback.Ping(ctx)
}

func (h *HybridCache) IsAvailable() bool {
	return true
}
