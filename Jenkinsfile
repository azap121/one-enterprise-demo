#!/usr/bin/env groovy
@Library('k8s-cicd-pipelines') _

cicdGenericPipeline {
  appName = 'halo-app'
  buildTool = 'node'
  deploymentType = 'kubernetes'
  channel = '#technology-enablement-alerts'

  // Build (rsbuild produces dist/, which the Dockerfile copies into nginx)
  depCommand = 'npm set progress=false && npm ci'
  buildCommand = 'npm run build'

  // Designer prototype repo — no automated tests, no linter, no E2E gating
  testCommand = 'echo "skipping tests — designer prototype repo"'
  coverageCommand = 'echo "skipping coverage — designer prototype repo"'
  bypassCoverage = true
  noFailCoverage = true
  runNpmLinter = false
  runAcceptance = false
  runE2e = false
}
