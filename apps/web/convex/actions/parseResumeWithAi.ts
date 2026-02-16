"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `You are a resume parser. Extract structured data from the resume text provided.

Return a JSON object with this exact structure:
{
  "profile": {
    "name": "Full Name",
    "email": "email@example.com or null",
    "phone": "phone number or null",
    "location": "City, State/Country or null",
    "summary": "Professional summary or null",
    "linkedinUrl": "LinkedIn URL or null",
    "websiteUrl": "Portfolio/website URL or null"
  },
  "experiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null if current",
      "isCurrent": false,
      "description": "Role description or null",
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree Type (e.g. Bachelor of Science)",
      "field": "Field of Study",
      "startDate": "YYYY",
      "endDate": "YYYY or null",
      "gpa": "GPA or null"
    }
  ],
  "skills": [
    {
      "name": "Skill Name",
      "category": "technical|soft|tool|language"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "issueDate": "YYYY-MM or YYYY"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"]
    }
  ]
}

Rules:
- Extract ONLY information explicitly stated in the resume
- Do NOT hallucinate or guess missing information — use null for missing fields
- Categorize skills: "technical" for programming/frameworks, "tool" for software/tools, "soft" for interpersonal skills, "language" for spoken/written languages
- Use ISO date formats where possible (YYYY-MM or YYYY)
- Some PDFs extract with extra spaces between characters (e.g. "J U LY 2 0 2 2" means "JULY 2022", "S O F T W A R E" means "SOFTWARE"). Reconstruct words and dates from spaced-out text.
- If the end date says "PRESENT" or "present" or similar, set endDate to null and isCurrent to true
- Return valid JSON only`;

/** Internal action — called via scheduler from extractPdfText, no auth context */
export const parseResume = internalAction({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.resumes.internalUpdateStatus, {
        id: args.resumeId,
        status: "failed",
        errorMessage: "OpenRouter API key not configured",
      });
      return { success: false, error: "API key not configured" };
    }

    try {
      // Get resume with raw text (internal — no auth needed)
      const resume = await ctx.runQuery(internal.resumes.internalGet, { id: args.resumeId });
      if (!resume?.rawText) throw new Error("No raw text found");

      // Call OpenRouter
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://eliteapply.app",
          "X-Title": "EliteApply",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Parse this resume:\n\n${resume.rawText}` },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");

      // Store parsed data as JSON string
      await ctx.runMutation(internal.resumes.internalUpdateStatus, {
        id: args.resumeId,
        status: "complete",
        parsedData: content,
        parsedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Parsing failed";
      await ctx.runMutation(internal.resumes.internalUpdateStatus, {
        id: args.resumeId,
        status: "failed",
        errorMessage: message,
      });
      return { success: false, error: message };
    }
  },
});
