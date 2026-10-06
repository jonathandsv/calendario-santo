import { defineConfig, devices } from '@playwright/test';

const PORTA = 4300;

/** Testes de navegador contra o build estático servido localmente (não contra o `ng serve`). */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'celular', use: { ...devices['Pixel 7'] } },
    { name: 'computador', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: `node scripts/servir.mjs ${PORTA}`,
    port: PORTA,
    reuseExistingServer: !process.env['CI'],
  },
});
