pipeline {
  agent {
    docker {
      image 'cypress/included:15.8.2'
      args '--ipc=host --entrypoint='
    }
  }

  options {
    timeout(time: 15, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  stages {
    stage('Install dependencies') {
      steps {
        checkout scm
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

    stage('Tests') {
      steps {
        sh 'npm run test'
      }
    }
  }
}