import { defineConfig } from 'cypress'

export default defineConfig({
  
  e2e: {
    'baseUrl': 'http://localhost:4200'
  },
  
  
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
    setupNodeEvents(on, config) {
      on('task', {
        /** Logs `message` to the terminal. Does not output on test failure. */
        log(message: string) {
          console.log(message);
        },
      });
    },
  }
  
})
