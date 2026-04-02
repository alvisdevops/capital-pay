"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleInstructorActivo } from "@/actions/instructores";

export function ToggleActivoButton({
  instructorId,
  activo,
}: {
  instructorId: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleInstructorActivo(instructorId);
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant={activo ? "destructive" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "..." : activo ? "Desactivar" : "Activar"}
    </Button>
  );
}
