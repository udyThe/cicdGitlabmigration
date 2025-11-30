# GitHub to GitLab Migration Project

This project demonstrates how to migrate a repository from GitHub to GitLab, including CI/CD pipeline setup for both platforms.

## 📁 Project Structure

```
cicdGitlabmigration/
├── app.js                    # Main Express.js application
├── utils.js                  # Utility functions
├── test.js                   # Test suite
├── package.json              # Node.js dependencies and scripts
├── .gitignore               # Git ignore file
├── migrate-to-gitlab.sh     # Migration script
├── sonar-project.properties # SonarQube configuration
├── SONARQUBE_SETUP.md       # SonarQube setup guide
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD pipeline with SonarQube
└── .gitlab-ci.yml           # GitLab CI/CD pipeline with SonarQube
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd cicdGitlabmigration
npm install
```

### 2. Run the Application
```bash
npm start
```

### 3. Run Tests
```bash
npm test
```

## 📤 Step-by-Step: Upload to GitHub

### Prerequisites
- Git installed on your system
- GitHub account created
- GitHub repository created (empty repository recommended)

### Steps to Upload

1. **Initialize Git Repository (if not already initialized)**
   ```bash
   cd /home/uday/Desktop/uday/projects/cicdGitlabmigration
   git init
   ```

2. **Add All Files**
   ```bash
   git add .
   ```

3. **Create Initial Commit**
   ```bash
   git commit -m "Initial commit: Sample Node.js app with CI/CD"
   ```

4. **Add GitHub Remote**
   ```bash
   # Replace with your GitHub repository URL
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   ```

5. **Push to GitHub**
   ```bash
   git branch -M main
   git push -u origin main
   ```

6. **Verify GitHub Actions**
   - Go to your GitHub repository
   - Click on the "Actions" tab
   - You should see the CI pipeline running automatically

## 🔄 Migrate from GitHub to GitLab

### Prerequisites
- GitLab account created
- GitLab repository created (can be empty)
- Access to both GitHub and GitLab repositories

### Migration Steps

#### Option 1: Using the Migration Script (Recommended)

1. **Make the script executable** (if not already)
   ```bash
   chmod +x migrate-to-gitlab.sh
   ```

2. **Run the migration script**
   ```bash
   ./migrate-to-gitlab.sh
   ```

3. **Follow the prompts:**
   - Enter your GitHub repository URL
   - Enter your GitLab repository URL
   - Confirm the migration

4. **The script will automatically:**
   - Clone the repository from GitHub (with all history)
   - Add GitLab as a remote
   - Push all branches and tags to GitLab
   - Clean up temporary files

#### Option 2: Manual Migration

1. **Clone from GitHub with mirror flag**
   ```bash
   git clone --mirror https://github.com/YOUR_USERNAME/YOUR_REPO.git temp_repo
   cd temp_repo
   ```

2. **Add GitLab remote**
   ```bash
   git remote add gitlab https://gitlab.com/YOUR_USERNAME/YOUR_REPO.git
   ```

3. **Push to GitLab**
   ```bash
   git push --mirror gitlab
   ```

4. **Cleanup**
   ```bash
   cd ..
   rm -rf temp_repo
   ```

5. **Update your local repository remote (optional)**
   ```bash
   git remote set-url origin https://gitlab.com/YOUR_USERNAME/YOUR_REPO.git
   ```

## 🔧 CI/CD Pipeline Explanation

### ⚡ NEW: SonarQube Quality Gate Integration

Both pipelines now include **SonarQube code quality checks** that must pass before code can be merged to the main branch.

**Key Features:**
- 🛡️ **Automatic quality enforcement**: Code that doesn't meet quality standards is blocked from merging
- 📊 **Comprehensive analysis**: Checks for bugs, vulnerabilities, code smells, and security issues
- 🚦 **Quality gates**: Configurable thresholds for coverage, duplications, and maintainability
- 📈 **Continuous improvement**: Track code quality trends over time

**Pipeline Flow with SonarQube:**
```
Code Push/PR
    ↓
SonarQube Analysis (FIRST)
    ↓
Quality Gate Check
    ├─ PASS ✅ → Continue pipeline → Can merge
    └─ FAIL ❌ → Stop pipeline → Cannot merge (fix issues first)
```

