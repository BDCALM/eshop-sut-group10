// CI pipeline and report publishing for the EShop backend (tasks D-02/D-03).
// Runs on the Docker agent defined in infra/jenkins (label eshop-node: Node 24.14.0, npm 11.9.0).
// Stages: Checkout -> Environment -> Install -> Lint -> Build -> Tests.
// A failing command fails its own stage and skips the following stages; logs are archived in post.

pipeline {
    agent { label 'eshop-node' }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }

    environment {
        CI = 'true'
        EXPECTED_NODE = 'v24.14.0'
        LOG_DIR = 'test-results'
    }

    stages {
        stage('Checkout') {
            steps {
                // Clean workspace so no report or node_modules from an earlier build is reused.
                deleteDir()
                checkout scm
            }
        }

        stage('Environment') {
            steps {
                dir('backend') {
                    sh label: 'Record commit and runtime', script: '''#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$LOG_DIR"
commit="$(git rev-parse HEAD)"   # fails the stage if the checkout is not a git work tree
{
    echo "branch: ${BRANCH_NAME:-unknown}"
    echo "commit: $commit"
    echo "build:  ${BUILD_TAG:-unknown}"
    echo "node:   $(node --version)"
    echo "npm:    $(npm --version)"
    echo "git:    $(git --version)"
    echo "os:     $(grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"')"
    echo "kernel: $(uname -srm)"
    echo "npm cache: $(npm config get cache)"
} | tee "$LOG_DIR/environment.log"
if [ "$(node --version)" != "$EXPECTED_NODE" ]; then
    echo "Expected Node $EXPECTED_NODE but found $(node --version)" >&2
    exit 1
fi
'''
                }
            }
        }

        stage('Install') {
            steps {
                dir('backend') {
                    sh label: 'npm ci', script: '''#!/usr/bin/env bash
set -euo pipefail
npm ci --no-audit --no-fund 2>&1 | tee "$LOG_DIR/install.log"
'''
                }
            }
        }

        stage('Lint') {
            steps {
                dir('backend') {
                    sh label: 'npm run lint', script: '''#!/usr/bin/env bash
set -euo pipefail
npm run lint 2>&1 | tee "$LOG_DIR/lint.log"
'''
                }
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh label: 'npm run build (syntax check)', script: '''#!/usr/bin/env bash
set -euo pipefail
npm run build 2>&1 | tee "$LOG_DIR/build.log"
'''
                }
            }
        }

        stage('Tests') {
            steps {
                dir('backend') {
                    // pipefail keeps Jest's exit code even though output goes through tee.
                    sh label: 'npm run test:ci (unit, API, smoke, harness + coverage)', script: '''#!/usr/bin/env bash
set -euo pipefail
npm run test:ci -- --json --outputFile="$LOG_DIR/results.json" 2>&1 | tee "$LOG_DIR/test.log"
'''
                }
            }
            post {
                always {
                    dir('backend') {
                        script {
                            // Publish results even after Jest fails; missing reports are errors.
                            try {
                                junit testResults: 'test-results/junit.xml',
                                    allowEmptyResults: false,
                                    skipPublishingChecks: true
                            } finally {
                                recordCoverage tools: [[parser: 'COBERTURA', pattern: 'coverage/cobertura-coverage.xml']],
                                    enabledForFailure: true,
                                    failOnError: true,
                                    skipPublishingChecks: true,
                                    sourceCodeRetention: 'EVERY_BUILD',
                                    sourceDirectories: [[path: '.']]
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // Runs even when a stage fails, so the logs needed for diagnosis are kept.
            // Keep raw files in addition to the Test Results and Coverage views.
            archiveArtifacts artifacts: 'backend/test-results/**, backend/coverage/cobertura-coverage.xml, backend/coverage/coverage-summary.json',
                allowEmptyArchive: true,
                fingerprint: true
        }
    }
}
