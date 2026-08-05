import { memo } from "react";

interface BackgroundFXProps {
  active?: boolean;
}

export const BackgroundFX = memo(function BackgroundFX({ active = true }: BackgroundFXProps) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#252422]">
      <div className="noise absolute inset-0 opacity-[0.025]" />
      <div className="absolute -left-32 top-20 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(235,94,40,0.07),transparent_68%)]" />
      <div className="absolute -right-32 top-[38%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.035),transparent_68%)]" />
      <div className={active ? "absolute left-[18%] top-[62%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(235,94,40,0.04),transparent_70%)] opacity-100 transition-opacity duration-500" : "absolute left-[18%] top-[62%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(235,94,40,0.04),transparent_70%)] opacity-0"} />
    </div>
  );
});
