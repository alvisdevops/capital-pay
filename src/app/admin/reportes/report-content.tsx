"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obtenerResumenGeneral } from "@/actions/reportes";
import { ESTADOS_CUENTA } from "@/lib/constants";
import { type EstadoCuenta } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  porEstado: { estado: EstadoCuenta; cantidad: number; total: number }[];
  porInstructor: { instructorId: string; nombre: string; cantidad: number; total: number }[];
  totalGeneral: { cantidad: number; total: number };
}

export function ReportContent() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData(filtros?: { desde?: string; hasta?: string }) {
    const result = await obtenerResumenGeneral(filtros);
    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    obtenerResumenGeneral().then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleFilter() {
    setLoading(true);
    fetchData({
      desde: desde || undefined,
      hasta: hasta || undefined,
    });
  }

  function handleClear() {
    setDesde("");
    setHasta("");
    setLoading(true);
    fetchData();
  }

  if (loading && !data) {
    return <p className="text-muted-foreground">Cargando reportes...</p>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
        <div className="space-y-1">
          <Label className="text-xs">Desde</Label>
          <Input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hasta</Label>
          <Input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={handleFilter} size="sm">
          Filtrar
        </Button>
        <Button onClick={handleClear} variant="outline" size="sm">
          Limpiar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Cuentas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalGeneral.cantidad}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.totalGeneral.total)}</p>
          </CardContent>
        </Card>
      </div>

      {/* By Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.porEstado.map((row) => (
                <TableRow key={row.estado}>
                  <TableCell>{ESTADOS_CUENTA[row.estado].label}</TableCell>
                  <TableCell className="text-right">{row.cantidad}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* By Instructor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Por Instructor</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.porInstructor.map((row) => (
                <TableRow key={row.instructorId}>
                  <TableCell className="font-medium">{row.nombre}</TableCell>
                  <TableCell className="text-right">{row.cantidad}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
