package api

import (
	"github.com/gin-gonic/gin"

	"rxguard-backend/internal/auth"
	"rxguard-backend/internal/config"
	"rxguard-backend/internal/domain"
	"rxguard-backend/internal/middleware"
)

func SetupRouter(cfg *config.Config, h *Handlers, authService *auth.AuthService) *gin.Engine {
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Global Middlewares
	r.Use(middleware.RequestID())
	r.Use(middleware.StructuredLogger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS(cfg.AllowedOrigins))
	r.Use(middleware.RateLimiter(cfg.RateLimitEnabled, cfg.RateLimitPerMin))

	// Unauthenticated Health Checks
	r.GET("/health", h.Health)
	r.GET("/ready", h.Ready)
	r.GET("/live", h.Live)

	// API v1 Group
	v1 := r.Group("/api/v1")
	{
		// Authentication Routes (Stricter rate limiting)
		authGroup := v1.Group("/auth")
		authGroup.Use(middleware.RateLimiter(cfg.RateLimitEnabled, cfg.AuthRateLimit))
		{
			authGroup.POST("/login", h.Login)
			authGroup.POST("/refresh", h.Refresh)
			authGroup.POST("/logout", middleware.Auth(authService), h.Logout)
			authGroup.GET("/me", middleware.Auth(authService), h.Me)
		}

		// Authenticated Routes (Requires Valid JWT token)
		authenticated := v1.Group("")
		authenticated.Use(middleware.Auth(authService))
		{
			// Dashboard Overview Aggregation
			authenticated.GET("/overview", h.GetOverview)

			// Participants
			participants := authenticated.Group("/participants")
			{
				participants.GET("", h.ListParticipants)
				participants.GET("/:id", h.GetParticipant)
				participants.GET("/:id/risk", h.GetParticipantRisk)
				participants.GET("/:id/network", h.GetParticipantNetwork)
				participants.GET("/:id/timeline", h.GetParticipantTimeline)
				participants.GET("/:id/alerts", h.GetParticipantRisk) // alias for participant alerts
			}

			// Facilities
			facilities := authenticated.Group("/facilities")
			{
				facilities.GET("", h.ListFacilities)
				facilities.GET("/:id", h.GetFacility)
				facilities.GET("/:id/risk", h.GetFacilityRisk)
				facilities.GET("/:id/network", h.GetNetwork)
				facilities.GET("/:id/alerts", h.GetFacilityRisk)
			}

			// Medications
			medications := authenticated.Group("/medications")
			{
				medications.GET("", h.ListMedications)
				medications.GET("/:id", h.GetMedication)
				medications.GET("/:id/risk", h.GetMedicationRisk)
				medications.GET("/:id/transactions", h.ListTransactions)
				medications.GET("/:id/network", h.GetNetwork)
			}

			// Transactions
			transactions := authenticated.Group("/transactions")
			{
				transactions.GET("", h.ListTransactions)
				transactions.POST("", h.CreateTransaction)
			}

			// Alerts
			alerts := authenticated.Group("/alerts")
			{
				alerts.GET("", h.ListAlerts)
				alerts.GET("/critical", func(c *gin.Context) {
					c.Request.URL.RawQuery = "severity=CRITICAL"
					h.ListAlerts(c)
				})
				alerts.GET("/high", func(c *gin.Context) {
					c.Request.URL.RawQuery = "severity=HIGH"
					h.ListAlerts(c)
				})
				alerts.GET("/:id", h.GetAlert)
				alerts.PATCH("/:id/status", h.UpdateAlertStatus)
			}

			// 3D Network Engine
			network := authenticated.Group("/network")
			{
				network.GET("", h.GetNetwork)
				network.GET("/:entityType/:entityId", h.GetEntityNetwork)
			}

			// Investigations
			investigations := authenticated.Group("/investigations")
			{
				investigations.GET("", h.ListInvestigations)
				investigations.POST("", h.CreateInvestigation)
				investigations.GET("/:id", h.GetInvestigation)
				investigations.PATCH("/:id", h.AddInvestigationAction)
				investigations.POST("/:id/actions", h.AddInvestigationAction)
			}

			// Terminal Query Command
			authenticated.POST("/terminal/query", h.TerminalQuery)

			// Audit Logs (Analyst can view)
			authenticated.GET("/audit", h.ListAuditLogs)

			// Admin Restricted Routes (RBAC: Requires Role ADMIN)
			admin := authenticated.Group("/admin")
			admin.Use(middleware.RequireRole(domain.RoleAdmin))
			{
				admin.GET("/users", h.AdminListUsers)
				admin.POST("/users", h.AdminCreateUser)
				admin.PATCH("/users/:id", h.AdminUpdateUserStatus)
				admin.PATCH("/users/:id/status", h.AdminUpdateUserStatus)
				admin.GET("/risk-rules", h.AdminListRiskRules)
				admin.PATCH("/risk-rules/:id", h.AdminUpdateRiskRule)
				admin.GET("/system-health", h.AdminSystemHealth)
				admin.GET("/audit", h.ListAuditLogs)
			}
		}
	}

	return r
}
