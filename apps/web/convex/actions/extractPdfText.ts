"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

/** Extract text from PDF using unpdf */
export const extractText = action({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    // Update status to extracting (internal — no auth needed)
    await ctx.runMutation(internal.resumes.internalUpdateStatus, {
      id: args.resumeId,
      status: "extracting",
    });

    try {
      // Get resume record (internal — no auth needed)
      const resume = await ctx.runQuery(internal.resumes.internalGet, { id: args.resumeId });
      if (!resume) throw new Error("Resume not found");

      // Get file URL from storage
      const fileUrl = await ctx.storage.getUrl(resume.fileId);
      if (!fileUrl) throw new Error("File not found in storage");

      // Fetch PDF bytes
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();

      // Extract text using unpdf
      const { getDocumentProxy, extractText: extractPdfText } = await import("unpdf");
      const doc = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractPdfText(doc, { mergePages: true });

      if (!text || text.trim().length < 10) {
        throw new Error("Could not extract text from PDF. The file may be image-based.");
      }

      // Save raw text and update status
      await ctx.runMutation(internal.resumes.internalUpdateStatus, {
        id: args.resumeId,
        status: "parsing",
        rawText: text.trim(),
      });

      // Trigger AI parsing via scheduler (runs as internal action)
      await ctx.scheduler.runAfter(0, internal.actions.parseResumeWithAi.parseResume, {
        resumeId: args.resumeId,
      });

      return { success: true, textLength: text.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Extraction failed";
      await ctx.runMutation(internal.resumes.internalUpdateStatus, {
        id: args.resumeId,
        status: "failed",
        errorMessage: message,
      });
      return { success: false, error: message };
    }
  },
});
