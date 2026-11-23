import { cn } from "@/lib/utils";

import { CloudShader } from "@/components/ui/cloud-shader";

const ATMOSPHERE =
  "radial-gradient(ellipse 55% 35% at 100% 62%, rgba(0,199,176,0.20) 0%, rgba(0,199,176,0) 100%), radial-gradient(ellipse 55% 40% at 2% 42%, rgba(192,64,255,0.22) 0%, rgba(192,64,255,0) 100%), radial-gradient(ellipse 80% 40% at 50% -5%, rgba(47,91,255,0.30) 0%, rgba(47,91,255,0) 100%)";

/**
 * The one backdrop every screen shares. Static gradient atmosphere by default;
 * the marketing landing adds the drifting cloud shader. Fixed and
 * pointer-events-none, so it never repaints scroll containers.
 */
export function GlassBackground({
  shader = false,
  className,
}: {
  shader?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#08080C]",
        className,
      )}
      style={{ backgroundImage: ATMOSPHERE, backgroundRepeat: "no-repeat" }}
    >
      {shader ? (
        <CloudShader
          className="absolute inset-0 h-full w-full opacity-60"
          speed={0.3}
          count={3}
          cloudColor="#4C576F"
          skyTopColor="#08080C"
          skyBottomColor="#0A1226"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,8,12,0.35),rgba(8,8,12,0.7))]" />
    </div>
  );
}
