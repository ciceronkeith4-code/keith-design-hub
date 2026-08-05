import { useId, type SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement>;

export function PhotoshopMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} {...props}>
      <rect x="1.5" y="1.5" width="45" height="45" rx="10" fill="#001E36" />
      <text
        x="24"
        y="32.5"
        fill="#31A8FF"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="24"
        fontWeight="800"
        letterSpacing="-1.6"
        textAnchor="middle"
      >
        Ps
      </text>
    </svg>
  );
}

export function AntigravityMark({ className, ...props }: MarkProps) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} {...props}>
      <defs>
        <linearGradient id={gradientId} x1="13" y1="5" x2="37" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5B36" />
          <stop offset="0.26" stopColor="#F2D94E" />
          <stop offset="0.5" stopColor="#62D67A" />
          <stop offset="0.73" stopColor="#2E8CFF" />
          <stop offset="1" stopColor="#4776F5" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="10" fill="#15161D" />
      <path
        d="M5.5 39.6C10.1 36.8 12.8 28.6 16 16.8C17.9 9.8 20.3 6.2 24.1 6.2C28.6 6.2 30.9 10.2 32.8 16.8C36 28.2 38.6 36.5 43 39.6C44.6 40.8 43.8 43.2 41.8 42.8C35.8 41.7 32.5 35.7 29.5 29.4C27.7 25.6 26 22.5 23.8 22.5C21.7 22.5 20.1 25.6 18.2 29.4C15.1 35.8 11.8 41.7 6.6 42.8C4.5 43.2 3.8 40.8 5.5 39.6Z"
        fill={"url(#" + gradientId + ")"}
      />
    </svg>
  );
}
