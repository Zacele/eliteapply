"use client";
import { Progress } from "@/components/ui/progress";

interface ProfileCompletenessProps {
  hasProfile: boolean;
  experienceCount: number;
  educationCount: number;
  skillCount: number;
  certificationCount: number;
  projectCount: number;
}

export function ProfileCompletenessBar(props: ProfileCompletenessProps) {
  const sections = [
    props.hasProfile,
    props.experienceCount > 0,
    props.educationCount > 0,
    props.skillCount > 0,
    props.certificationCount > 0,
    props.projectCount > 0,
  ];
  const completed = sections.filter(Boolean).length;
  const percentage = Math.round((completed / sections.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Profile Completeness</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} />
      <p className="text-xs text-muted-foreground">
        {completed}/{sections.length} sections filled
      </p>
    </div>
  );
}
