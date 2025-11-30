# SonarQube Setup Guide

This guide explains how to set up SonarQube quality gate checks for the CI/CD pipelines.

## 🎯 Overview

SonarQube has been integrated into both GitHub Actions and GitLab CI/CD pipelines to ensure code quality before merging to the main branch. The pipeline will **automatically block merges** if the code doesn't pass SonarQube quality gates.

## 📋 Prerequisites

You need either:
- **SonarCloud** (free for public repositories): https://sonarcloud.io
- **Self-hosted SonarQube**: Your own SonarQube server

## 🔧 Setup Instructions

### Option 1: Using SonarCloud (Recommended for Public Repos)

#### Step 1: Create SonarCloud Account

1. Go to [SonarCloud.io](https://sonarcloud.io)
2. Sign up using your GitHub or GitLab account
3. Import your organization

#### Step 2: Create a New Project

1. Click "Analyze new project"
2. Select your repository
3. Choose "With GitHub Actions" or "With GitLab CI"
4. Note down your **Project Key**

#### Step 3: Generate Token

1. Go to Account → Security → Generate Tokens
2. Name it (e.g., "GitHub Actions" or "GitLab CI")
3. Generate and **copy the token** (you won't see it again)

#### Step 4: Configure Secrets

**For GitHub:**
1. Go to your repository Settings → Secrets and variables → Actions
2. Add two secrets:
   - `SONAR_TOKEN`: Your SonarCloud token
   - `SONAR_HOST_URL`: `https://sonarcloud.io`

**For GitLab:**
1. Go to Settings → CI/CD → Variables
2. Add two variables:
   - Key: `SONAR_TOKEN`, Value: Your SonarCloud token, Type: Masked
   - Key: `SONAR_HOST_URL`, Value: `https://sonarcloud.io`, Type: Variable

#### Step 5: Update sonar-project.properties

Edit the `sonar-project.properties` file:

```properties
# For SonarCloud
sonar.organization=your-organization-key
sonar.projectKey=your-project-key
```

### Option 2: Using Self-Hosted SonarQube

#### Step 1: Install SonarQube

Using Docker (easiest):
```bash
docker run -d --name sonarqube \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:latest
```

Access at: `http://localhost:9000` (default credentials: admin/admin)

#### Step 2: Create Project

1. Login to SonarQube
2. Click "Create Project" → "Manually"
3. Set Project key and Display name
4. Click "Set Up"

#### Step 3: Generate Token

1. Go to My Account → Security → Generate Token
2. Name it and generate
3. **Copy the token**

#### Step 4: Configure Secrets

**For GitHub:**
- `SONAR_TOKEN`: Your SonarQube token
- `SONAR_HOST_URL`: Your SonarQube URL (e.g., `http://your-server:9000`)

**For GitLab:**
- `SONAR_TOKEN`: Your SonarQube token (masked)
- `SONAR_HOST_URL`: Your SonarQube URL

## 🚦 How the Quality Gate Works

### GitHub Actions Flow

```
1. Push/PR created
   ↓
2. SonarQube Analysis Job runs
   ↓
3. Code is scanned for:
   - Bugs
   - Vulnerabilities
   - Code Smells
   - Security Hotspots
   - Code Coverage
   - Code Duplications
   ↓
4. Quality Gate Check
   ├─ PASS → Pipeline continues → Can merge
   └─ FAIL → Pipeline fails → Cannot merge ❌
```

### GitLab CI/CD Flow

```
1. Push/Merge Request created
   ↓
2. SonarQube Stage (runs first)
   ↓
3. Code Analysis
   ↓
4. Quality Gate Check
   ├─ PASS → Next stages run → Can merge
   └─ FAIL → Pipeline stops → Cannot merge ❌
```

## 📊 Quality Gate Criteria

Default SonarQube Quality Gate checks:

| Metric | Condition |
|--------|-----------|
| **Coverage** | Coverage on new code ≥ 80% |
| **Duplications** | Duplicated lines on new code ≤ 3% |
| **Maintainability** | Technical debt ratio on new code ≤ 5% |
| **Reliability** | No new bugs |
| **Security** | No new vulnerabilities |
| **Security Review** | Security hotspots reviewed = 100% |

### Customizing Quality Gates

1. Login to SonarQube/SonarCloud
2. Go to Quality Gates
3. Create a new Quality Gate or modify existing
4. Set your own thresholds
5. Assign it to your project

## 🔍 Pipeline Configuration Details

### GitHub Actions (`.github/workflows/ci.yml`)

```yaml
sonarqube-analysis:
  name: SonarQube Quality Gate
  steps:
    - name: SonarQube Scan
      uses: sonarsource/sonarqube-scan-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
    
    - name: SonarQube Quality Gate Check
      uses: sonarsource/sonarqube-quality-gate-action@master
      timeout-minutes: 5
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Key Points:**
- Runs on all PRs and pushes to main/develop
- Uses official SonarSource GitHub Actions
- Blocks merge if quality gate fails
- All subsequent jobs depend on this passing

### GitLab CI (`.gitlab-ci.yml`)

```yaml
sonarqube-check:
  stage: sonarqube  # First stage
  image: sonarsource/sonar-scanner-cli:latest
  script:
    - sonar-scanner
      -Dsonar.qualitygate.wait=true  # Wait for quality gate result
      -Dsonar.projectKey=${CI_PROJECT_NAME}
      -Dsonar.host.url=${SONAR_HOST_URL}
      -Dsonar.login=${SONAR_TOKEN}
  allow_failure: false  # Must pass
```

**Key Points:**
- First stage in the pipeline
- Uses SonarScanner Docker image
- `-Dsonar.qualitygate.wait=true` makes it wait for analysis result
- `allow_failure: false` blocks pipeline on failure
- All other stages depend on this

## 🧪 Testing the Integration

### 1. Test with Clean Code (Should Pass)

```bash
git checkout -b test-sonarqube-pass
# Make a small change
echo "// Clean code test" >> utils.js
git add .
git commit -m "test: SonarQube quality gate - should pass"
git push origin test-sonarqube-pass
```

Create a PR/MR and watch the pipeline:
- ✅ SonarQube analysis should pass
- ✅ Quality gate should pass
- ✅ Pipeline continues

### 2. Test with Poor Code (Should Fail)

```bash
git checkout -b test-sonarqube-fail
# Add intentionally bad code
cat >> utils.js << 'EOF'

// Intentional code smell for testing
function badFunction() {
  var x = 1; var x = 2; // Duplicate variable
  if (true) { return x; } // Always true condition
  eval("console.log('avoid eval')"); // Security issue
}
EOF
git add .
git commit -m "test: SonarQube quality gate - should fail"
git push origin test-sonarqube-fail
```

Create a PR/MR:
- ⚠️ SonarQube finds issues
- ❌ Quality gate fails
- ❌ Pipeline stops
- ❌ Cannot merge

## 📈 Viewing SonarQube Results

### On SonarCloud/SonarQube Dashboard:

1. Navigate to your project
2. View metrics:
   - **Overview**: Overall health
   - **Issues**: Bugs, vulnerabilities, code smells
   - **Security Hotspots**: Security review needed
   - **Measures**: Detailed metrics
   - **Code**: Line-by-line analysis

### On GitHub:

1. Go to the PR
2. Check "Checks" tab
3. View SonarQube Quality Gate status
4. Click "Details" to view full report

### On GitLab:

1. Go to the Merge Request
2. Check Pipeline status
3. Click on "sonarqube-check" job
4. View analysis logs and link to report

## 🛠️ Troubleshooting

### "Quality Gate Failed"
- **Cause**: Code doesn't meet quality standards
- **Solution**: Fix the issues reported by SonarQube, commit, and push again

### "SONAR_TOKEN not set"
- **Cause**: Secret/variable not configured
- **Solution**: Add SONAR_TOKEN in repository secrets/variables

### "Connection refused to SonarQube server"
- **Cause**: SONAR_HOST_URL incorrect or server down
- **Solution**: Verify URL and server availability

### "Project key not found"
- **Cause**: Project not created in SonarQube
- **Solution**: Create project first or check projectKey in configuration

### Analysis takes too long
- **Cause**: Large codebase or slow server
- **Solution**: 
  - Increase timeout in pipeline
  - Exclude unnecessary files in sonar-project.properties
  - Use incremental analysis for branches

## 🔒 Security Best Practices

1. **Never commit tokens**: Always use secrets/variables
2. **Use masked variables**: In GitLab, mark SONAR_TOKEN as "Masked"
3. **Rotate tokens**: Regenerate tokens periodically
4. **Limit scope**: Use project-specific tokens when possible
5. **Review security hotspots**: Don't ignore security findings

## 📚 Additional Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Quality Gates Documentation](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
- [SonarScanner for Node.js](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)

## 💡 Tips

1. **Start with default quality gate**: Don't make it too strict initially
2. **Focus on new code**: Configure "New Code" period appropriately
3. **Gradual improvement**: Fix critical issues first, then work on code smells
4. **Use exclusions wisely**: Don't exclude files just to pass quality gate
5. **Monitor trends**: Regular check SonarQube dashboard for improvements

## ✅ Verification Checklist

- [ ] SonarQube/SonarCloud account created
- [ ] Project created and configured
- [ ] Token generated
- [ ] Secrets/Variables configured in GitHub/GitLab
- [ ] `sonar-project.properties` updated with correct projectKey
- [ ] Test PR/MR created and pipeline runs
- [ ] Quality gate blocks merge when fails
- [ ] Quality gate allows merge when passes
- [ ] Team understands how to view and fix issues
