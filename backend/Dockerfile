# Stage 1: Build binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o rxguard-server ./cmd/server

# Stage 2: Minimal Distroless / Alpine Runtime
FROM alpine:3.20

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/rxguard-server /app/rxguard-server
COPY --from=builder /app/migrations /app/migrations
COPY --from=builder /app/.env.example /app/.env.example

ENV PORT=8080
ENV ENV=production
EXPOSE 8080

USER nobody:nobody

ENTRYPOINT ["/app/rxguard-server"]
