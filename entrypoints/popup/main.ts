/** Popup main script: handles UI interactions and message passing */

import { getSettings, saveSettings, getLastResult } from '@/utils/storage-helper';
import type { CoverLetterDraft } from '@/utils/shared-types';

// DOM elements
const tabButtons = document.querySelectorAll<HTMLButtonElement>('.tab');
const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');
const btnExtract = document.getElementById('btn-extract') as HTMLButtonElement;
const btnGenerate = document.getElementById('btn-generate') as HTMLButtonElement;
const jdPreview = document.getElementById('jd-preview') as HTMLDivElement;
const jdText = document.getElementById('jd-text') as HTMLTextAreaElement;
const questionsSection = document.getElementById('questions-section') as HTMLDivElement;
const questionsList = document.getElementById('questions-list') as HTMLDivElement;
const btnAddQuestion = document.getElementById('btn-add-question') as HTMLButtonElement;
const generateSection = document.getElementById('generate-section') as HTMLDivElement;
const loading = document.getElementById('loading') as HTMLDivElement;
const results = document.getElementById('results') as HTMLDivElement;
const draftsGrid = document.getElementById('drafts-grid') as HTMLDivElement;
const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
const btnSaveSettings = document.getElementById('btn-save-settings') as HTMLButtonElement;
const settingsStatus = document.getElementById('settings-status') as HTMLParagraphElement;

// Module-level state for current questions
let currentQuestions: string[] = [];

/** Tab switching */
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    tabContents.forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    const tabId = `tab-${btn.dataset.tab}`;
    document.getElementById(tabId)?.classList.add('active');
  });
});

/** Render questions as input rows */
function renderQuestions(questions: string[]) {
  questionsList.innerHTML = '';
  currentQuestions = questions;

  questions.forEach((question, index) => {
    const row = createQuestionRow(question, index);
    questionsList.appendChild(row);
  });

  if (questions.length > 0) {
    questionsSection.classList.remove('hidden');
    generateSection.classList.remove('hidden');
  }
}

/** Create a single question input row */
function createQuestionRow(question: string, index: number): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'question-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'question-input';
  input.value = question;
  input.placeholder = `Question ${index + 1}`;
  input.addEventListener('input', () => {
    currentQuestions[index] = input.value;
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-delete';
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', () => {
    currentQuestions.splice(index, 1);
    renderQuestions(currentQuestions);
  });

  row.appendChild(input);
  row.appendChild(deleteBtn);
  return row;
}

/** Add question button handler */
btnAddQuestion.addEventListener('click', () => {
  currentQuestions.push('');
  renderQuestions(currentQuestions);
  // Focus the new input
  const inputs = questionsList.querySelectorAll<HTMLInputElement>('.question-input');
  inputs[inputs.length - 1]?.focus();
});

/** Extract job description from active tab */
btnExtract.addEventListener('click', async () => {
  btnExtract.disabled = true;
  btnExtract.textContent = 'Extracting...';

  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab found');

    const response = await browser.tabs.sendMessage(tab.id, {
      type: 'EXTRACT_JOB_DESCRIPTION',
    });

    if (response?.data) {
      jdText.value = response.data;
      jdPreview.classList.remove('hidden');
      generateSection.classList.remove('hidden');
    } else {
      jdText.value = '';
      jdPreview.classList.remove('hidden');
      generateSection.classList.remove('hidden');
      jdText.placeholder = 'Could not auto-detect. Please paste the job description manually.';
    }

    // Handle extracted questions
    if (response?.questions && response.questions.length > 0) {
      renderQuestions(response.questions);
    } else {
      // Show empty questions section so users can add manually
      questionsSection.classList.remove('hidden');
    }
  } catch {
    // Content script may not be injected on this page
    jdText.value = '';
    jdPreview.classList.remove('hidden');
    generateSection.classList.remove('hidden');
    questionsSection.classList.remove('hidden');
    jdText.placeholder = 'Could not access page. Please paste the job description manually.';
  }

  btnExtract.disabled = false;
  btnExtract.textContent = 'Extract Job Description';
});

