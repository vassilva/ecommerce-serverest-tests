pipeline {
  agent none

  stages {
    stage('Cypress (docker)') {
      agent {
        docker {
          image 'cypress/included:13.6.0'
          args '--ipc=host'
        }
      }

      environment {
        CYPRESS_baseUrl = 'https://front.serverest.dev'
      }

      steps {
        checkout scm
        sh 'npm ci'
        sh 'npx cypress run'
      }

      post {
        always {
          archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
        }
      }
    }
  }
}
