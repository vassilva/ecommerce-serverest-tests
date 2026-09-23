pipeline {
  agent {
    docker {
      image 'cypress/included:15.8.2'
      args '--ipc=host --entrypoint=""'
    }
  }

  options {
    // No pipeline-global timeout: the Deployment Authorization stage waits
    // for a human on its own independent, much longer timeout (see that
    // stage). Every automated stage instead carries its own bound below,
    // reusing the previous 15-minute ceiling so no automated stage is left
    // unbounded and none is tightened relative to the prior behavior.
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  stages {
    stage('Install dependencies') {
      options { timeout(time: 15, unit: 'MINUTES') }
      steps {
        // Fetches the source code from the repository
        checkout scm
        // Clean install of npm packages based on package-lock.json
        sh 'npm ci'
      }
    }

    stage('Lint') {
      options { timeout(time: 15, unit: 'MINUTES') }
      steps {
        sh 'npm run lint'
      }
    }

    stage('Format check') {
      options { timeout(time: 15, unit: 'MINUTES') }
      steps {
        sh 'npm run format:check'
      }
    }

    // Feature/other plain branches: Fast CI.
    stage('Feature Smoke Tests') {
      options { timeout(time: 15, unit: 'MINUTES') }
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

    // main: pre-deployment blocking quality gate. A failure here must stop the
    // pipeline before any authorization/deployment/release stage runs.
    // Deliberately NOT wrapped in catchError: this gate stays fail-hard.
    stage('Main Sanity Tests') {
      options { timeout(time: 15, unit: 'MINUTES') }
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        sh 'npm run cy:run:sanity'
      }
    }

    // ===== Manual deployment authorization (main only) =====
    // Models the generic organizational concept of separating "quality gate
    // passed" from "a human authorized deployment to proceed" - it does not
    // claim to reproduce any specific company's technical implementation.
    //
    // agent none: this stage must NOT hold/occupy the Cypress Docker
    // container or a Jenkins executor while waiting for a human. It has no
    // workspace and touches no files; the decision is threaded to later
    // stages purely through environment variables, then persisted to a file
    // by "Record Deployment Authorization" (which runs back on the Docker
    // agent, since only a stage with a workspace can write to
    // .simulated-release/).
    //
    // The three possible outcomes (approved / rejected / timed-out) are
    // deliberately distinguished - a rejection or a timeout is never treated
    // as a test failure. See README "Manual deployment authorization" for
    // the full rationale, including the known limitation in distinguishing
    // an explicit UI rejection from an unrelated administrative build abort.
    stage('Deployment Authorization') {
      agent none
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        script {
          // Business decision (APPROVE/REJECT) is captured exclusively as
          // a normal, non-exceptional input() return value. Deliberately
          // no try/catch around timeout()/input() at all: this Jenkins
          // instance does not have FlowInterruptedException.getCauses()
          // approved in Script Security, and this pipeline must not
          // require Script Approval or weaken the sandbox to fix that.
          // Architectural decision: this pipeline no longer attempts to
          // distinguish an authorization timeout from an external Jenkins
          // Abort inside sandboxed Groovy. Both simply propagate as
          // Jenkins' own native interruption/ABORTED handling - no code
          // here touches FlowInterruptedException in any way, so no
          // sandbox-restricted method is ever called. See README
          // "Manual deployment authorization" for the full rationale.
          def decision = null
          def submitter = null

          // Independent, deliberately long lab timeout for the human
          // wait - see README for rationale. Scoped to this stage only;
          // it does not borrow from or extend any automated stage's own
          // 15-minute budget, and no automated stage's budget is
          // consumed by this wait either. If it elapses, or the build is
          // aborted externally, the resulting interruption is not caught
          // here - it propagates normally and Jenkins marks the build
          // ABORTED, exactly as it would for any other stage.
          timeout(time: 24, unit: 'HOURS') {
            def result = input(
              message: 'Quality gates passed. Authorize progression to the simulated SIT deployment gate? This is a lab simulation - no real SIT/UAT environment will be contacted either way.',
              parameters: [
                choice(
                  name: 'DECISION',
                  choices: ['APPROVE', 'REJECT'],
                  description: 'Approve or reject progression to the simulated SIT deployment gate.'
                )
              ],
              submitterParameter: 'SUBMITTED_BY'
            )
            // Already proven on this instance by the live APPROVE run:
            // combining a `choice` parameter with `submitterParameter`
            // returns a Map. The String branch is a defensive fallback
            // only, kept so an unexpected shape fails safe (decision
            // stays null, treated as REJECT below) rather than throwing.
            if (result instanceof Map) {
              decision = result.get('DECISION')
              submitter = result.get('SUBMITTED_BY')
            } else if (result instanceof String) {
              decision = result
            }
          }

          // Anything other than an explicit APPROVE - including REJECT
          // and any unparseable/unexpected return shape - is treated as
          // rejected. This always fails toward the non-deploying
          // direction, never toward an unintended approval.
          def outcome = (decision == 'APPROVE') ? 'approved' : 'rejected'

          env.DEPLOYMENT_AUTH_STATUS = outcome
          env.DEPLOYMENT_AUTH_SUBMITTER = submitter ?: ''
          env.DEPLOYMENT_AUTH_TIMESTAMP = new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone('UTC'))

          if (outcome == 'rejected') {
            // Testing passed; deployment was intentionally not authorized.
            // This is not a defect - the build result must not imply one.
            currentBuild.result = 'SUCCESS'
          }
        }
      }
    }

    // Always runs on main (any of the three authorization outcomes) so the
    // decision is durably recorded before any conditional CD stage is
    // reached. Writes the one file all three outcome paths share.
    stage('Record Deployment Authorization') {
      options { timeout(time: 15, unit: 'MINUTES') }
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
        }
      }
      steps {
        sh '''
          set -e
          mkdir -p .simulated-release
          node -e "
            const fs = require('fs');
            const record = {
              required: true,
              status: process.env.DEPLOYMENT_AUTH_STATUS,
              submittedBy: process.env.DEPLOYMENT_AUTH_SUBMITTER && process.env.DEPLOYMENT_AUTH_SUBMITTER !== '' ? process.env.DEPLOYMENT_AUTH_SUBMITTER : null,
              timestampUtc: process.env.DEPLOYMENT_AUTH_TIMESTAMP,
              sourceCommit: process.env.GIT_COMMIT,
              jenkinsBuildNumber: process.env.BUILD_NUMBER,
              meaning: 'A passing Main Sanity quality gate does not by itself authorize deployment. This file records the separate, explicit human decision that followed it.'
            };
            fs.writeFileSync('.simulated-release/deployment-authorization.json', JSON.stringify(record, null, 2));
            console.log('deployment-authorization.json written. status=' + record.status);
          "
        '''
      }
    }

    // ===== Simulated CD (main only, approved authorization only) =====
    // Everything below is explicitly a SIMULATION. No real deployment
    // infrastructure exists for this repository and none is contacted
    // by any of these stages. Each stage below only proceeds when the
    // Deployment Authorization outcome recorded above was "approved".

    stage('Prepare Simulated Release') {
      options { timeout(time: 15, unit: 'MINUTES') }
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
          expression { env.DEPLOYMENT_AUTH_STATUS == 'approved' }
        }
      }
      steps {
        sh '''
          set -e
          STAGE=".simulated-release/release"
          rm -rf "$STAGE"
          mkdir -p "$STAGE"

          allowlist="cypress/e2e cypress/support cypress.config.js .cypress-cucumber-preprocessorrc.json package.json package-lock.json README.md Jenkinsfile"

          missing=0
          for p in $allowlist; do
            if [ ! -e "$p" ]; then
              echo "Missing required release path: $p"
              missing=1
            fi
          done
          if [ "$missing" -eq 1 ]; then
            echo "One or more required release paths are missing. Aborting simulated release."
            exit 1
          fi

          for p in $allowlist; do
            dest="$STAGE/$(dirname "$p")"
            mkdir -p "$dest"
            cp -r "$p" "$dest/"
          done
        '''
      }
    }

    stage('Generate Release Manifest') {
      options { timeout(time: 15, unit: 'MINUTES') }
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
          expression { env.DEPLOYMENT_AUTH_STATUS == 'approved' }
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
                'Jenkinsfile'
              ],
              targetDescription: 'Public reference ServeRest application, used only for SIT Smoke validation. This is not a deployment target and no application was deployed to it.',
              environmentLimitation: 'This repository is a QA automation laboratory with no owned DEV, SIT, UAT, PREPROD, or PROD deployment environment.',
              noRealDeploymentStatement: 'No real deployment target was contacted. This release is simulated for portfolio and demonstration purposes only.',
              postDeployValidationScope: 'SIT Smoke validation against the reference target application. This does not validate a newly deployed application instance.'
            };

            fs.writeFileSync('.simulated-release/release-manifest.json', JSON.stringify(manifest, null, 2));
            console.log('release-manifest.json written.');
          "
        '''
      }
    }

    stage('Validate Release Manifest') {
      options { timeout(time: 15, unit: 'MINUTES') }
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
          expression { env.DEPLOYMENT_AUTH_STATUS == 'approved' }
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

    stage('Simulated SIT Deployment') {
      options { timeout(time: 15, unit: 'MINUTES') }
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
          expression { env.DEPLOYMENT_AUTH_STATUS == 'approved' }
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

          echo "SIMULATED SIT DEPLOYMENT: no real SIT environment is contacted by this stage."
          echo "This step only records that the simulated release passed validation and is ready for SIT Smoke."

          node -e "
            const fs = require('fs');
            const evidence = {
              simulatedDeployment: true,
              realDeploymentPerformed: false,
              environment: 'simulated-SIT',
              deploymentTimestampUtc: new Date().toISOString(),
              sourceCommit: process.env.GIT_COMMIT,
              jenkinsBuildNumber: process.env.BUILD_NUMBER,
              note: 'No real SIT infrastructure was contacted. This file only marks that the simulated release completed its (non-network) simulated SIT deployment step.'
            };
            fs.writeFileSync('.simulated-release/simulated-sit-deployment-evidence.json', JSON.stringify(evidence, null, 2));
            console.log('simulated-sit-deployment-evidence.json written.');
          "
        '''
      }
    }

    stage('SIT Smoke') {
      options { timeout(time: 15, unit: 'MINUTES') }
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
          expression { env.DEPLOYMENT_AUTH_STATUS == 'approved' }
        }
      }
      steps {
        echo 'SIT Smoke: validates the smoke suite at the simulated SIT gate against the reference ServeRest target. It does not validate a newly deployed SIT application instance.'
        // A Smoke failure must fail this stage and the build (fail closed), but must
        // not abort the pipeline before Release Evidence records the outcome.
        // The exact exit status is persisted and then re-raised unchanged.
        catchError(
          buildResult: 'FAILURE',
          stageResult: 'FAILURE',
          catchInterruptions: false
        ) {
          sh '''
            set +e
            npm run cy:run:smoke
            rc=$?
            mkdir -p .simulated-release
            printf '%s' "$rc" > .simulated-release/sit-smoke.exitcode
            if [ "$rc" -eq 0 ]; then
              : > .simulated-release/sit-smoke.ok
            fi
            exit "$rc"
          '''
        }
      }
    }

    // Evidence-only: no second Cypress execution. This suite already ran
    // once, above, as SIT Smoke. There is only one reference target this
    // pipeline can reach - a second identical run would validate nothing
    // new. Promotion to the simulated UAT gate is granted on the
    // already-proven SIT Smoke result. See README for the full rationale.
    stage('Simulated UAT Promotion') {
      options { timeout(time: 15, unit: 'MINUTES') }
      when {
        allOf {
          expression { env.CHANGE_ID == null }
          branch 'main'
          expression { env.DEPLOYMENT_AUTH_STATUS == 'approved' }
          expression { fileExists('.simulated-release/sit-smoke.ok') }
        }
      }
      steps {
        sh '''
          set -e
          echo "SIMULATED UAT PROMOTION: no real UAT environment is contacted by this stage."
          echo "Evidence-only promotion, granted on the already-proven SIT Smoke result. No second Cypress execution."

          node -e "
            const fs = require('fs');
            const evidence = {
              simulatedPromotion: true,
              realDeploymentPerformed: false,
              promotionSource: 'simulated-SIT',
              promotionTarget: 'simulated-UAT',
              promotionTimestampUtc: new Date().toISOString(),
              sourceCommit: process.env.GIT_COMMIT,
              jenkinsBuildNumber: process.env.BUILD_NUMBER,
              basis: 'Granted on the SIT Smoke result recorded earlier in this same build. No second Cypress execution was performed and no real UAT environment was contacted.',
              note: 'This laboratory has no owned UAT environment. This file records a simulated promotion decision only.'
            };
            fs.writeFileSync('.simulated-release/uat-promotion-evidence.json', JSON.stringify(evidence, null, 2));
            console.log('uat-promotion-evidence.json written.');
          "
        '''
      }
    }

    stage('Release Evidence') {
      options { timeout(time: 15, unit: 'MINUTES') }
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

            // All state is derived from files written by THIS build (.simulated-release
            // is recreated by Prepare Simulated Release, which only runs when approved).
            // Missing or invalid data fails closed / is recorded as not-run|blocked.

            // qualityGate.sanityStatus is hardcoded 'passed': this stage only ever
            // executes on main after Main Sanity Tests succeeded, since that stage
            // remains fail-hard (uncaught failure halts the pipeline before this
            // stage is ever reached). There is no other value this can hold here.
            const qualityGate = { sanityStatus: 'passed' };

            let deploymentAuthorization = {
              required: true,
              status: 'not-reached',
              submittedBy: null,
              timestampUtc: null,
              meaning: 'A passing Main Sanity quality gate does not by itself authorize deployment. This field records the separate, explicit human decision that followed it.'
            };
            try {
              const a = JSON.parse(fs.readFileSync('.simulated-release/deployment-authorization.json', 'utf8'));
              deploymentAuthorization = {
                required: true,
                status: a.status,
                submittedBy: a.submittedBy === undefined ? null : a.submittedBy,
                timestampUtc: a.timestampUtc,
                meaning: a.meaning
              };
            } catch (e) {
              // deployment-authorization.json missing entirely is only expected if
              // Main Sanity failed - but then this stage would never run either.
              // Left as 'not-reached' defensively rather than assumed.
            }

            let sitDeploymentExecuted = false;
            try {
              const d = JSON.parse(fs.readFileSync('.simulated-release/simulated-sit-deployment-evidence.json', 'utf8'));
              sitDeploymentExecuted =
                d.simulatedDeployment === true &&
                d.realDeploymentPerformed === false &&
                typeof d.deploymentTimestampUtc === 'string' && d.deploymentTimestampUtc !== '' &&
                typeof d.sourceCommit === 'string' && d.sourceCommit !== '' &&
                d.sourceCommit === process.env.GIT_COMMIT;
            } catch (e) {
              sitDeploymentExecuted = false;
            }

            // Exit code file: exactly 0 -> passed; other non-negative integer -> failed;
            // missing / invalid / ambiguous -> not-run.
            let sitSmokeStatus = 'not-run';
            let sitSmokeExitCode = null;
            try {
              const raw = fs.readFileSync('.simulated-release/sit-smoke.exitcode', 'utf8').trim();
              const n = Number(raw);
              if (raw !== '' && Number.isInteger(n) && n >= 0 && String(n) === raw) {
                sitSmokeExitCode = n;
                sitSmokeStatus = n === 0 ? 'passed' : 'failed';
              }
            } catch (e) {
              sitSmokeStatus = 'not-run';
            }

            let uatPromotionExecuted = false;
            try {
              const u = JSON.parse(fs.readFileSync('.simulated-release/uat-promotion-evidence.json', 'utf8'));
              uatPromotionExecuted =
                u.simulatedPromotion === true &&
                u.realDeploymentPerformed === false &&
                u.promotionSource === 'simulated-SIT' &&
                u.promotionTarget === 'simulated-UAT' &&
                typeof u.sourceCommit === 'string' && u.sourceCommit !== '' &&
                u.sourceCommit === process.env.GIT_COMMIT;
            } catch (e) {
              uatPromotionExecuted = false;
            }
            const uatPromotionStatus = uatPromotionExecuted ? 'executed' : (deploymentAuthorization.status === 'approved' ? 'blocked' : 'not-run');

            const releaseValidated =
              qualityGate.sanityStatus === 'passed' &&
              deploymentAuthorization.status === 'approved' &&
              sitDeploymentExecuted === true &&
              sitSmokeStatus === 'passed' &&
              uatPromotionExecuted === true;

            const promotionChain = [
              { gate: 'sanity', status: qualityGate.sanityStatus },
              { gate: 'deploymentAuthorization', status: deploymentAuthorization.status },
              { gate: 'sitDeployment', status: sitDeploymentExecuted ? 'executed' : 'not-run' },
              { gate: 'sitSmoke', status: sitSmokeStatus },
              { gate: 'uatPromotion', status: uatPromotionStatus }
            ];

            const evidence = {
              sourceCommit: process.env.GIT_COMMIT,
              sourceBranch: process.env.BRANCH_NAME,
              jenkinsBuildNumber: process.env.BUILD_NUMBER,
              simulatedRelease: true,
              realDeploymentPerformed: false,
              qualityGate: qualityGate,
              deploymentAuthorization: deploymentAuthorization,
              sit: {
                deploymentExecuted: sitDeploymentExecuted,
                validationStatus: sitSmokeStatus,
                validationExitCode: sitSmokeExitCode,
                validationScope: 'Smoke suite (@smoke) validation at the simulated SIT gate against the reference ServeRest target. Does not validate a newly deployed SIT application instance.'
              },
              uat: {
                promotionExecuted: uatPromotionExecuted,
                promotionStatus: uatPromotionStatus,
                validationExitCode: null,
                validationScope: 'Evidence-only simulated promotion, granted on the SIT Smoke result already recorded in this build. No second Cypress execution was performed and no real UAT environment was contacted.'
              },
              promotionChain: promotionChain,
              releaseValidated: releaseValidated,
              releaseValidatedMeaning: 'true only when Main Sanity passed, deployment was explicitly authorized, the simulated SIT deployment marker belongs to this build/commit, SIT Smoke passed, and simulated UAT promotion executed. It does not imply a real deployment, a real SIT/UAT environment, or production readiness.',
              finalEvidenceScope: 'Simulated release, deployment authorization decision, simulated SIT/UAT promotion markers, and SIT Smoke result for this main build. No real deployment infrastructure was contacted.',
              environmentLimitation: 'This repository is a QA automation laboratory with no owned DEV, SIT, UAT, PREPROD, or PROD deployment environment.',
              noRealDeploymentStatement: 'No real SIT or UAT environment was contacted at any stage of this pipeline.',
              timestampUtc: new Date().toISOString()
            };
            fs.writeFileSync('.simulated-release/release-evidence.json', JSON.stringify(evidence, null, 2));
            console.log('release-evidence.json written. releaseValidated=' + releaseValidated);
          "
        '''
        archiveArtifacts artifacts: '.simulated-release/**', allowEmptyArchive: true
      }
    }

    stage('Regression Tests') {
      options { timeout(time: 15, unit: 'MINUTES') }
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
    unstable {
      echo 'Pipeline finished UNSTABLE - check whether this is an unanswered deployment authorization window.'
    }
    failure {
      archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
      echo 'Pipeline failed. Please check the Console Output for details.'
    }
  }
}
