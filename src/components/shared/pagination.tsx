import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = { ...searchParams, page: page > 1 ? String(page) : undefined };
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </p>
      <div className="flex gap-2">
        {currentPage > 1 ? (
          <Link href={buildHref(currentPage - 1)}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
        )}
        {currentPage < totalPages ? (
          <Link href={buildHref(currentPage + 1)}>
            <Button variant="outline" size="sm">
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
