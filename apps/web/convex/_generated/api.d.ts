/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_extractPdfText from "../actions/extractPdfText.js";
import type * as actions_parseResumeWithAi from "../actions/parseResumeWithAi.js";
import type * as batchInsertParsedResumeData from "../batchInsertParsedResumeData.js";
import type * as certifications from "../certifications.js";
import type * as education from "../education.js";
import type * as experiences from "../experiences.js";
import type * as helpers_auth from "../helpers/auth.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as resumes from "../resumes.js";
import type * as skills from "../skills.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/extractPdfText": typeof actions_extractPdfText;
  "actions/parseResumeWithAi": typeof actions_parseResumeWithAi;
  batchInsertParsedResumeData: typeof batchInsertParsedResumeData;
  certifications: typeof certifications;
  education: typeof education;
  experiences: typeof experiences;
  "helpers/auth": typeof helpers_auth;
  profiles: typeof profiles;
  projects: typeof projects;
  resumes: typeof resumes;
  skills: typeof skills;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
