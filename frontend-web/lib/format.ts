export function formatCurrency(value: number | string | null | undefined): string {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function serviceMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    home_service: "Home service",
    visit_store: "Visit store",
    online_service: "Online service",
  };

  return labels[method] || method;
}
