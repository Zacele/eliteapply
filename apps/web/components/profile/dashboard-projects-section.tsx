"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Project {
  _id: any;
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
}

export function DashboardProjectsSection({ projects }: { projects: Project[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", url: "", technologies: "", startDate: "", endDate: "" });

  const add = useMutation(api.projects.add);
  const update = useMutation(api.projects.update);
  const remove = useMutation(api.projects.remove);

  const handleAdd = async () => {
    const techArray = form.technologies ? form.technologies.split(",").map(t => t.trim()).filter(Boolean) : undefined;
    await add({
      name: form.name,
      description: form.description || undefined,
      url: form.url || undefined,
      technologies: techArray,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined
    });
    setForm({ name: "", description: "", url: "", technologies: "", startDate: "", endDate: "" });
    setAdding(false);
  };

  const handleUpdate = async (id: any) => {
    const techArray = form.technologies ? form.technologies.split(",").map(t => t.trim()).filter(Boolean) : undefined;
    await update({
      id,
      name: form.name,
      description: form.description || undefined,
      url: form.url || undefined,
      technologies: techArray,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined
    });
    setEditingId(null);
  };

  const handleDelete = async (id: any) => {
    if (confirm("Delete this project?")) {
      await remove({ id });
    }
  };

  const startEdit = (proj: Project) => {
    setForm({
      name: proj.name,
      description: proj.description ?? "",
      url: proj.url ?? "",
      technologies: proj.technologies?.join(", ") ?? "",
      startDate: proj.startDate ?? "",
      endDate: proj.endDate ?? ""
    });
    setEditingId(proj._id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <Button size="sm" onClick={() => setAdding(true)}>+ Add</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <div className="space-y-2 rounded-md border p-3">
            <Input placeholder="Project Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            <textarea className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <Input placeholder="Project URL (optional)" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} />
            <Input placeholder="Technologies (comma-separated)" value={form.technologies} onChange={(e) => setForm({...form, technologies: e.target.value})} />
            <div className="flex gap-2">
              <Input type="month" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
              <Input type="month" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {projects.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No projects yet. Upload resume or add manually.</p>
        )}

        {projects.map((proj) => (
          editingId === proj._id ? (
            <div key={proj._id} className="space-y-2 rounded-md border p-3">
              <Input placeholder="Project Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              <textarea className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              <Input placeholder="Project URL (optional)" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} />
              <Input placeholder="Technologies (comma-separated)" value={form.technologies} onChange={(e) => setForm({...form, technologies: e.target.value})} />
              <div className="flex gap-2">
                <Input type="month" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
                <Input type="month" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdate(proj._id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div key={proj._id} className="flex items-start justify-between rounded-md border p-3">
              <div className="flex-1">
                <p className="font-semibold">{proj.name}</p>
                {proj.description && <p className="mt-1 text-sm">{proj.description}</p>}
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    {proj.url}
                  </a>
                )}
                {proj.startDate && (
                  <p className="text-xs text-muted-foreground">
                    {proj.startDate} - {proj.endDate || "Present"}
                  </p>
                )}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {proj.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(proj)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(proj._id)}>Delete</Button>
              </div>
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
}
