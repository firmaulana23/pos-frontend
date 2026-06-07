.PHONY: help install dev build start lint typecheck clean

# Default target
help:
	@echo "POS Frontend Makefile Commands:"
	@echo "  make install    Install project dependencies"
	@echo "  make dev        Start development server"
	@echo "  make build      Build production application"
	@echo "  make start      Start production application after build"
	@echo "  make lint       Run ESLint code analysis"
	@echo "  make typecheck  Run TypeScript type checker"
	@echo "  make clean      Remove build artifacts (.next)"

# Install dependencies
install:
	npm install

# Run development server
dev:
	npm run dev

# Build production app
build:
	npm run build

# Start production app
start:
	npm run start

# Lint files
lint:
	npm run lint

# Check TypeScript types
typecheck:
	npx tsc --noEmit

# Clean build directory
clean:
	rm -rf .next tsconfig.tsbuildinfo
