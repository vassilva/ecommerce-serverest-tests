pipeline {
  agent {
    docker {
      image 'cypress/included:15.8.2'
      args '--ipc=host --entrypoint='
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
        /* * catchError prevents the pipeline from failing if there are linting issues.
         * The stage will be marked as UNSTABLE (yellow) instead of FAILED (red).
         */
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
            sh 'npm run lint'
        }
      }
    }

    stage('Format check') {
      steps {
        /* * Validates code style using Prettier. 
         * If formatting issues are found, the pipeline continues to the Tests stage.
         */
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
            sh 'npm run format:check'
        }
      }
    }

    stage('Tests') {
      steps {
        // Executes the automated tests in headless mode
        sh 'npm run test'
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
        echo 'Pipeline finished with warnings (check Lint or Format stages).'
    }
    failure {
        echo 'Pipeline failed. Please check the Console Output for details.'
    }
  }
}