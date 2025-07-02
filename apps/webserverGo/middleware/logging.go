package middleware

import (
	"log/slog"
	"net/http"
)

func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        logMessage := r.Method + " " + r.URL.String()
        slog.Info(logMessage)

        next.ServeHTTP(w, r)
    })
}
