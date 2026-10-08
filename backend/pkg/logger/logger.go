package logger

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"sync"
	"time"
)

type Level string

const (
	LevelDebug Level = "DEBUG"
	LevelInfo  Level = "INFO"
	LevelWarn  Level = "WARN"
	LevelError Level = "ERROR"
)

type Logger struct {
	mu     sync.Mutex
	output io.Writer
}

type LogEntry struct {
	Timestamp string                 `json:"timestamp"`
	Level     Level                  `json:"level"`
	Message   string                 `json:"message"`
	Fields    map[string]interface{} `json:"fields,omitempty"`
}

var defaultLogger = &Logger{output: os.Stdout}

func SetOutput(w io.Writer) {
	defaultLogger.mu.Lock()
	defer defaultLogger.mu.Unlock()
	defaultLogger.output = w
}

func logMessage(level Level, msg string, fields ...map[string]interface{}) {
	defaultLogger.mu.Lock()
	defer defaultLogger.mu.Unlock()

	merged := make(map[string]interface{})
	for _, f := range fields {
		for k, v := range f {
			merged[k] = v
		}
	}

	entry := LogEntry{
		Timestamp: time.Now().UTC().Format(time.RFC3339Nano),
		Level:     level,
		Message:   msg,
		Fields:    merged,
	}

	data, err := json.Marshal(entry)
	if err == nil {
		fmt.Fprintln(defaultLogger.output, string(data))
	} else {
		fmt.Fprintf(defaultLogger.output, `{"timestamp":"%s","level":"%s","message":"%s"}`+"\n",
			entry.Timestamp, entry.Level, entry.Message)
	}
}

func Info(msg string, fields ...map[string]interface{}) {
	logMessage(LevelInfo, msg, fields...)
}

func Warn(msg string, fields ...map[string]interface{}) {
	logMessage(LevelWarn, msg, fields...)
}

func Error(msg string, fields ...map[string]interface{}) {
	logMessage(LevelError, msg, fields...)
}

func Debug(msg string, fields ...map[string]interface{}) {
	logMessage(LevelDebug, msg, fields...)
}
