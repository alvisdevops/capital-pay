import { Car } from "lucide-react";

export function LogoIcon({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className={`${dims} rounded-full bg-[#C41E1E] flex items-center justify-center shrink-0`}>
      <Car className={`${iconSize} text-white`} />
    </div>
  );
}

export function LogoBanner({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <LogoIcon size="md" />
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold tracking-wide" style={{ color: "#E5A800", letterSpacing: 1 }}>
              CAPITAL
            </span>
            <span className="text-sm font-extrabold tracking-wide" style={{ color: "#C41E1E", letterSpacing: 1 }}>
              CARS
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Centro de Enseñanza Automovilística
          </p>
        </div>
      </div>
    </div>
  );
}
