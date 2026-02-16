"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Profile {
  _id: any;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export function EditableProfileCard({ profile }: { profile: Profile | null }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    summary: profile?.summary ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    websiteUrl: profile?.websiteUrl ?? "",
  });
  const upsert = useMutation(api.profiles.upsertProfile);

  const handleSave = async () => {
    await upsert(form);
    setEditing(false);
  };

  if (!profile && !editing) {
    return (
      <Card>
        <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No profile yet.</p>
          <Button className="mt-2" size="sm" onClick={() => setEditing(true)}>Add Info</Button>
        </CardContent>
      </Card>
    );
  }

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Info</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} />
          <textarea className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Summary" rows={3} value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})} />
          <Input placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={(e) => setForm({...form, linkedinUrl: e.target.value})} />
          <Input placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm({...form, websiteUrl: e.target.value})} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Personal Info</CardTitle>
          <Button size="sm" variant="outline" onClick={() => { setForm({ name: profile!.name, email: profile!.email ?? "", phone: profile!.phone ?? "", location: profile!.location ?? "", summary: profile!.summary ?? "", linkedinUrl: profile!.linkedinUrl ?? "", websiteUrl: profile!.websiteUrl ?? "" }); setEditing(true); }}>Edit</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="text-lg font-semibold">{profile!.name}</p>
        {profile!.email && <p>{profile!.email}</p>}
        {profile!.phone && <p>{profile!.phone}</p>}
        {profile!.location && <p className="text-muted-foreground">{profile!.location}</p>}
        {profile!.summary && <p className="mt-2">{profile!.summary}</p>}
      </CardContent>
    </Card>
  );
}
