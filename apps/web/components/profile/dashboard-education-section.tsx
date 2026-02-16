"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Education {
  _id: any;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export function DashboardEducationSection({ education }: { education: Education[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [form, setForm] = useState({ school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "" });

  const add = useMutation(api.education.add);
  const update = useMutation(api.education.update);
  const remove = useMutation(api.education.remove);

  const handleAdd = async () => {
    await add({ ...form, endDate: form.endDate || undefined, gpa: form.gpa || undefined, description: form.description || undefined });
    setForm({ school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "" });
    setAdding(false);
  };

  const handleUpdate = async (id: any) => {
    await update({ id, ...form, endDate: form.endDate || undefined, gpa: form.gpa || undefined, description: form.description || undefined });
    setEditingId(null);
  };

  const handleDelete = async (id: any) => {
    if (confirm("Delete this education?")) {
      await remove({ id });
    }
  };

  const startEdit = (edu: Education) => {
    setForm({ school: edu.school, degree: edu.degree, field: edu.field, startDate: edu.startDate, endDate: edu.endDate ?? "", gpa: edu.gpa ?? "", description: edu.description ?? "" });
    setEditingId(edu._id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Button size="sm" onClick={() => setAdding(true)}>+ Add</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <div className="space-y-2 rounded-md border p-3">
            <Input placeholder="School" value={form.school} onChange={(e) => setForm({...form, school: e.target.value})} />
            <Input placeholder="Degree" value={form.degree} onChange={(e) => setForm({...form, degree: e.target.value})} />
            <Input placeholder="Field of Study" value={form.field} onChange={(e) => setForm({...form, field: e.target.value})} />
            <div className="flex gap-2">
              <Input type="month" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
              <Input type="month" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} />
            </div>
            <Input placeholder="GPA (optional)" value={form.gpa} onChange={(e) => setForm({...form, gpa: e.target.value})} />
            <textarea className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {education.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No education yet. Upload resume or add manually.</p>
        )}

        {education.map((edu) => (
          editingId === edu._id ? (
            <div key={edu._id} className="space-y-2 rounded-md border p-3">
              <Input placeholder="School" value={form.school} onChange={(e) => setForm({...form, school: e.target.value})} />
              <Input placeholder="Degree" value={form.degree} onChange={(e) => setForm({...form, degree: e.target.value})} />
              <Input placeholder="Field of Study" value={form.field} onChange={(e) => setForm({...form, field: e.target.value})} />
              <div className="flex gap-2">
                <Input type="month" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
                <Input type="month" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} />
              </div>
              <Input placeholder="GPA (optional)" value={form.gpa} onChange={(e) => setForm({...form, gpa: e.target.value})} />
              <textarea className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdate(edu._id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div key={edu._id} className="flex items-start justify-between rounded-md border p-3">
              <div>
                <p className="font-semibold">{edu.degree} in {edu.field}</p>
                <p className="text-sm text-muted-foreground">{edu.school}</p>
                <p className="text-xs text-muted-foreground">
                  {edu.startDate} - {edu.endDate || "Present"}
                </p>
                {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
                {edu.description && <p className="mt-1 text-sm">{edu.description}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(edu)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(edu._id)}>Delete</Button>
              </div>
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
}
