#!/bin/bash

# Epicenter Comprehensive Test Runner
# Runs all tests across the monorepo with detailed reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test runner function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_dir="$3"
    
    log_info "Running $test_name..."
    
    if [ -n "$test_dir" ]; then
        cd "$test_dir"
    fi
    
    if eval "$test_command"; then
        log_success "$test_name passed"
        ((PASSED_TESTS++))
    else
        log_error "$test_name failed"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
    
    if [ -n "$test_dir" ]; then
        cd - > /dev/null
    fi
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Rust
    if ! command -v cargo &> /dev/null; then
        log_error "Rust is not installed"
        exit 1
    fi
    
    # Check Anchor
    if ! command -v anchor &> /dev/null; then
        log_warning "Anchor CLI is not installed - Solana tests will be skipped"
    fi
    
    # Check Hardhat
    if ! npx hardhat --version &> /dev/null; then
        log_warning "Hardhat is not installed - Solidity tests will be skipped"
    fi
    
    log_success "Dependencies check completed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Root dependencies
    if [ -f "package.json" ]; then
        npm ci
    fi
    
    # Contracts dependencies
    if [ -d "contracts" ] && [ -f "contracts/package.json" ]; then
        log_info "Installing contract dependencies..."
        cd contracts
        npm ci
        cd ..
    fi
    
    # Backend dependencies
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        log_info "Installing backend dependencies..."
        cd backend
        npm ci
        cd ..
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        log_info "Installing frontend dependencies..."
        cd frontend
        npm ci
        cd ..
    fi
    
    # UI library dependencies
    if [ -d "ui" ] && [ -f "ui/package.json" ]; then
        log_info "Installing UI library dependencies..."
        cd ui
        npm ci
        cd ..
    fi
    
    log_success "Dependencies installed"
}

# Run Solidity contract tests
test_contracts() {
    log_info "Testing Solidity contracts..."
    
    if [ ! -d "contracts" ]; then
        log_warning "Contracts directory not found, skipping Solidity tests"
        return
    fi
    
    cd contracts
    
    # Compile contracts
    log_info "Compiling Solidity contracts..."
    if npx hardhat compile; then
        log_success "Contracts compiled successfully"
    else
        log_error "Contract compilation failed"
        cd ..
        return 1
    fi
    
    # Run tests
    run_test "Solidity Unit Tests" "npx hardhat test" "contracts"
    
    # Run coverage
    run_test "Solidity Coverage" "npx hardhat coverage" "contracts"
    
    # Run linting
    run_test "Solidity Linting" "npx hardhat lint" "contracts"
    
    # Security analysis
    if command -v slither &> /dev/null; then
        run_test "Solidity Security Analysis" "slither ." "contracts"
    else
        log_warning "Slither not installed, skipping security analysis"
    fi
    
    cd ..
}

# Run Solana program tests
test_solana() {
    log_info "Testing Solana programs..."
    
    if [ ! -d "anchor-auction" ]; then
        log_warning "Anchor directory not found, skipping Solana tests"
        return
    fi
    
    if ! command -v anchor &> /dev/null; then
        log_warning "Anchor CLI not installed, skipping Solana tests"
        return
    fi
    
    cd anchor-auction
    
    # Build programs
    log_info "Building Anchor programs..."
    if anchor build; then
        log_success "Programs built successfully"
    else
        log_error "Program build failed"
        cd ..
        return 1
    fi
    
    # Run tests
    run_test "Anchor Tests" "anchor test" "anchor-auction"
    
    cd ..
}

# Run backend tests
test_backend() {
    log_info "Testing backend..."
    
    if [ ! -d "backend" ]; then
        log_warning "Backend directory not found, skipping backend tests"
        return
    fi
    
    cd backend
    
    # Check if database is available
    if [ -n "$DATABASE_URL" ]; then
        log_info "Running database migrations..."
        npx prisma migrate deploy
    else
        log_warning "DATABASE_URL not set, using test database"
        export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/epicenter_test"
    fi
    
    # Run linting
    run_test "Backend Linting" "npm run lint" "backend"
    
    # Run type checking
    run_test "Backend Type Checking" "npm run type-check" "backend"
    
    # Run unit tests
    run_test "Backend Unit Tests" "npm test" "backend"
    
    # Run integration tests
    if [ -f "package.json" ] && grep -q "test:integration" package.json; then
        run_test "Backend Integration Tests" "npm run test:integration" "backend"
    fi
    
    # Run coverage
    run_test "Backend Coverage" "npm run test:coverage" "backend"
    
    # Build backend
    run_test "Backend Build" "npm run build" "backend"
    
    cd ..
}

