pipeline {
  agent {
    docker {
      image 'cypress/included:13.6.0'
      args '--ipc=host'
    }
  }

  environment {
    CYPRESS_baseUrl = 'https://front.serverest.dev'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Run Cypress') {
      steps { sh 'npx cypress run' }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
    }
  }
}
