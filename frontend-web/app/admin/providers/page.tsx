"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BadgeStatus } from "@/components/ui/BadgeStatus";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { getJson, putJson } from "@/lib/api";
import type { Paginated } from "@/types/service";
import type { AuthProfile, User } from "@/types/user";

interface ProviderUser extends User {
  provider_profile?: AuthProfile | null;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderUser[]>([]);
  const [selected, setSelected] = useState<ProviderUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await getJson<Paginated<ProviderUser>>("/admin/providers");
      setProviders(response.data.data);
    } catch {
      setError("Gagal memuat daftar mitra.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function action(provider: ProviderUser, type: "approve" | "reject" | "suspend") {
    setActionLoading(provider.id);
    setError("");
    try {
      const response = await putJson<ProviderUser>(`/admin/providers/${provider.id}/${type}`);
      setSelected(response.data);
      await load();
    } catch {
      setError("Aksi provider gagal diproses.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Provider / Mitra</h1>
        <p className="mt-2 text-sm text-muted">Verifikasi, tolak, suspend, dan lihat detail mitra.</p>
      </div>

      {error ? <Card className="mb-5 border-red-200 bg-red-50 text-sm text-red-700">{error}</Card> : null}

      {loading ? (
        <LoadingState label="Memuat mitra..." />
      ) : providers.length === 0 ? (
        <EmptyState title="Belum ada provider" description="Provider yang mendaftar akan tampil di sini." />
      ) : (
        <DataTable headers={["Nama", "Usaha", "Status user", "Verifikasi", "Aksi"]}>
          {providers.map((provider) => (
            <tr key={provider.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{provider.name}</div>
                <div className="text-xs text-muted">{provider.email}</div>
              </td>
              <td className="px-4 py-3 text-muted">{provider.provider_profile?.business_name || "-"}</td>
              <td className="px-4 py-3">
                <BadgeStatus status={provider.status} />
              </td>
              <td className="px-4 py-3">
                <BadgeStatus status={provider.provider_profile?.verification_status || "pending"} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setSelected(provider)}>
                    Detail
                  </Button>
                  <Button disabled={actionLoading === provider.id} onClick={() => action(provider, "approve")}>
                    Approve
                  </Button>
                  <Button variant="secondary" disabled={actionLoading === provider.id} onClick={() => action(provider, "reject")}>
                    Reject
                  </Button>
                  <Button variant="danger" disabled={actionLoading === provider.id} onClick={() => action(provider, "suspend")}>
                    Suspend
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal title="Detail mitra" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-lg font-semibold text-ink">{selected.name}</div>
              <div className="text-muted">{selected.email}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none">
                <div className="text-xs font-semibold uppercase text-muted">Usaha</div>
                <div className="mt-1 text-ink">{selected.provider_profile?.business_name || "-"}</div>
              </Card>
              <Card className="shadow-none">
                <div className="text-xs font-semibold uppercase text-muted">Rating</div>
                <div className="mt-1 text-ink">
                  {selected.provider_profile?.rating_average || "0.00"} ({selected.provider_profile?.rating_count || 0})
                </div>
              </Card>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => action(selected, "approve")}>Approve</Button>
              <Button variant="secondary" onClick={() => action(selected, "reject")}>
                Reject
              </Button>
              <Button variant="danger" onClick={() => action(selected, "suspend")}>
                Suspend
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
