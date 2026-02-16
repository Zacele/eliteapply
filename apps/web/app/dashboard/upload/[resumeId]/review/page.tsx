"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { parsedResumeSchema, type ParsedResume } from "@/lib/validators/parsed-resume-schema";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as Id<"resumes">;

  const resume = useQuery(api.resumes.get, { id: resumeId });
  const extractText = useAction(api.actions.extractPdfText.extractText);
  const batchInsert = useMutation(api.batchInsertParsedResumeData.batchInsert);

  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Parse the JSON when resume has parsedData
  useEffect(() => {
    if (resume?.parsedData) {
      try {
        const raw = JSON.parse(resume.parsedData);
        const validated = parsedResumeSchema.parse(raw);
        setParsedData(validated);
        setParseError(null);
      } catch (err) {
        setParseError("Failed to validate parsed data. You can still save manually.");
        console.error(err);
      }
    }
  }, [resume?.parsedData]);

  const handleSaveToProfile = async () => {
    if (!parsedData) return;
    setSaving(true);
    try {
      await batchInsert({
        resumeId,
        profile: parsedData.profile,
        experiences: parsedData.experiences,
        education: parsedData.education,
        skills: parsedData.skills,
        certifications: parsedData.certifications,
        projects: parsedData.projects,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save profile data.");
    } finally {
      setSaving(false);
    }
  };

  if (!resume) {
    return <p className="text-muted-foreground">Loading resume...</p>;
  }

  // Processing states
  if (["uploaded", "extracting", "parsing"].includes(resume.status)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-lg font-medium">
          {resume.status === "uploaded" && "Starting extraction..."}
          {resume.status === "extracting" && "Extracting text from PDF..."}
          {resume.status === "parsing" && "AI is parsing your resume..."}
        </p>
        <p className="text-sm text-muted-foreground">This usually takes 10-30 seconds</p>
      </div>
    );
  }

  // Failed state
  if (resume.status === "failed") {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-lg font-medium text-red-600">Processing Failed</p>
        <p className="text-muted-foreground">{resume.errorMessage || "Unknown error"}</p>
        <Button onClick={() => extractText({ resumeId }).catch(console.error)}>Retry</Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/upload")}>
          Upload Different Resume
        </Button>
      </div>
    );
  }

  // Complete — show parsed data
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Review Parsed Resume</h1>
          <p className="text-muted-foreground">Review the extracted data and save to your profile.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => extractText({ resumeId }).catch(console.error)}>
            Re-parse
          </Button>
          <Button onClick={handleSaveToProfile} disabled={saving || !parsedData}>
            {saving ? "Saving..." : "Save to Profile"}
          </Button>
        </div>
      </div>

      {parseError && (
        <Card className="border-yellow-500">
          <CardContent className="p-4 text-yellow-700">{parseError}</CardContent>
        </Card>
      )}

      {parsedData && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Profile */}
          <Card>
            <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Name:</strong> {parsedData.profile.name}</p>
              {parsedData.profile.email && <p><strong>Email:</strong> {parsedData.profile.email}</p>}
              {parsedData.profile.phone && <p><strong>Phone:</strong> {parsedData.profile.phone}</p>}
              {parsedData.profile.location && <p><strong>Location:</strong> {parsedData.profile.location}</p>}
              {parsedData.profile.summary && <p><strong>Summary:</strong> {parsedData.profile.summary}</p>}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader><CardTitle>Experience ({parsedData.experiences.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {parsedData.experiences.map((exp, i) => (
                <div key={i}>
                  <p className="font-medium">{exp.title} at {exp.company}</p>
                  <p className="text-muted-foreground">{exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}</p>
                  {i < parsedData.experiences.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
              {parsedData.experiences.length === 0 && <p className="text-muted-foreground">None found</p>}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader><CardTitle>Education ({parsedData.education.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {parsedData.education.map((edu, i) => (
                <div key={i}>
                  <p className="font-medium">{edu.degree} in {edu.field}</p>
                  <p className="text-muted-foreground">{edu.school} · {edu.startDate} — {edu.endDate}</p>
                  {i < parsedData.education.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
              {parsedData.education.length === 0 && <p className="text-muted-foreground">None found</p>}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader><CardTitle>Skills ({parsedData.skills.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.map((skill, i) => (
                  <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
                    {skill.name}
                  </span>
                ))}
              </div>
              {parsedData.skills.length === 0 && <p className="text-sm text-muted-foreground">None found</p>}
            </CardContent>
          </Card>

          {/* Certifications */}
          {parsedData.certifications && parsedData.certifications.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Certifications</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {parsedData.certifications.map((cert, i) => (
                  <p key={i}>{cert.name} — {cert.issuer}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {parsedData.projects && parsedData.projects.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {parsedData.projects.map((proj, i) => (
                  <div key={i}>
                    <p className="font-medium">{proj.name}</p>
                    {proj.description && <p className="text-muted-foreground">{proj.description}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
