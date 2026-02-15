/** Extracts job description text from the current page using multiple strategies */

/** Platform-specific CSS selectors for known job boards */
const PLATFORM_SELECTORS: Record<string, string[]> = {
  'linkedin.com': [
    '.jobs-description__content',
    '.jobs-box__html-content',
    '.description__text',
    '[class*="job-description"]',
  ],
  'indeed.com': [
    '#jobDescriptionText',
    '.jobsearch-jobDescriptionText',
    '[class*="jobDescription"]',
  ],
  'glassdoor.com': [
    '.jobDescriptionContent',
    '[class*="JobDescription"]',
    '.desc',
  ],
  'greenhouse.io': [
    '#content',
    '.job__description',
    '[class*="job-description"]',
  ],
  'lever.co': [
    '.posting-page',
    '[class*="posting-description"]',
    '.content',
  ],
  'upwork.com': [
    '[data-test="Description"]',
    '.job-description',
    '[class*="description"]',
  ],
  'fiverr.com': [
    '.description-content',
    '[class*="description"]',
  ],
};

/** Try to extract via user's text selection first */
function getSelectedText(): string | null {
  const selection = window.getSelection()?.toString().trim();
  return selection && selection.length > 50 ? selection : null;
}

/** Try platform-specific selectors based on current hostname */
function extractByPlatformSelectors(): string | null {
  const hostname = window.location.hostname;

  for (const [domain, selectors] of Object.entries(PLATFORM_SELECTORS)) {
    if (!hostname.includes(domain)) continue;

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text && text.length > 50) return text;
    }
  }

  return null;
}

/** Generic fallback: find the largest text block on the page */
function extractLargestTextBlock(): string | null {
  const candidates = document.querySelectorAll(
    'article, main, [role="main"], .content, .description, .job-description, .posting-description',
  );

  let best = '';
  for (const el of candidates) {
    const text = el.textContent?.trim() ?? '';
    if (text.length > best.length) best = text;
  }

  // Fallback to body's largest direct section
  if (best.length < 100) {
    const sections = document.querySelectorAll('section, div[class*="description"], div[class*="content"]');
    for (const el of sections) {
      const text = el.textContent?.trim() ?? '';
      if (text.length > best.length && text.length < 10000) best = text;
    }
  }

  return best.length > 50 ? best : null;
}

/** Main extraction function: tries 3 strategies in order */
export function extractJobDescription(): string | null {
  // 1. User's manual text selection (highest priority)
  const selected = getSelectedText();
  if (selected) return selected;

  // 2. Platform-specific CSS selectors
  const platform = extractByPlatformSelectors();
  if (platform) return platform;

  // 3. Generic largest text block
  return extractLargestTextBlock();
}
