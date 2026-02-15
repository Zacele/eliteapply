/** OpenRouter API service - sends parallel requests to 3 AI models */

import {
  AI_MODELS,
  type CoverLetterDraft,
  type QuestionAnswer,
} from './shared-types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 60_000;

function buildPrompt(
  jobDescription: string,
  screeningQuestions?: string[],
): string {
  const basePrompt = `You are a professional cover letter writer. Based on the following job description, write a compelling cover letter.

Requirements:
- Professional but personable tone
- Highlight relevant skills that match the job requirements
- Keep it concise (250-350 words)
- Use a standard cover letter format (greeting, body paragraphs, closing)
- Do NOT use placeholder names - write as if from a qualified candidate
- Do NOT include addresses or dates - just the letter body

Job Description:
${jobDescription}`;

  if (!screeningQuestions || screeningQuestions.length === 0) {
    return `${basePrompt}\n\nWrite the cover letter now:`;
  }

  const questionsText = screeningQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n');

  return `${basePrompt}

---

The job posting also includes screening questions that need separate answers.
After writing the cover letter, provide answers to each question below.

Use this exact format:
[COVER_LETTER]
(your cover letter here)

[QUESTION_ANSWERS]
[Q1] (answer to question 1)
[Q2] (answer to question 2)

Screening Questions:
${questionsText}

Requirements for question answers:
- Answer each question directly and specifically
- Keep each answer 50-150 words
- Reference relevant experience
- Be professional but conversational

Write the cover letter and answers now:`;
}

/** Parse response to extract cover letter and question answers */
function parseResponse(
  content: string,
  screeningQuestions: string[],
): { coverLetter: string; questionAnswers: QuestionAnswer[] } {
  // No questions = entire content is cover letter
  if (screeningQuestions.length === 0) {
    return { coverLetter: content, questionAnswers: [] };
  }

  // Try to split on [QUESTION_ANSWERS] delimiter
  const parts = content.split('[QUESTION_ANSWERS]');

  if (parts.length < 2) {
    // Delimiter not found, treat entire content as cover letter
    return { coverLetter: content, questionAnswers: [] };
  }

  // Extract cover letter (remove [COVER_LETTER] marker if present)
  let coverLetter = parts[0].replace('[COVER_LETTER]', '').trim();

  // Extract question answers
  const answersSection = parts[1];
  const questionAnswers: QuestionAnswer[] = [];

  for (let i = 0; i < screeningQuestions.length; i++) {
    const marker = `[Q${i + 1}]`;
    const nextMarker = `[Q${i + 2}]`;

    const startIdx = answersSection.indexOf(marker);
    if (startIdx === -1) continue;

    const endIdx =
      answersSection.indexOf(nextMarker) !== -1
        ? answersSection.indexOf(nextMarker)
        : answersSection.length;

    const answer = answersSection
      .substring(startIdx + marker.length, endIdx)
      .trim();

    if (answer) {
      questionAnswers.push({
        question: screeningQuestions[i],
        answer,
      });
    }
  }

  return { coverLetter, questionAnswers };
}

async function callModel(
  modelId: string,
  modelLabel: string,
  prompt: string,
  apiKey: string,
  screeningQuestions: string[],
): Promise<CoverLetterDraft> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://eliteapply.app',
        'X-Title': 'EliteApply',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content ?? '';

    if (!rawContent) {
      throw new Error('Empty response from model');
    }

    const { coverLetter, questionAnswers } = parseResponse(
      rawContent,
      screeningQuestions,
    );

    return {
      model: modelId,
      modelLabel,
      content: coverLetter,
      status: 'success',
      durationMs: Date.now() - startTime,
      questionAnswers:
        questionAnswers.length > 0 ? questionAnswers : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      model: modelId,
      modelLabel,
      content: '',
      status: 'error',
      error: message,
      durationMs: Date.now() - startTime,
    };
  }
}

/** Call all 3 models in parallel, return results (never throws) */
export async function generateCoverLetters(
  jobDescription: string,
  apiKey: string,
  screeningQuestions: string[] = [],
): Promise<CoverLetterDraft[]> {
  const prompt = buildPrompt(jobDescription, screeningQuestions);

  const results = await Promise.allSettled(
    AI_MODELS.map((m) =>
      callModel(m.id, m.label, prompt, apiKey, screeningQuestions),
    ),
  );

  return results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          model: 'unknown',
          modelLabel: 'Unknown',
          content: '',
          status: 'error' as const,
          error: r.reason?.message ?? 'Request failed',
        },
  );
}
