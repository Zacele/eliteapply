/** Extracts screening questions from job posting pages */

/** Platform-specific CSS selectors for known job boards */
const PLATFORM_SELECTORS: Record<string, string[]> = {
  'upwork.com': [
    '[data-test="Questions"]',
    '.questions-listing',
    '[class*="questions"]',
    '[class*="screening"]',
  ],
};

/** Keywords indicating a questions section */
const QUESTION_KEYWORDS = [
  'you will be asked to answer the following',
  'screening question',
  'application question',
  'please answer',
];

/** Clean up question text by removing numbering and whitespace */
function cleanQuestionText(text: string): string {
  return text
    .replace(/^\d+\.\s*/, '') // Remove "1. "
    .replace(/^\d+\)\s*/, '') // Remove "1) "
    .replace(/^Q\d+:\s*/i, '') // Remove "Q1: "
    .replace(/^Question\s+\d+:\s*/i, '') // Remove "Question 1: "
    .trim();
}

/** Extract questions from a container element */
function extractQuestionsFromContainer(container: Element): string[] {
  const questions: string[] = [];

  // Try to find list items
  const listItems = container.querySelectorAll('li');
  if (listItems.length > 0) {
    for (const item of listItems) {
      const text = cleanQuestionText(item.textContent?.trim() ?? '');
      if (text.length > 10) {
        questions.push(text);
      }
    }
    if (questions.length > 0) return questions;
  }

  // Try to find numbered paragraphs or divs
  const textElements = container.querySelectorAll('p, div');
  for (const el of textElements) {
    const text = el.textContent?.trim() ?? '';
    // Match lines starting with numbers
    if (/^\d+[.)]\s/.test(text)) {
      const cleaned = cleanQuestionText(text);
      if (cleaned.length > 10) {
        questions.push(cleaned);
      }
    }
  }

  return questions;
}

/** Try to extract using platform-specific selectors */
function extractByPlatformSelectors(): string[] {
  const hostname = window.location.hostname;

  for (const [domain, selectors] of Object.entries(PLATFORM_SELECTORS)) {
    if (!hostname.includes(domain)) continue;

    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (!container) continue;

      const questions = extractQuestionsFromContainer(container);
      if (questions.length > 0) return questions;
    }
  }

  return [];
}

/** Generic extraction: find sections with question keywords */
function extractGeneric(): string[] {
  // Find all text nodes and elements
  const allElements = document.querySelectorAll(
    'section, div, article, main, [role="main"]',
  );

  for (const el of allElements) {
    const text = el.textContent?.toLowerCase() ?? '';

    // Check if this element contains question keywords
    const hasKeyword = QUESTION_KEYWORDS.some((kw) => text.includes(kw));
    if (!hasKeyword) continue;

    // Try to extract questions from this container
    const questions = extractQuestionsFromContainer(el);
    if (questions.length > 0) return questions;
  }

  return [];
}

/** Extract screening questions from the current page */
export function extractScreeningQuestions(): string[] {
  // Try platform-specific selectors first
  const platformQuestions = extractByPlatformSelectors();
  if (platformQuestions.length > 0) return platformQuestions;

  // Fall back to generic extraction
  const genericQuestions = extractGeneric();
  return genericQuestions;
}