# Run frontend tests
test_frontend() {
    log_info "Testing frontend..."
    
    if [ ! -d "frontend" ]; then
        log_warning "Frontend directory not found, skipping frontend tests"
        return
    fi
    
    cd frontend
    
    # Run linting
    run_test "Frontend Linting" "npm run lint" "frontend"
    
    # Run type checking
    run_test "Frontend Type Checking" "npm run type-check" "frontend"
    
    # Run unit tests
    run_test "Frontend Unit Tests" "npm test" "frontend"
    
    # Run coverage
    run_test "Frontend Coverage" "npm run test:coverage" "frontend"
    
    # Build frontend
    run_test "Frontend Build" "npm run build" "frontend"
    
    cd ..
}

# Run UI library tests
test_ui() {
    log_info "Testing UI library..."
    
    if [ ! -d "ui" ]; then
        log_warning "UI directory not found, skipping UI tests"
        return
    fi
    
    cd ui
    
    # Run linting
    run_test "UI Linting" "npm run lint" "ui"
    
    # Run type checking
    run_test "UI Type Checking" "npm run type-check" "ui"
    
    # Run unit tests
    run_test "UI Unit Tests" "npm test" "ui"
    
    # Build UI library
    run_test "UI Build" "npm run build" "ui"
    
    # Build Storybook
    run_test "UI Storybook Build" "npm run build-storybook" "ui"
    
    cd ..
}

# Run security tests
test_security() {
    log_info "Running security tests..."
    
    # npm audit for all packages
    for dir in contracts backend frontend ui; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            log_info "Running security audit for $dir..."
            cd "$dir"
        if npm audit --audit-level moderate; then
                log_success "Security audit passed for $dir"
        else
                log_warning "Security audit found issues in $dir"
        fi
        cd ..
    fi
    done
}

# Run performance tests
test_performance() {
    log_info "Running performance tests..."
    
    # Check if Lighthouse CI is available
    if command -v lhci &> /dev/null; then
        run_test "Lighthouse CI" "lhci autorun"
    else
        log_warning "Lighthouse CI not installed, skipping performance tests"
    fi
}

# Run integration tests
test_integration() {
    log_info "Running integration tests..."
    
    # Start backend server for integration tests
    if [ -d "backend" ]; then
        log_info "Starting backend server for integration tests..."
        cd backend
        npm run build
        npm start &
        BACKEND_PID=$!
        cd ..
        
        # Wait for backend to start
        sleep 10
        
        # Run integration tests
        if [ -f "backend/package.json" ] && grep -q "test:integration" backend/package.json; then
            cd backend
            run_test "Integration Tests" "npm run test:integration" "backend"
            cd ..
        fi
        
        # Stop backend server
        kill $BACKEND_PID 2>/dev/null || true
    fi
}

# Generate test report
generate_report() {
    log_info "Generating test report..."
    
        echo ""
    echo "=========================================="
    echo "           EPICENTER TEST REPORT"
    echo "=========================================="
        echo ""
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo "Skipped: $SKIPPED_TESTS"
        echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "All tests passed! 🎉"
        exit 0
    else
        log_error "$FAILED_TESTS tests failed"
        exit 1
    fi
}

# Main execution
main() {
    echo "=========================================="
    echo "      EPICENTER COMPREHENSIVE TEST RUNNER"
    echo "=========================================="
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Run all test suites
    test_contracts
    test_solana
    test_backend
    test_frontend
    test_ui
    test_security
    test_performance
    test_integration
    
    # Generate final report
    generate_report
}

# Handle script interruption
trap 'log_error "Test run interrupted"; exit 1' INT TERM

# Run main function
main "$@" 