"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Uploaded — extracting text...",
  extracting: "Extracting text from PDF...",
  parsing: "AI is parsing your resume...",
  complete: "Parsing complete!",
  failed: "Processing failed",
};

export default function UploadPage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const createResume = useMutation(api.resumes.create);
  const extractText = useAction(api.actions.extractPdfText.extractText);
  const resumes = useQuery(api.resumes.list);

  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      alert("Please upload a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("File too large. Maximum 20MB.");
      return;
    }

    setUploading(true);
    try {
      // 1. Get upload URL
      const uploadUrl = await generateUploadUrl();

      // 2. Upload file to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await uploadResponse.json();

      // 3. Create resume record
      const resumeId = await createResume({
        fileId: storageId,
        fileName: file.name,
      });

      // 4. Trigger text extraction
      extractText({ resumeId }).catch(console.error);

      // 5. Navigate to review page
      router.push(`/dashboard/upload/${resumeId}/review`);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, createResume, extractText, router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Resume</h1>
      <p className="text-muted-foreground">
        Upload your PDF resume and our AI will extract your profile information.
      </p>

      {/* Upload area */}
      <Card>
        <CardContent className="p-8">
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            } ${uploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-lg font-medium">
              {uploading ? "Uploading..." : "Drop your PDF resume here"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              or click to browse (max 20MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={onFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* Previous uploads */}
      {resumes && resumes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your Resumes</h2>
          {resumes.map((resume) => (
            <Card key={resume._id} className="cursor-pointer hover:bg-accent/50"
              onClick={() => router.push(`/dashboard/upload/${resume._id}/review`)}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{resume.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {STATUS_LABELS[resume.status] || resume.status}
                    {resume.isPrimary && " · Primary"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {resume.status === "complete" && (
                    <span className="text-sm text-green-600">✓ Parsed</span>
                  )}
                  {resume.status === "failed" && (
                    <span className="text-sm text-red-600">✗ Failed</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
