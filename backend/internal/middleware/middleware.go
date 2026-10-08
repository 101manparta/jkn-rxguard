package middleware

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"rxguard-backend/internal/auth"
	"rxguard-backend/internal/domain"
	"rxguard-backend/pkg/logger"
	"rxguard-backend/pkg/response"
)

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
		}
		c.Set("RequestID", reqID)
		c.Header("X-Request-ID", reqID)
		c.Next()
	}
}

func StructuredLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery
		if raw != "" {
			path = path + "?" + raw
		}

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		reqID, _ := c.Get("RequestID")

		fields := map[string]interface{}{
			"status":     statusCode,
			"method":     c.Request.Method,
			"path":       path,
			"ip":         c.ClientIP(),
			"latency_ms": float64(latency.Nanoseconds()) / 1e6,
			"request_id": reqID,
		}

		if statusCode >= 500 {
			logger.Error("HTTP Server Error", fields)
		} else if statusCode >= 400 {
			logger.Warn("HTTP Client Warning", fields)
		} else {
			logger.Info("HTTP Request Completed", fields)
		}
	}
}

func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				reqID, _ := c.Get("RequestID")
				logger.Error("Panic Recovered", map[string]interface{}{
					"error":      err,
					"request_id": reqID,
				})
				response.InternalServerError(c, "INTERNAL_SERVER_ERROR", "Terjadi kesalahan internal pada server intelijen")
				c.Abort()
			}
		}()
		c.Next()
	}
}

func CORS(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allow := false
		if len(allowedOrigins) == 0 {
			allow = true
		} else {
			for _, o := range allowedOrigins {
				if o == "*" || o == origin || strings.HasSuffix(origin, ".run.app") || strings.Contains(origin, "localhost") || strings.Contains(origin, "127.0.0.1") {
					allow = true
					break
				}
			}
		}

		if allow {
			if origin != "" {
				c.Header("Access-Control-Allow-Origin", origin)
			} else {
				c.Header("Access-Control-Allow-Origin", "*")
			}
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Request-ID")
			c.Header("Access-Control-Expose-Headers", "Content-Length, X-Request-ID")
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

type ipRateLimiter struct {
	mu      sync.Mutex
	limits  map[string][]time.Time
	maxReqs int
	window  time.Duration
}

func newIPRateLimiter(maxReqs int, window time.Duration) *ipRateLimiter {
	limiter := &ipRateLimiter{
		limits:  make(map[string][]time.Time),
		maxReqs: maxReqs,
		window:  window,
	}
	go func() {
		ticker := time.NewTicker(2 * time.Minute)
		for range ticker.C {
			limiter.mu.Lock()
			now := time.Now()
			for ip, times := range limiter.limits {
				var valid []time.Time
				for _, t := range times {
					if now.Sub(t) < limiter.window {
						valid = append(valid, t)
					}
				}
				if len(valid) == 0 {
					delete(limiter.limits, ip)
				} else {
					limiter.limits[ip] = valid
				}
			}
			limiter.mu.Unlock()
		}
	}()
	return limiter
}

func (l *ipRateLimiter) allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	times := l.limits[ip]

	var valid []time.Time
	for _, t := range times {
		if now.Sub(t) < l.window {
			valid = append(valid, t)
		}
	}

	if len(valid) >= l.maxReqs {
		l.limits[ip] = valid
		return false
	}

	valid = append(valid, now)
	l.limits[ip] = valid
	return true
}

func RateLimiter(enabled bool, maxReqsPerMin int) gin.HandlerFunc {
	if !enabled {
		return func(c *gin.Context) { c.Next() }
	}
	limiter := newIPRateLimiter(maxReqsPerMin, 1*time.Minute)
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !limiter.allow(ip) {
			response.Error(c, http.StatusTooManyRequests, "RATE_LIMIT_EXCEEDED", "Ambang batas laju permintaan terlampaui. Silakan coba kembali nanti.")
			c.Abort()
			return
		}
		c.Next()
	}
}

func Auth(authService *auth.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "UNAUTHORIZED", "Header Authorization diperlukan")
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Unauthorized(c, "INVALID_TOKEN_FORMAT", "Format Authorization harus 'Bearer <token>'")
			c.Abort()
			return
		}

		tokenStr := parts[1]
		claims, err := authService.ValidateAccessToken(tokenStr)
		if err != nil {
			response.Unauthorized(c, "INVALID_TOKEN", "Token akses tidak valid atau telah kedaluwarsa")
			c.Abort()
			return
		}

		c.Set("UserID", claims.UserID)
		c.Set("Username", claims.Username)
		c.Set("UserRole", claims.Role)
		c.Next()
	}
}

func RequireRole(allowedRoles ...domain.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("UserRole")
		if !exists {
			response.Forbidden(c, "FORBIDDEN", "Hak akses peran tidak ditemukan pada sesi")
			c.Abort()
			return
		}

		userRole, ok := roleVal.(domain.UserRole)
		if !ok {
			response.Forbidden(c, "FORBIDDEN", "Tipe peran tidak valid")
			c.Abort()
			return
		}

		hasRole := false
		for _, r := range allowedRoles {
			if userRole == r {
				hasRole = true
				break
			}
		}

		if !hasRole {
			response.Forbidden(c, "FORBIDDEN", "Akses ditolak: Anda tidak memiliki wewenang untuk sumber daya ini")
			c.Abort()
			return
		}

		c.Next()
	}
}
