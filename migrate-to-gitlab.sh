#!/bin/bash

# GitHub to GitLab Migration Script
# This script migrates a repository from GitHub to GitLab

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_info "Checking prerequisites..."
if ! command_exists git; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi
print_success "Git is installed"

# Get user input
echo ""
print_info "GitHub to GitLab Migration Script"
echo "======================================"
echo ""

read -p "Enter GitHub repository URL (e.g., https://github.com/username/repo.git): " GITHUB_URL
read -p "Enter GitLab repository URL (e.g., https://gitlab.com/username/repo.git): " GITLAB_URL
read -p "Enter local directory name for temporary clone [temp_migration]: " LOCAL_DIR
LOCAL_DIR=${LOCAL_DIR:-temp_migration}

# Validate URLs
if [[ -z "$GITHUB_URL" ]]; then
    print_error "GitHub URL cannot be empty"
    exit 1
fi

if [[ -z "$GITLAB_URL" ]]; then
    print_error "GitLab URL cannot be empty"
    exit 1
fi

echo ""
print_info "Migration Configuration:"
echo "  GitHub URL: $GITHUB_URL"
echo "  GitLab URL: $GITLAB_URL"
echo "  Local Directory: $LOCAL_DIR"
echo ""

read -p "Proceed with migration? (y/n): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    print_warning "Migration cancelled by user"
    exit 0
fi

# Step 1: Clone from GitHub
print_info "Step 1: Cloning repository from GitHub..."
if [ -d "$LOCAL_DIR" ]; then
    print_warning "Directory $LOCAL_DIR already exists. Removing..."
    rm -rf "$LOCAL_DIR"
fi

git clone --mirror "$GITHUB_URL" "$LOCAL_DIR"
print_success "Repository cloned from GitHub"

# Step 2: Navigate to the cloned repository
cd "$LOCAL_DIR"
print_info "Changed directory to $LOCAL_DIR"

# Step 3: Add GitLab as a remote
print_info "Step 2: Adding GitLab as remote..."
git remote add gitlab "$GITLAB_URL"
print_success "GitLab remote added"

# Step 4: Push to GitLab
print_info "Step 3: Pushing all branches and tags to GitLab..."
git push --mirror gitlab
print_success "All branches and tags pushed to GitLab"

# Step 5: Cleanup
cd ..
print_info "Step 4: Cleaning up temporary files..."
rm -rf "$LOCAL_DIR"
print_success "Temporary files cleaned up"

echo ""
print_success "=========================================="
print_success "Migration completed successfully!"
print_success "=========================================="
echo ""
print_info "Next steps:"
echo "  1. Verify the repository on GitLab"
echo "  2. Update CI/CD configuration (.gitlab-ci.yml)"
echo "  3. Configure GitLab project settings (secrets, variables, etc.)"
echo "  4. Update local repository remotes if needed:"
echo "     git remote set-url origin $GITLAB_URL"
echo ""
