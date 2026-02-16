"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProfileCompletenessBar } from "@/components/profile/profile-completeness-bar";
import { EditableProfileCard } from "@/components/profile/editable-profile-card";
import { DashboardExperiencesSection } from "@/components/profile/dashboard-experiences-section";
import { DashboardEducationSection } from "@/components/profile/dashboard-education-section";
import { DashboardSkillsOverview } from "@/components/profile/dashboard-skills-overview";
import { DashboardCertificationsSection } from "@/components/profile/dashboard-certifications-section";
import { DashboardProjectsSection } from "@/components/profile/dashboard-projects-section";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const profile = useQuery(api.profiles.getProfile);
  const experiences = useQuery(api.experiences.list);
  const education = useQuery(api.education.list);
  const skills = useQuery(api.skills.list);
  const certifications = useQuery(api.certifications.list);
  const projects = useQuery(api.projects.list);

  if (profile === undefined || experiences === undefined || education === undefined ||
      skills === undefined || certifications === undefined || projects === undefined) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile Hub</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume to get started, or manage your profile sections below.
        </p>
      </div>

      <ProfileCompletenessBar
        hasProfile={!!profile}
        experienceCount={experiences.length}
        educationCount={education.length}
        skillCount={skills.length}
        certificationCount={certifications.length}
        projectCount={projects.length}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <EditableProfileCard profile={profile} />
        <DashboardSkillsOverview skills={skills} />
      </div>

      <DashboardExperiencesSection experiences={experiences} />
      <DashboardEducationSection education={education} />
      <DashboardCertificationsSection certifications={certifications} />
      <DashboardProjectsSection projects={projects} />
    </div>
  );
}
