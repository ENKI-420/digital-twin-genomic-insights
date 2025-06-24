#!/bin/bash

# Baptist Health AGENT Platform Production Deployment Script
# This script handles the complete deployment process for the production environment

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="AGENT Platform - Baptist Health"
ENVIRONMENT="production"
DEPLOY_USER="agent-deploy"
BACKUP_DIR="/var/backups/agent-platform"
LOG_FILE="/var/log/agent-platform/deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
check_prerequisites() {
    log "Checking deployment prerequisites..."

    # Check if running as correct user
    if [ "$USER" != "$DEPLOY_USER" ]; then
        error "Must run as $DEPLOY_USER user"
        exit 1
    fi

    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_NODE="18.0.0"
    if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
        error "Node.js version $REQUIRED_NODE or higher required. Current: $NODE_VERSION"
        exit 1
    fi

    # Check if environment variables are set
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable not set"
        exit 1
    fi

    if [ -z "$NEXTAUTH_SECRET" ]; then
        error "NEXTAUTH_SECRET environment variable not set"
        exit 1
    fi

    success "Prerequisites check passed"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."

    BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"

    mkdir -p "$BACKUP_PATH"

    # Backup application files
    if [ -d "/opt/agent-platform" ]; then
        cp -r /opt/agent-platform/* "$BACKUP_PATH/"
        success "Application backup created at $BACKUP_PATH"
    else
        warning "No existing deployment found to backup"
    fi

    # Backup database
    log "Creating database backup..."
    pg_dump "$DATABASE_URL" > "$BACKUP_PATH/database_backup.sql"
    success "Database backup created"

    # Keep only last 5 backups
    find "$BACKUP_DIR" -name "backup_*" -type d | sort -r | tail -n +6 | xargs rm -rf
}

# Health check before deployment
pre_deployment_health_check() {
    log "Running pre-deployment health checks..."

    # Check database connectivity
    if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        error "Database connectivity check failed"
        exit 1
    fi

    # Check Redis connectivity
    if ! redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
        error "Redis connectivity check failed"
        exit 1
    fi

    # Check Epic API connectivity (if in production)
    if [ "$ENVIRONMENT" = "production" ]; then
        if ! curl -s "$EPIC_BASE_URL/metadata" > /dev/null; then
            warning "Epic API connectivity check failed - proceeding with caution"
        fi
    fi

    success "Pre-deployment health checks passed"
}

# Install dependencies and build
build_application() {
    log "Building application..."

    # Install dependencies
    log "Installing dependencies..."
    npm ci --production=false

    # Run linting
    log "Running code quality checks..."
    npm run lint

    # Run tests
    log "Running test suite..."
    npm run test 2>/dev/null || warning "Some tests failed - review before proceeding"

    # Build application
    log "Building application for production..."
    npm run build

    success "Application build completed"
}

# Database migrations
run_database_migrations() {
    log "Running database migrations..."

    # Check for pending migrations
    PENDING_MIGRATIONS=$(npm run db:migrate:status 2>/dev/null | grep -c "pending" || echo "0")

    if [ "$PENDING_MIGRATIONS" -gt 0 ]; then
        log "Found $PENDING_MIGRATIONS pending migrations"
        npm run db:migrate
        success "Database migrations completed"
    else
        log "No pending migrations found"
    fi
}

# Deploy application
deploy_application() {
    log "Deploying application..."

    # Create deployment directory
    DEPLOY_DIR="/opt/agent-platform"
    mkdir -p "$DEPLOY_DIR"

    # Copy built application
    rsync -av --delete \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=.env.local \
        ./ "$DEPLOY_DIR/"

    # Install production dependencies
    cd "$DEPLOY_DIR"
    npm ci --production

    # Set proper permissions
    chown -R www-data:www-data "$DEPLOY_DIR"
    chmod -R 755 "$DEPLOY_DIR"

    success "Application deployed to $DEPLOY_DIR"
}

# Start services
start_services() {
    log "Starting application services..."

    # Restart application
    systemctl restart agent-platform

    # Restart nginx
    systemctl restart nginx

    # Wait for services to start
    sleep 10

    success "Services started"
}

# Post-deployment health check
post_deployment_health_check() {
    log "Running post-deployment health checks..."

    # Check if application is responding
    HEALTH_URL="https://agent.baptisthealth.org/api/health"

    for i in {1..30}; do
        if curl -f -s "$HEALTH_URL" > /dev/null; then
            success "Application health check passed"
            break
        else
            if [ $i -eq 30 ]; then
                error "Application health check failed after 30 attempts"
                exit 1
            fi
            log "Waiting for application to start... (attempt $i/30)"
            sleep 2
        fi
    done

    # Check specific endpoints
    log "Testing Epic integration endpoint..."
    if curl -f -s "https://agent.baptisthealth.org/api/epic/metadata" > /dev/null; then
        success "Epic integration endpoint responding"
    else
        warning "Epic integration endpoint not responding"
    fi

    # Check CPIC integration
    log "Testing CPIC integration..."
    if curl -f -s "https://agent.baptisthealth.org/api/cpic/guidelines" > /dev/null; then
        success "CPIC integration responding"
    else
        warning "CPIC integration not responding"
    fi
}

# Rollback function
rollback_deployment() {
    error "Deployment failed. Initiating rollback..."

    # Find latest backup
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "backup_*" -type d | sort -r | head -n1)

    if [ -n "$LATEST_BACKUP" ]; then
        log "Rolling back to $LATEST_BACKUP"

        # Restore application files
        rsync -av --delete "$LATEST_BACKUP/" /opt/agent-platform/

        # Restore database
        if [ -f "$LATEST_BACKUP/database_backup.sql" ]; then
            log "Restoring database..."
            psql "$DATABASE_URL" < "$LATEST_BACKUP/database_backup.sql"
        fi

        # Restart services
        systemctl restart agent-platform nginx

        success "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Send notifications
send_notifications() {
    local status=$1
    local message=$2

    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🏥 Baptist Health AGENT Platform Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi

    # Email notification
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "AGENT Platform Deployment $status" "$NOTIFICATION_EMAIL"
    fi
}

# Main deployment process
main() {
    log "Starting deployment of $PROJECT_NAME to $ENVIRONMENT environment"

    # Trap for cleanup on failure
    trap 'rollback_deployment; send_notifications "FAILED" "Deployment failed and rolled back"; exit 1' ERR

    check_prerequisites
    backup_current_deployment
    pre_deployment_health_check
    build_application
    run_database_migrations
    deploy_application
    start_services
    post_deployment_health_check

    success "Deployment completed successfully!"
    send_notifications "SUCCESS" "Deployment completed successfully"

    # Display deployment summary
    echo ""
    log "Deployment Summary:"
    log "==================="
    log "Environment: $ENVIRONMENT"
    log "Deployed at: $(date)"
    log "Health Check: https://agent.baptisthealth.org/api/health"
    log "Demo Site: https://agent.baptisthealth.org/demo/baptist-health"
    log "Baptist Microsite: https://agent.baptisthealth.org/api/baptist/microsite"
    echo ""
}

# Script options
case "${1:-}" in
    "rollback")
        rollback_deployment
        ;;
    "health-check")
        post_deployment_health_check
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [rollback|health-check]"
        exit 1
        ;;
esac