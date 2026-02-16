"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Certification {
  _id: any;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialUrl?: string;
}

export function DashboardCertificationsSection({ certifications }: { certifications: Certification[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [form, setForm] = useState({ name: "", issuer: "", issueDate: "", expirationDate: "", credentialUrl: "" });

  const add = useMutation(api.certifications.add);
  const update = useMutation(api.certifications.update);
  const remove = useMutation(api.certifications.remove);

  const handleAdd = async () => {
    await add({ ...form, expirationDate: form.expirationDate || undefined, credentialUrl: form.credentialUrl || undefined });
    setForm({ name: "", issuer: "", issueDate: "", expirationDate: "", credentialUrl: "" });
    setAdding(false);
  };

  const handleUpdate = async (id: any) => {
    await update({ id, ...form, expirationDate: form.expirationDate || undefined, credentialUrl: form.credentialUrl || undefined });
    setEditingId(null);
  };

  const handleDelete = async (id: any) => {
    if (confirm("Delete this certification?")) {
      await remove({ id });
    }
  };

  const startEdit = (cert: Certification) => {
    setForm({ name: cert.name, issuer: cert.issuer, issueDate: cert.issueDate, expirationDate: cert.expirationDate ?? "", credentialUrl: cert.credentialUrl ?? "" });
    setEditingId(cert._id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Certifications</CardTitle>
          <Button size="sm" onClick={() => setAdding(true)}>+ Add</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <div className="space-y-2 rounded-md border p-3">
            <Input placeholder="Certification Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            <Input placeholder="Issuer" value={form.issuer} onChange={(e) => setForm({...form, issuer: e.target.value})} />
            <div className="flex gap-2">
              <Input type="month" placeholder="Issue Date" value={form.issueDate} onChange={(e) => setForm({...form, issueDate: e.target.value})} />
              <Input type="month" placeholder="Expiration (optional)" value={form.expirationDate} onChange={(e) => setForm({...form, expirationDate: e.target.value})} />
            </div>
            <Input placeholder="Credential URL (optional)" value={form.credentialUrl} onChange={(e) => setForm({...form, credentialUrl: e.target.value})} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {certifications.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No certifications yet. Upload resume or add manually.</p>
        )}

        {certifications.map((cert) => (
          editingId === cert._id ? (
            <div key={cert._id} className="space-y-2 rounded-md border p-3">
              <Input placeholder="Certification Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              <Input placeholder="Issuer" value={form.issuer} onChange={(e) => setForm({...form, issuer: e.target.value})} />
              <div className="flex gap-2">
                <Input type="month" placeholder="Issue Date" value={form.issueDate} onChange={(e) => setForm({...form, issueDate: e.target.value})} />
                <Input type="month" placeholder="Expiration (optional)" value={form.expirationDate} onChange={(e) => setForm({...form, expirationDate: e.target.value})} />
              </div>
              <Input placeholder="Credential URL (optional)" value={form.credentialUrl} onChange={(e) => setForm({...form, credentialUrl: e.target.value})} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdate(cert._id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div key={cert._id} className="flex items-start justify-between rounded-md border p-3">
              <div>
                <p className="font-semibold">{cert.name}</p>
                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                <p className="text-xs text-muted-foreground">
                  Issued: {cert.issueDate}
                  {cert.expirationDate && ` • Expires: ${cert.expirationDate}`}
                </p>
                {cert.credentialUrl && (
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    View Credential
                  </a>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(cert)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(cert._id)}>Delete</Button>
              </div>
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
}