📖 **For detailed SonarQube setup instructions, see [SONARQUBE_SETUP.md](SONARQUBE_SETUP.md)**

### GitHub Actions Pipeline (`.github/workflows/ci.yml`)

The GitHub Actions pipeline now includes SonarQube as the first quality gate:

#### 0. **SonarQube Quality Gate Job** (NEW - RUNS FIRST)
```yaml
sonarqube-analysis:
  steps:
    - name: SonarQube Scan
    - name: Quality Gate Check
```

**What it does:**
- **Triggers**: Runs on every push and pull request
- **Priority**: Executes BEFORE all other jobs
- **Analysis**: Scans code for:
  - 🐛 Bugs and code errors
  - 🔒 Security vulnerabilities
  - 💩 Code smells (maintainability issues)
  - 📊 Code coverage
  - 📋 Code duplications
- **Quality Gate**: Checks if code meets quality standards
- **Blocking**: If quality gate fails, entire pipeline stops ❌
- **Required Secrets**:
  - `SONAR_TOKEN`: Your SonarQube/SonarCloud token
  - `SONAR_HOST_URL`: SonarQube server URL

#### 1. **Build and Test Job**
```yaml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    needs: sonarqube-analysis  # Only runs if SonarQube passes ✅
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
```

**What it does:**
- **Dependency**: NOW runs only after SonarQube quality gate passes
- **Triggers**: Runs on push/pull requests to `main` or `develop` branches
- **Matrix Strategy**: Tests across multiple Node.js versions (16, 18, 20) to ensure compatibility
- **Steps:**
  1. **Checkout code**: Downloads the repository code
  2. **Setup Node.js**: Installs the specified Node.js version
  3. **Install dependencies**: Runs `npm ci` (clean install)
  4. **Run linter**: Executes code quality checks
  5. **Run tests**: Executes the test suite
  6. **Build application**: Starts the app to verify it runs
  7. **Upload artifacts**: Saves test results and logs

#### 2. **Security Scan Job**
```yaml
security-scan:
    needs: build-and-test
```

**What it does:**
- **Dependency**: Runs after build-and-test completes successfully
- **Purpose**: Scans for security vulnerabilities in dependencies
- **Command**: `npm audit --audit-level=moderate`
- **Outcome**: Warns about security issues but doesn't fail the build

#### 3. **Deploy Job**
```yaml
deploy:
    needs: [sonarqube-analysis, build-and-test, security-scan]  # Updated dependencies
    if: github.ref == 'refs/heads/main'
```

**What it does:**
- **Triggers**: Only runs on the `main` branch
- **Dependencies**: NOW requires SonarQube, build-and-test, AND security-scan to pass
- **Purpose**: Deploys to staging environment
- **Note**: This is a demo deployment (would integrate with actual deployment services)

**Pipeline Flow:**
```
Push to GitHub
    ↓
🔍 SonarQube Quality Gate (BLOCKING) ← NEW!
    ├─ FAIL ❌ → Pipeline stops, cannot merge
    └─ PASS ✅ → Continue below
         ↓
Checkout Code
    ↓
Build & Test (Node 16, 18, 20 in parallel)
    ↓
Security Scan
    ↓
Deploy (only on main branch)
```

### GitLab CI/CD Pipeline (`.gitlab-ci.yml`)

The GitLab pipeline now includes SonarQube as the first stage:

#### **Stages Overview:**
```yaml
stages:
  - sonarqube    # NEW - Quality gate (RUNS FIRST)
  - build
  - test
  - security
  - deploy
```

#### 0. **SonarQube Stage** (NEW - FIRST STAGE)
```yaml
sonarqube-check:
  stage: sonarqube
  image: sonarsource/sonar-scanner-cli:latest
  script:
    - sonar-scanner -Dsonar.qualitygate.wait=true
  allow_failure: false  # Blocks pipeline if fails
```

