/** Service worker: handles OpenRouter API calls and message routing */

import { generateCoverLetters } from '@/utils/openrouter-api-service';
import { getSettings, saveLastResult } from '@/utils/storage-helper';
import type { ExtensionMessage, GenerationResult } from '@/utils/shared-types';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse) => {
      if (message.type === 'GENERATE_COVER_LETTERS') {
        handleGeneration(
          message.jobDescription,
          message.screeningQuestions ?? [],
        )
          .then((result) => sendResponse({ type: 'GENERATION_RESULT', result }))
          .catch((err) =>
            sendResponse({ type: 'GENERATION_ERROR', error: err.message }),
          );
        // Return true to indicate async response
        return true;
      }
    },
  );
});

async function handleGeneration(
  jobDescription: string,
  screeningQuestions: string[],
): Promise<GenerationResult> {
  const settings = await getSettings();

  if (!settings.openrouterApiKey) {
    throw new Error('OpenRouter API key not configured. Go to Settings tab.');
  }

  const drafts = await generateCoverLetters(
    jobDescription,
    settings.openrouterApiKey,
    screeningQuestions,
  );

  const result: GenerationResult = {
    jobDescription,
    drafts,
    timestamp: Date.now(),
    screeningQuestions,
  };

  await saveLastResult(result);
  return result;
}
