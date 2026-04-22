"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { reabrirCuenta } from "@/actions/cuentas";

export function ReabrirCuentaButton({ cuentaId }: { cuentaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await reabrirCuenta(cuentaId);
    if (result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }
    router.push(`/instructor/cuentas/${cuentaId}/editar`);
    router.refresh();
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      <RefreshCw className="mr-2 h-4 w-4" />
      {loading ? "Reabriendo..." : "Reabrir y editar"}
    </Button>
  );
}
