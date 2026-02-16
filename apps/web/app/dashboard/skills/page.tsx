"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = ["technical", "soft", "tool", "language"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<Category, string> = {
  technical: "Technical",
  soft: "Soft Skills",
  tool: "Tools",
  language: "Languages",
};

export default function SkillsPage() {
  const skills = useQuery(api.skills.list);
  const addSkill = useMutation(api.skills.add);
  const removeSkill = useMutation(api.skills.remove);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("technical");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addSkill({ name: newName.trim(), category: newCategory });
    setNewName("");
    setAdding(false);
  };

  const handleDelete = async (id: any) => {
    await removeSkill({ id });
  };

  const skillsByCategory = (cat: Category) =>
    skills?.filter((s: any) => s.category === cat) ?? [];

  if (skills === undefined) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Skills</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading skills...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-muted-foreground">{skills?.length ?? 0} skills total</p>
        </div>
        <Button onClick={() => setAdding(true)}>+ Add Skill</Button>
      </div>

      {adding && (
        <Card>
          <CardContent className="flex items-end gap-3 p-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Skill Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. React, Python, Leadership"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <Button onClick={handleAdd}>Add</Button>
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({skills?.length ?? 0})</TabsTrigger>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {CATEGORY_LABELS[cat]} ({skillsByCategory(cat).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {skills?.map((skill: any) => (
              <Badge key={skill._id} variant="secondary" className="gap-1 pr-1 text-sm">
                {skill.name}
                <button
                  onClick={() => handleDelete(skill._id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                  aria-label={`Delete ${skill.name}`}
                >
                  ×
                </button>
              </Badge>
            ))}
            {skills?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No skills yet. Upload a resume or add manually.
              </p>
            )}
          </div>
        </TabsContent>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <div className="flex flex-wrap gap-2">
              {skillsByCategory(cat).map((skill: any) => (
                <Badge key={skill._id} variant="secondary" className="gap-1 pr-1 text-sm">
                  {skill.name}
                  <button
                    onClick={() => handleDelete(skill._id)}
                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                    aria-label={`Delete ${skill.name}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {skillsByCategory(cat).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No {CATEGORY_LABELS[cat].toLowerCase()} yet.
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
