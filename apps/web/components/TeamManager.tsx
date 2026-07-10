"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { NativeSelect } from "./ui/select";
import { Badge } from "./ui/badge";
import { addMember, removeMember } from "../lib/member-actions";
import type { MemberDto } from "../lib/catalog";

const addMemberSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["EDITOR", "REVIEWER"]),
});
type AddMemberValues = z.infer<typeof addMemberSchema>;

export function TeamManager({
  publisherId,
  publisherName,
  initialMembers,
}: {
  publisherId: string;
  publisherName: string;
  initialMembers: MemberDto[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [serverError, setServerError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberValues>({ resolver: zodResolver(addMemberSchema) });

  async function onSubmit(values: AddMemberValues) {
    setServerError(undefined);
    const result = await addMember(publisherId, values.email, values.role);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    reset();
    setMembers((prev) => [...prev, result.member]);
  }

  function handleRemove(memberId: string) {
    if (!window.confirm("Remove this person from your team?")) return;
    startTransition(async () => {
      await removeMember(publisherId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/60 p-4">
      <div className="flex items-center gap-2">
        <Users className="size-4 shrink-0 text-muted-foreground" />
        <p className="truncate text-sm font-medium">{publisherName}</p>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No editors or reviewers yet — add one below. They must already hold that role globally
          (an admin grants this from Superadmin Controls) before you can invite them onto your team.
        </p>
      ) : (
        <ul className="divide-y divide-border/40">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline">{member.role}</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  className="text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => handleRemove(member.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 sm:flex-row sm:items-end" noValidate>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`member-email-${publisherId}`}>Email</Label>
          <Input id={`member-email-${publisherId}`} placeholder="editor@example.com" {...field("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`member-role-${publisherId}`}>Role</Label>
          <NativeSelect id={`member-role-${publisherId}`} defaultValue="EDITOR" {...field("role")}>
            <option value="EDITOR">Editor</option>
            <option value="REVIEWER">Reviewer</option>
          </NativeSelect>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          <UserPlus className="size-3.5" /> {isSubmitting ? "Adding…" : "Add"}
        </Button>
      </form>
    </div>
  );
}
