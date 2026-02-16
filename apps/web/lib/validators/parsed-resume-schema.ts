import { z } from "zod";

/** Coerce null to undefined so AI-returned nulls pass validation */
const nullableStr = () => z.string().nullish().transform((v) => v ?? undefined);

export const parsedResumeSchema = z.object({
  profile: z.object({
    name: z.string().default(""),
    email: nullableStr(),
    phone: nullableStr(),
    location: nullableStr(),
    summary: nullableStr(),
    linkedinUrl: nullableStr(),
    websiteUrl: nullableStr(),
  }),
  experiences: z.array(z.object({
    company: z.string(),
    title: z.string(),
    startDate: z.string(),
    endDate: nullableStr(),
    isCurrent: z.boolean().default(false),
    description: nullableStr(),
    achievements: z.array(z.string()).nullish().transform((v) => v ?? undefined),
  })).default([]),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string().default(""),
    field: z.string().default(""),
    startDate: z.string().default(""),
    endDate: nullableStr(),
    gpa: nullableStr(),
    description: nullableStr(),
  })).default([]),
  skills: z.array(z.object({
    name: z.string(),
    category: z.enum(["technical", "soft", "tool", "language"]),
    proficiency: nullableStr(),
  })).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().default(""),
    issueDate: z.string().default(""),
    expirationDate: nullableStr(),
    credentialUrl: nullableStr(),
  })).default([]),
  projects: z.array(z.object({
    name: z.string(),
    description: nullableStr(),
    url: nullableStr(),
    technologies: z.array(z.string()).nullish().transform((v) => v ?? undefined),
    startDate: nullableStr(),
    endDate: nullableStr(),
  })).default([]),
});

export type ParsedResume = z.infer<typeof parsedResumeSchema>;