**What it does:**
- **Priority**: FIRST stage - runs before anything else
- **Blocking**: `allow_failure: false` means pipeline stops if quality gate fails
- **Wait for result**: `-Dsonar.qualitygate.wait=true` makes it wait for analysis
- **Analysis**: Comprehensive code quality check
- **Triggers**: Runs on main, develop, and merge requests
- **Required Variables** (set in GitLab CI/CD settings):
  - `SONAR_TOKEN`: Your SonarQube token (masked)
  - `SONAR_HOST_URL`: Your SonarQube server URL

#### 1. **Build Stage**
```yaml
build:
  stage: build
  image: node:18
  needs: ["sonarqube-check"]  # Only runs if SonarQube passes ✅
```

**What it does:**
- **Runner**: Uses Docker with Node.js 18 image
- **Dependency**: NOW requires SonarQube check to pass first
- **Cache**: Stores `node_modules` to speed up subsequent builds
- **Actions**: Installs dependencies with `npm ci`
- **Artifacts**: Saves `node_modules` for 1 hour for next stages
- **Triggers**: Runs on main, develop, and merge requests

#### 2. **Test Stage**
```yaml
.test_template: &test_template
  stage: test
```

**What it does:**
- **Parallel Jobs**: Creates 3 separate jobs (Node 16, 18, 20)
- **Template Pattern**: Uses YAML anchors to avoid code duplication
- **Actions**:
  1. Install dependencies
  2. Run linter (`npm run lint`)
  3. Run tests (`npm test`)
- **Artifacts**: Saves test results and coverage reports for 1 week

#### 3. **Security Stage**
Two jobs run in parallel:

**a) Security Audit:**
```yaml
security:audit:
  allow_failure: true
```
- Runs `npm audit` to check for known vulnerabilities
- Allowed to fail without blocking the pipeline

**b) Dependency Scan:**
- Checks for outdated dependencies
- Provides visibility into package updates

#### 4. **Deploy Stage**
Two deployment jobs:

**a) Deploy to Staging:**
```yaml
deploy:staging:
  environment:
    name: staging
  when: manual
```
- **Trigger**: Manual deployment from `develop` branch
- **Environment**: Creates staging environment tracking in GitLab

**b) Deploy to Production:**
```yaml
deploy:production:
  environment:
    name: production
  only:
    - main
  when: manual
  needs:
    - test:node-18
    - security:audit
```
- **Trigger**: Manual deployment from `main` branch only
- **Dependencies**: Requires Node 18 tests and security audit to pass
- **Environment**: Production environment tracking

**Pipeline Flow:**
```
Push to GitLab
    ↓
🔍 SonarQube Quality Gate Stage (BLOCKING) ← NEW!
    ├─ FAIL ❌ → Pipeline stops, cannot merge
    └─ PASS ✅ → Continue below
         ↓
Build Stage
    ↓
Test Stage (Node 16, 18, 20 in parallel)
    ↓
Security Stage (Audit + Dependency Scan in parallel)
    ↓
Deploy Stage (Manual trigger for Staging/Production)
```

### Key Differences: GitHub Actions vs GitLab CI/CD

| Feature | GitHub Actions | GitLab CI/CD |
|---------|---------------|--------------|
| **Configuration** | `.github/workflows/ci.yml` | `.gitlab-ci.yml` |
| **SonarQube Integration** | Separate job with `needs` dependency | First stage, all others depend on it |
| **Quality Gate Blocking** | Job dependency chain | Stage dependency + `allow_failure: false` |
| **Execution** | GitHub-hosted runners | GitLab runners (shared or self-hosted) |
| **Stages** | Jobs run independently | Organized into explicit stages |
| **Caching** | Uses `actions/cache` | Built-in cache with paths |
| **Artifacts** | Uses `actions/upload-artifact` | Built-in artifacts with expiry |
| **Environments** | Configured in YAML | Rich environment tracking in UI |
| **Manual Jobs** | Using workflow_dispatch | `when: manual` keyword |
| **Docker** | Uses container images | Native Docker support with `image:` |

### Additional Features

#### **Scheduled Jobs** (GitLab)
```yaml
scheduled:maintenance:
  only:
    - schedules
```
- Can be configured in GitLab UI to run daily/weekly
- Useful for maintenance tasks like dependency updates

