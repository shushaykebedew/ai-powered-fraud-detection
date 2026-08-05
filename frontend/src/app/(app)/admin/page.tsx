"use client";

import { Badge, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, ShieldAlert, Activity, UserCheck, Loader2, ShieldOff } from "lucide-react";
import { useState } from "react";

export default function AdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: api.adminStats });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: api.adminListUsers });

  if (currentUser && currentUser.role !== "admin") {
    return (
      <EmptyState
        icon={ShieldOff}
        title="Admin access required"
        description="Your account doesn't have permission to view this page."
      />
    );
  }

  async function toggleActive(userId: string, isActive: boolean) {
    setActionError(null);
    setPendingId(userId);
    try {
      await api.adminUpdateUser(userId, { is_active: !isActive });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't update user.");
    } finally {
      setPendingId(null);
    }
  }

  async function toggleRole(userId: string, role: string) {
    setActionError(null);
    setPendingId(userId);
    try {
      await api.adminUpdateUser(userId, { role: role === "admin" ? "analyst" : "admin" });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't update user.");
    } finally {
      setPendingId(null);
    }
  }

  const isLoading = statsQuery.isLoading || usersQuery.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Admin</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Platform-wide activity and user management.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-[color:var(--color-text-muted)]" />
        </div>
      ) : (
        <>
          {statsQuery.data && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total users"
                value={statsQuery.data.total_users.toString()}
                icon={Users}
              />
              <StatCard
                label="Active users"
                value={statsQuery.data.active_users.toString()}
                icon={UserCheck}
                tone="safe"
              />
              <StatCard
                label="Total predictions"
                value={statsQuery.data.total_predictions.toLocaleString()}
                icon={Activity}
              />
              <StatCard
                label="Fraud flagged (all users)"
                value={statsQuery.data.total_fraud_flagged.toLocaleString()}
                icon={ShieldAlert}
                tone={statsQuery.data.total_fraud_flagged > 0 ? "danger" : "safe"}
              />
            </div>
          )}

          {actionError && (
            <p className="text-xs text-[color:var(--color-signal-danger)]">{actionError}</p>
          )}

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--color-panel-border)] text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.data?.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isPending = pendingId === u.id;
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-[color:var(--color-panel-border-soft)] last:border-0"
                      >
                        <td className="px-5 py-3">
                          {u.full_name}
                          {isSelf && (
                            <span className="ml-2 text-xs text-[color:var(--color-text-muted)]">
                              (you)
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-[color:var(--color-text-secondary)]">
                          {u.email}
                        </td>
                        <td className="px-5 py-3">
                          <Badge color={u.role === "admin" ? "warn" : "neutral"}>{u.role}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge color={u.is_active ? "safe" : "danger"}>
                            {u.is_active ? "Active" : "Deactivated"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              loading={isPending}
                              onClick={() => toggleRole(u.id, u.role)}
                            >
                              {u.role === "admin" ? "Make analyst" : "Make admin"}
                            </Button>
                            <Button
                              variant={u.is_active ? "danger" : "secondary"}
                              size="sm"
                              disabled={isSelf}
                              loading={isPending}
                              onClick={() => toggleActive(u.id, u.is_active)}
                            >
                              {u.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
