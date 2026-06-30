import Image from "next/image";
import { SITE } from "@/config/site";

export default function Logo({
  className = "",
  width = 260,
  height = 70,
}: {
  className?: string;
  width?: number;
  height?: number;
  variant?: "dark" | "light";
}) {
  return (
    <span
      aria-label={SITE.name}
      className={className}
      style={{
        width,
        height,
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Image
        src="/vava-assets/vava-mark.png"
        alt=""
        width={168}
        height={82}
        priority
        aria-hidden
        style={{ width: "150px", height: "44px", flex: "0 0 auto" }}
      />
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          color: "#0b0d10",
          fontSize: 13,
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: 0,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        <span>Transport</span>
        <span>and Logistics</span>
      </span>
    </span>
  );
}
