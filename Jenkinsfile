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

    // main: post-merge CI today; CD stages will be added here later.
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

    stage('Regression Tests') {
      when {
        expression { env.CHANGE_ID != null }
      }
      steps {
        sh 'npm run cy:run:regression'
      }
    }

    // TEMPORARY — controlled negative validation of the Jenkins PR quality
    // gate publication to GitHub. Remove after the gate-failure test PR
    // has been observed and validated.
    stage('Controlled Gate Failure') {
      when {
        expression { env.CHANGE_ID != null }
      }
      steps {
        echo 'INTENTIONAL FAILURE: validating Jenkins PR quality gate publication.'
        sh 'exit 1'
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
