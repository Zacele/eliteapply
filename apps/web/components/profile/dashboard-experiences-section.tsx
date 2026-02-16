"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Experience {
  _id: any;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export function DashboardExperiencesSection({ experiences }: { experiences: Experience[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [form, setForm] = useState({ company: "", title: "", startDate: "", endDate: "", isCurrent: false, description: "" });

  const add = useMutation(api.experiences.add);
  const update = useMutation(api.experiences.update);
  const remove = useMutation(api.experiences.remove);

  const handleAdd = async () => {
    await add({ ...form, endDate: form.endDate || undefined, description: form.description || undefined });
    setForm({ company: "", title: "", startDate: "", endDate: "", isCurrent: false, description: "" });
    setAdding(false);
  };

  const handleUpdate = async (id: any) => {
    await update({ id, ...form, endDate: form.endDate || undefined, description: form.description || undefined });
    setEditingId(null);
  };

  const handleDelete = async (id: any) => {
    if (confirm("Delete this experience?")) {
      await remove({ id });
    }
  };

  const startEdit = (exp: Experience) => {
    setForm({ company: exp.company, title: exp.title, startDate: exp.startDate, endDate: exp.endDate ?? "", isCurrent: exp.isCurrent, description: exp.description ?? "" });
    setEditingId(exp._id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Experience</CardTitle>
          <Button size="sm" onClick={() => setAdding(true)}>+ Add</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <div className="space-y-2 rounded-md border p-3">
            <Input placeholder="Company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} />
            <Input placeholder="Job Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
            <div className="flex gap-2">
              <Input type="month" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
              <Input type="month" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} disabled={form.isCurrent} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isCurrent} onChange={(e) => setForm({...form, isCurrent: e.target.checked})} />
              Currently working here
            </label>
            <textarea className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {experiences.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No experience yet. Upload resume or add manually.</p>
        )}

        {experiences.map((exp) => (
          editingId === exp._id ? (
            <div key={exp._id} className="space-y-2 rounded-md border p-3">
              <Input placeholder="Company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} />
              <Input placeholder="Job Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
              <div className="flex gap-2">
                <Input type="month" placeholder="Start Date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
                <Input type="month" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} disabled={form.isCurrent} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isCurrent} onChange={(e) => setForm({...form, isCurrent: e.target.checked})} />
                Currently working here
              </label>
              <textarea className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdate(exp._id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div key={exp._id} className="flex items-start justify-between rounded-md border p-3">
              <div>
                <p className="font-semibold">{exp.title}</p>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                <p className="text-xs text-muted-foreground">
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                </p>
                {exp.description && <p className="mt-1 text-sm">{exp.description}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(exp)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(exp._id)}>Delete</Button>
              </div>
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
}
