package middleware

import (
	"backend/go_server/services"
	"context"
	"net/http"
	"strings"
)

type contextKey string

const ContextUsernameKey contextKey = "username"

// JWTAuth protects routes and injects username into request context
func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := services.ValidateToken(tokenStr)
		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Add username to context
		ctx := context.WithValue(r.Context(), ContextUsernameKey, claims.Username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
