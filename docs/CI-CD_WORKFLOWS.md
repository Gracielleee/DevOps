# BrainBytes CI/CD Documentation

This document explains the Continuous Integration and Continuous Deployment (CI/CD) setup for the BrainBytes AI tutoring platform.

</br>

## Workflows

### Main Workflow (`main.yml`)

**Purpose**: A comprehensive CI pipeline that ensures code quality, security, and build integrity on every push and pull request to the `main` and `development` branches.

**Stages**:
1. **Lint and Scan**: Checks code quality with ESLint, scans for dependency vulnerabilities using Snyk and npm audit, and actively prevents credential leaks using TruffleHog secret scanning.
2. **Test**: Runs comprehensive unit testing (Jest) for both frontend and backend, alongside end-to-end testing using Playwright. See our [testing documentation](TESTING.md) for more details.
3. **Build**: Builds production-ready Docker images and automatically pushes them to the GitHub Container Registry (GHCR), tagging them with the Git commit SHA for reliable version control.

**Manual Execution**:
To run this workflow manually, go to the Actions tab, select "BrainBytes CI/CD", and click "Run workflow".

</br>

### Deployment Workflow (`deploy.yml`)

**Purpose**: Automates Continuous Deployment (CD) to the live production environment on Render.

**Triggers**:
This workflow automatically runs only when the `main.yml` pipeline successfully completes on the `main` branch.

**Stages**:
1. **Deploy**: Securely triggers Render deployment hooks using the exact compiled image tags pulled directly from GHCR.
2. **Verify**: Actively polls the live deployment URLs to ensure the frontend and backend health checks return a `200 OK` status before declaring the deployment a success.
3. **Audit Logs**: Generates and uploads JSON deployment metadata as a GitHub artifact for auditing purposes.

**Manual Execution**:
To deploy a specific version manually, go to the Actions tab, select "BrainBytes Deploy", click "Run workflow", and optionally provide a specific `image_tag`.

</br>

### Rollback Workflow (`rollback.yml`)
**Purpose:** An emergency manual trigger to instantly revert the backend, frontend, or both services to a previously known-good state.

**Features:**
Instead of pulling the `latest` code, this workflow bypasses standard deployment behavior by appending a specific, URL-encoded image parameter directly to the Render webhook. It also verifies live service health and retains a 90-day artifact log of the rollback event.

**Manual Execution:**
1. Go to the Actions tab and select "Rollback Deployment".
2. Click "Run workflow".
3. Select which service to revert (frontend, backend, or both).
4. Provide the exact `image_tag` (the short SHA) of the stable build you wish to restore.

</br>

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

</br>

## Quick Resources

| Resource | File / Link |
|----------|-------------|
| Application Testing Approach | [`TESTING`](TESTING.md) |
| GHCR | [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) |