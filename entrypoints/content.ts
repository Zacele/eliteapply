/** Content script: extracts job description from the current page */

import { extractJobDescription } from '@/utils/job-description-extractor';
import { extractScreeningQuestions } from '@/utils/screening-questions-extractor';
import type { ExtensionMessage } from '@/utils/shared-types';

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    browser.runtime.onMessage.addListener(
      (message: ExtensionMessage, sender, sendResponse) => {
        // Only accept messages from our own extension
        if (sender.id !== browser.runtime.id) return;
        if (message.type === 'EXTRACT_JOB_DESCRIPTION') {
          try {
            const text = extractJobDescription();
            const questions = extractScreeningQuestions();
            sendResponse({
              type: 'JOB_DESCRIPTION_RESULT',
              data: text,
              questions,
            });
          } catch (err) {
            const errorMsg =
              err instanceof Error ? err.message : 'Extraction failed';
            sendResponse({
              type: 'JOB_DESCRIPTION_RESULT',
              data: null,
              error: errorMsg,
            });
          }
          return true;
        }
      },
    );
  },
});
