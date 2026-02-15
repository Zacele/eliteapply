import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'output',
  manifest: {
    name: 'EliteApply - AI Cover Letter Generator',
    description: 'Generate 3 AI cover letter drafts from any job description',
    version: '0.1.0',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['https://openrouter.ai/*'],
  },
});
