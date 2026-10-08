package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     *APIError   `json:"error,omitempty"`
	RequestID string      `json:"request_id,omitempty"`
}

type APIError struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	RequestID string `json:"request_id,omitempty"`
}

func getRequestID(c *gin.Context) string {
	if reqID, exists := c.Get("RequestID"); exists {
		if s, ok := reqID.(string); ok {
			return s
		}
	}
	return c.GetHeader("X-Request-ID")
}

func Success(c *gin.Context, httpStatus int, data interface{}) {
	c.JSON(httpStatus, APIResponse{
		Success:   true,
		Data:      data,
		RequestID: getRequestID(c),
	})
}

func OK(c *gin.Context, data interface{}) {
	Success(c, http.StatusOK, data)
}

func Created(c *gin.Context, data interface{}) {
	Success(c, http.StatusCreated, data)
}

func Error(c *gin.Context, httpStatus int, code string, message string) {
	reqID := getRequestID(c)
	c.JSON(httpStatus, APIResponse{
		Success: false,
		Error: &APIError{
			Code:      code,
			Message:   message,
			RequestID: reqID,
		},
		RequestID: reqID,
	})
}

func BadRequest(c *gin.Context, code string, message string) {
	Error(c, http.StatusBadRequest, code, message)
}

func Unauthorized(c *gin.Context, code string, message string) {
	Error(c, http.StatusUnauthorized, code, message)
}

func Forbidden(c *gin.Context, code string, message string) {
	Error(c, http.StatusForbidden, code, message)
}

func NotFound(c *gin.Context, code string, message string) {
	Error(c, http.StatusNotFound, code, message)
}

func Conflict(c *gin.Context, code string, message string) {
	Error(c, http.StatusConflict, code, message)
}

func InternalServerError(c *gin.Context, code string, message string) {
	Error(c, http.StatusInternalServerError, code, message)
}

func ServiceUnavailable(c *gin.Context, code string, message string) {
	Error(c, http.StatusServiceUnavailable, code, message)
}
