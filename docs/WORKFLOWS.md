# BrainBytes CI/CD Documentation

This document explains the Continuous Integration and Continuous Deployment (CI/CD) setup for the BrainBytes AI tutoring platform.

## Workflows

### Main Workflow (`main.yml`)

**Purpose**: Comprehensive CI pipeline that runs linting, scanning, testing, and building on every push and pull request.

**Stages**:
1. **Lint and Scan**: Checks code quality with ESLint and scans vulnerabilites with Snyk
2. **Test**: Runs integration test
3. **Build**: Builds Docker images and verifies Docker Compose configuration

**Manual Execution**:
To run this workflow manually, go to the Actions tab, select "BrainBytes CI/CD", and click "Run workflow".

### Deployment Workflow (`deploy.yml`)

**Purpose**: Deploys the application to the test environment on pushes to main or development branches.

**Manual Execution**:
To deploy manually, go to the Actions tab, select "BrainBytes Deploy", and click "Run workflow".

## Workflow Status Badges

[![BrainBytes CI/CD](https://github.com/Gracielleee/DevOps/actions/workflows/main.yml/badge.svg)](https://github.com/Gracielleee/DevOps/actions/workflows/main.yml)
[![BrainBytes Deploy](https://github.com/Gracielleee/DevOps/actions/workflows/deploy.yml/badge.svg)](https://github.com/Gracielleee/DevOps/actions/workflows/deploy.yml)

## Troubleshooting

### Common Issues

1. **Workflow Failures**:
   - Check the specific error in the workflow logs
   - Verify that all required secrets are configured
   - Ensure tests are passing locally before pushing

2. **Deployment Issues**:
   - Verify environment variables are correctly set
   - Check if the deployment environment is accessible
   - Review deployment logs for specific errors

### Getting Help

If you encounter issues with the CI/CD setup:
1. Check the Actions tab for detailed logs
2. Consult the GitHub Actions documentation
3. Contact the repository maintainers 
