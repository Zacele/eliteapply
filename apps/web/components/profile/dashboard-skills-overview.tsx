"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Skill {
  _id: any;
  name: string;
  category: string;
}

export function DashboardSkillsOverview({ skills }: { skills: Skill[] }) {
  const displaySkills = skills.slice(0, 12);
  const hasMore = skills.length > 12;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <Link href="/dashboard/skills">
            <Button size="sm" variant="outline">Manage Skills →</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills yet. Upload resume or add manually.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {displaySkills.map((skill) => (
                <Badge key={skill._id} variant="secondary">
                  {skill.name}
                </Badge>
              ))}
            </div>
            {hasMore && (
              <p className="mt-3 text-sm text-muted-foreground">
                +{skills.length - 12} more skills. <Link href="/dashboard/skills" className="text-blue-600 hover:underline">View all →</Link>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