#### **Environment Tracking**
Both platforms provide:
- Deployment history
- Environment-specific URLs
- Rollback capabilities
- Deployment approvals

## 🔐 Post-Migration Tasks

After migrating to GitLab, you should:

1. **Configure CI/CD Variables**
   - Go to Settings → CI/CD → Variables
   - Add sensitive data (API keys, tokens, etc.)
   - **Required for SonarQube**:
     - `SONAR_TOKEN` (masked)
     - `SONAR_HOST_URL`

2. **Set up SonarQube** (CRITICAL for pipeline to work)
   - Follow the detailed guide in [SONARQUBE_SETUP.md](SONARQUBE_SETUP.md)
   - Create SonarCloud account or set up self-hosted SonarQube
   - Generate token and add to GitHub Secrets / GitLab Variables
   - Update `sonar-project.properties` with your project key

2. **Set up SonarQube** (CRITICAL for pipeline to work)
   - Follow the detailed guide in [SONARQUBE_SETUP.md](SONARQUBE_SETUP.md)
   - Create SonarCloud account or set up self-hosted SonarQube
   - Generate token and add to GitHub Secrets / GitLab Variables
   - Update `sonar-project.properties` with your project key

3. **Set up GitLab Runners**
   - Use shared runners (already configured)
   - Or set up specific runners for your project

4. **Configure Branch Protection**
   - Settings → Repository → Protected Branches
   - Protect `main` and `develop` branches
   - **Enable**: "Require successful pipelines" to enforce SonarQube quality gate

5. **Update Repository Settings**
   - Configure merge request approvals
   - Set up issue templates
   - Configure webhooks if needed

6. **Update Documentation**
   - Update README badges (CI status, coverage, etc.)
   - Update links from GitHub to GitLab

## 📊 Testing the CI/CD Pipeline

### On GitHub:
1. Push a change to the repository
2. Go to the "Actions" tab
3. **Watch SonarQube job run first** ⭐
4. If quality gate passes, other jobs continue
5. Check test results and artifacts

### On GitLab:
1. Push a change to the repository
2. Go to CI/CD → Pipelines
3. Click on the running pipeline
4. **Watch SonarQube stage complete first** ⭐
5. If quality gate passes, next stages run
6. View job logs and artifacts
7. Manually trigger deployment jobs

### Testing Quality Gate (Important!)

**Test that merge is blocked on quality issues:**
1. Create a branch with intentional code issues
2. Push and create PR/MR
3. SonarQube should fail
4. Pipeline should stop
5. Merge should be blocked ❌

**Example bad code to test:**
```javascript
// Add to utils.js
function testBadCode() {
  eval("console.log('test')"); // Security issue
  var x = 1; var x = 2; // Duplicate declaration
  if (true) { return x; } // Always true
}
```

## 🛠️ Troubleshooting

### Common Issues:

1. **SonarQube job fails with "SONAR_TOKEN not set"**
   - Add `SONAR_TOKEN` and `SONAR_HOST_URL` in repository secrets/variables
   - See [SONARQUBE_SETUP.md](SONARQUBE_SETUP.md) for details

2. **Quality Gate fails**
   - View SonarQube report to see issues
   - Fix bugs, vulnerabilities, or code smells
   - Commit and push again
   - Cannot merge until quality gate passes

3. **Pipeline fails on dependencies**
   - Clear cache: In GitLab, go to CI/CD → Pipelines → Clear Runner Caches
   - Delete `node_modules` and run `npm install` locally

4. **Tests fail**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

5. **Migration script fails**
   - Ensure you have access to both repositories
   - Check if GitLab repository is empty
   - Verify Git credentials are configured

6. **GitLab runner not available**
   - Ensure shared runners are enabled in Settings → CI/CD → Runners

7. **SonarQube connection timeout**
   - Check if SonarQube server is running
   - Verify `SONAR_HOST_URL` is correct
   - Check network connectivity

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Repository Migration Guide](https://docs.gitlab.com/ee/user/project/import/github.html)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- **[SonarQube Setup Guide](SONARQUBE_SETUP.md)** ⭐ (Detailed setup instructions)

## 📝 License

MIT

## 👤 Author

Demo Project for GitHub to GitLab Migration
