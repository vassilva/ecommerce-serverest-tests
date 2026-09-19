pipeline {
  agent {
    docker {
      image 'cypress/included:15.8.2'
      args '--ipc=host --entrypoint=""'
    }
  }

  options {
    // Limits the total execution time to 15 minutes
    timeout(time: 15, unit: 'MINUTES')
    // Keeps only the last 5 builds to save disk space
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  stages {
    stage('Install dependencies') {
      steps {
        // Fetches the source code from the repository
        checkout scm
        // Clean install of npm packages based on package-lock.json
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Format check') {
      steps {
        sh 'npm run format:check'
      }
    }

    // Feature/other plain branches: Fast CI.
    stage('Feature Smoke Tests') {
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          not { branch 'main' }
        }
      }
      steps {
        sh 'npm run cy:run:smoke'
      }
    }

    // main: post-merge CI.
    stage('Main Smoke Tests') {
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        sh 'npm run cy:run:smoke'
      }
    }

    // ===== Simulated CD (main only) =====
    // Everything below is explicitly a SIMULATION. No real deployment
    // infrastructure exists for this repository and none is contacted
    // by any of these stages.

    stage('Prepare Simulated Release') {
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        sh '''
          set -e
          STAGE=".simulated-release/release"
          rm -rf .simulated-release
          mkdir -p "$STAGE"

          allowlist=(
            "cypress/e2e"
            "cypress/support"
            "cypress.config.js"
            ".cypress-cucumber-preprocessorrc.json"
            "package.json"
            "package-lock.json"
            "README.md"
            ".github/workflows/ci.yml"
            "Jenkinsfile"
          )

          missing=0
          for p in "${allowlist[@]}"; do
            if [ ! -e "$p" ]; then
              echo "Missing required release path: $p"
              missing=1
            fi
          done
          if [ "$missing" -eq 1 ]; then
            echo "One or more required release paths are missing. Aborting simulated release."
            exit 1
          fi

          for p in "${allowlist[@]}"; do
            dest="$STAGE/$(dirname "$p")"
            mkdir -p "$dest"
            cp -r "$p" "$dest/"
          done
        '''
      }
    }

    stage('Generate Release Manifest') {
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        sh '''
          node -e "
            const fs = require('fs');

            const manifest = {
              schemaVersion: '1.0',
              project: 'automacao-serverest',
              releaseType: 'simulated',
              simulatedDeployment: true,
              realDeploymentPerformed: false,
              deploymentType: 'simulated',
              sourceBranch: process.env.BRANCH_NAME,
              sourceCommit: process.env.GIT_COMMIT,
              jenkinsBuildNumber: process.env.BUILD_NUMBER,
              jenkinsJobName: process.env.JOB_NAME,
              timestampUtc: new Date().toISOString(),
              releaseContents: [
                'cypress/e2e',
                'cypress/support',
                'cypress.config.js',
                '.cypress-cucumber-preprocessorrc.json',
                'package.json',
                'package-lock.json',
                'README.md',
                '.github/workflows/ci.yml',
                'Jenkinsfile'
              ],
              targetDescription: 'Public reference ServeRest application, used only for post-simulated-deployment smoke validation. This is not a deployment target and no application was deployed to it.',
              environmentLimitation: 'This repository is a QA automation laboratory with no owned DEV, UAT, PREPROD, or PROD deployment environment.',
              noRealDeploymentStatement: 'No real deployment target was contacted. This release is simulated for portfolio and demonstration purposes only.',
              postDeployValidationScope: 'Post-simulated-deployment smoke validation against the reference target application. This does not validate a newly deployed application instance.'
            };

            fs.writeFileSync('.simulated-release/release-manifest.json', JSON.stringify(manifest, null, 2));
            console.log('release-manifest.json written.');
          "
        '''
      }
    }

    stage('Validate Release Manifest') {
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        sh '''
          node -e "
            const fs = require('fs');
            const raw = fs.readFileSync('.simulated-release/release-manifest.json', 'utf8');
            const m = JSON.parse(raw);

            const requiredFields = [
              'schemaVersion','project','releaseType','simulatedDeployment','realDeploymentPerformed',
              'deploymentType','sourceBranch','sourceCommit','jenkinsBuildNumber','jenkinsJobName',
              'timestampUtc','releaseContents','targetDescription','environmentLimitation',
              'noRealDeploymentStatement','postDeployValidationScope'
            ];

            for (const field of requiredFields) {
              if (m[field] === undefined || m[field] === null || m[field] === '') {
                console.error('Manifest validation failed: missing or empty field: ' + field);
                process.exit(1);
              }
            }

            if (!Array.isArray(m.releaseContents) || m.releaseContents.length === 0) {
              console.error('Manifest validation failed: releaseContents must be a non-empty array');
              process.exit(1);
            }
            if (m.simulatedDeployment !== true) {
              console.error('Manifest validation failed: simulatedDeployment must be true');
              process.exit(1);
            }
            if (m.realDeploymentPerformed !== false) {
              console.error('Manifest validation failed: realDeploymentPerformed must be false');
              process.exit(1);
            }
            if (m.sourceBranch !== 'main') {
              console.error('Manifest validation failed: sourceBranch must be main');
              process.exit(1);
            }

            console.log('release-manifest.json validated successfully.');
          "
        '''
      }
    }

    stage('Simulated Deployment') {
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        sh '''
          set -e
          if [ ! -d ".simulated-release/release" ]; then
            echo "Prepared simulated release not found. Aborting."
            exit 1
          fi
          if [ ! -f ".simulated-release/release-manifest.json" ]; then
            echo "Validated release manifest not found. Aborting."
            exit 1
          fi

          echo "SIMULATED DEPLOYMENT: no real deployment target is contacted by this stage."
          echo "This step only records that the simulated release passed validation and is ready for post-simulated-deployment smoke validation."

          node -e "
            const fs = require('fs');
            const evidence = {
              simulatedDeployment: true,
              realDeploymentPerformed: false,
              deploymentTimestampUtc: new Date().toISOString(),
              sourceCommit: process.env.GIT_COMMIT,
              note: 'No real deployment infrastructure was contacted. This file only marks that the simulated release completed its (non-network) simulated deployment step.'
            };
            fs.writeFileSync('.simulated-release/simulated-deployment-evidence.json', JSON.stringify(evidence, null, 2));
            console.log('simulated-deployment-evidence.json written.');
          "
        '''
      }
    }

    stage('Post-Simulated-Deployment Smoke') {
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        echo 'Post-simulated-deployment smoke validation against the reference target application.'
        sh 'npm run cy:run:smoke'
      }
    }

    stage('Release Evidence') {
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        sh '''
          node -e "
            const fs = require('fs');
            const evidence = {
              sourceCommit: process.env.GIT_COMMIT,
              jenkinsBuildNumber: process.env.BUILD_NUMBER,
              simulatedRelease: true,
              simulatedDeploymentCompleted: true,
              postSimulatedDeploymentSmokeIntent: 'Post-simulated-deployment smoke validation against the reference target application. Does not validate a newly deployed application instance.',
              finalEvidenceScope: 'Simulated release, simulated deployment marker, and post-simulated-deployment smoke result for this main build. No real deployment infrastructure was contacted.',
              noRealDeploymentStatement: 'No real deployment target was contacted at any stage of this pipeline.'
            };
            fs.writeFileSync('.simulated-release/release-evidence.json', JSON.stringify(evidence, null, 2));
            console.log('release-evidence.json written.');
          "
        '''
        archiveArtifacts artifacts: '.simulated-release/**', allowEmptyArchive: true
      }
    }

    stage('Regression Tests') {
      when {
        expression { env.CHANGE_ID != null }
      }
      steps {
        sh 'npm run cy:run:regression'
      }
    }
  }

  post {
    always {
      // Executed regardless of the build status
      echo 'Finishing the ServeRest automation pipeline execution...'
    }
    success {
      echo 'Pipeline executed successfully!'
    }
    failure {
      archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
      echo 'Pipeline failed. Please check the Console Output for details.'
    }
  }
}