/** Generate cover letters */
btnGenerate.addEventListener('click', async () => {
  const jobDescription = jdText.value.trim();
  if (!jobDescription) {
    alert('Please enter or extract a job description first.');
    return;
  }

  if (jobDescription.length < 50) {
    alert('Job description seems too short. Please provide more detail.');
    return;
  }

  // Collect questions from inputs, filter empty
  const questions = currentQuestions.map((q) => q.trim()).filter((q) => q.length > 0);

  btnGenerate.disabled = true;
  loading.classList.remove('hidden');
  results.classList.add('hidden');

  try {
    const response = await browser.runtime.sendMessage({
      type: 'GENERATE_COVER_LETTERS',
      jobDescription,
      screeningQuestions: questions.length > 0 ? questions : undefined,
    });

    if (response?.type === 'GENERATION_ERROR') {
      throw new Error(response.error);
    }

    if (response?.type === 'GENERATION_RESULT') {
      renderDrafts(response.result.drafts);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed';
    draftsGrid.innerHTML = `<p class="status-msg error" style="grid-column: 1/-1">${escapeHtml(msg)}</p>`;
    results.classList.remove('hidden');
  }

  loading.classList.add('hidden');
  btnGenerate.disabled = false;
});

/** Render the 3 draft cards */
function renderDrafts(drafts: CoverLetterDraft[]) {
  draftsGrid.innerHTML = '';

  for (const draft of drafts) {
    const card = document.createElement('div');
    card.className = `draft-card ${draft.status === 'error' ? 'error' : ''}`;

    const duration = draft.durationMs ? `${(draft.durationMs / 1000).toFixed(1)}s` : '';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'draft-card-header';
    headerDiv.innerHTML = `
      <span class="model-name">${escapeHtml(draft.modelLabel)}</span>
      <span class="duration">${duration}</span>
    `;

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'draft-card-body';

    if (draft.status === 'error') {
      bodyDiv.textContent = `Error: ${draft.error}`;
    } else {
      // Cover letter section
      const coverLetterSection = document.createElement('div');
      coverLetterSection.className = 'cover-letter-section';
      coverLetterSection.textContent = draft.content;
      bodyDiv.appendChild(coverLetterSection);

      // Question answers section (if present)
      if (draft.questionAnswers && draft.questionAnswers.length > 0) {
        const qaSection = document.createElement('div');
        qaSection.className = 'question-answers-section';

        const qaHeading = document.createElement('h4');
        qaHeading.textContent = 'Screening Question Answers';
        qaSection.appendChild(qaHeading);

        for (const qa of draft.questionAnswers) {
          const qaItem = document.createElement('div');
          qaItem.className = 'qa-item';

          const question = document.createElement('div');
          question.className = 'qa-question';
          question.textContent = qa.question;

          const answer = document.createElement('div');
          answer.className = 'qa-answer';
          answer.textContent = qa.answer;

          qaItem.appendChild(question);
          qaItem.appendChild(answer);
          qaSection.appendChild(qaItem);
        }

        bodyDiv.appendChild(qaSection);
      }
    }

    const footerDiv = document.createElement('div');
    footerDiv.className = 'draft-card-footer';

    if (draft.status === 'success') {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'btn btn-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', async () => {
        let copyText = draft.content;

        // Include formatted Q&A if present
        if (draft.questionAnswers && draft.questionAnswers.length > 0) {
          copyText += '\n\n---\nScreening Question Answers:\n\n';
          for (const qa of draft.questionAnswers) {
            copyText += `Q: ${qa.question}\nA: ${qa.answer}\n\n`;
          }
        }

        await navigator.clipboard.writeText(copyText);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
      footerDiv.appendChild(copyBtn);
    }

    card.appendChild(headerDiv);
    card.appendChild(bodyDiv);
    card.appendChild(footerDiv);
    draftsGrid.appendChild(card);
  }

  results.classList.remove('hidden');
}

/** Escape HTML for safe rendering */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Settings: Load saved API key */
async function loadSettings() {
  const settings = await getSettings();
  if (settings.openrouterApiKey) {
    apiKeyInput.value = settings.openrouterApiKey;
  }
}

/** Settings: Save API key */
btnSaveSettings.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showSettingsStatus('Please enter an API key.', 'error');
    return;
  }

  await saveSettings({ openrouterApiKey: apiKey });
  showSettingsStatus('Settings saved!', 'success');
});

function showSettingsStatus(message: string, type: 'success' | 'error') {
  settingsStatus.textContent = message;
  settingsStatus.className = `status-msg ${type}`;
  settingsStatus.classList.remove('hidden');
  setTimeout(() => settingsStatus.classList.add('hidden'), 3000);
}

/** Restore last results on popup open */
async function restoreLastResult() {
  const last = await getLastResult();
  if (last) {
    jdText.value = last.jobDescription;
    jdPreview.classList.remove('hidden');
    generateSection.classList.remove('hidden');

    // Restore questions if present
    if (last.screeningQuestions && last.screeningQuestions.length > 0) {
      renderQuestions(last.screeningQuestions);
    } else {
      questionsSection.classList.remove('hidden');
    }

    renderDrafts(last.drafts);
  }
}

// Init
loadSettings();
restoreLastResult();
