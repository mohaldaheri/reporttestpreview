import saadaLogo from "@/assets/hayyakum-logo.png";
import circleOrnament from "@/assets/circle-ornament.png";
import khumasiaLogo from "@/assets/khumasia-logo.png";
import hayyakumLogo from "@/assets/hayyakum-white-logo.png";

function LogoPlaceholder({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 shadow-sm backdrop-blur-sm ${className}`}
    >
      <div className="whitespace-pre-line text-center text-xs font-semibold leading-tight text-primary-foreground md:text-sm">
        {text}
      </div>
    </div>
  );
}

export default function ReportHeader({ compact = false, fixedLayout = false }: { compact?: boolean; fixedLayout?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden text-primary-foreground ${
        compact
          ? fixedLayout
            ? "rounded-t-[32px] px-7 pb-5 pt-5"
            : "rounded-t-3xl px-6 pb-4 pt-4 md:px-7 md:pb-5 md:pt-5"
          : "px-6 py-5 md:px-8 md:py-6"
      }`}
      style={{
        background: `#54AE78`,
      }}
    >
      {/* Ornament on the left side */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-0 flex items-center" style={{ transform: 'translateX(-30%)' }}>
        <img
          src={circleOrnament}
          alt=""
          className="h-[160%] w-auto opacity-30"
          style={{ filter: "brightness(0.55) saturate(0)" }}
        />
      </div>
      <div className="absolute inset-0 bg-foreground/5" />

      {/* All three logos on a single horizontal line with thin dividers */}
      <div className="relative flex w-full items-center justify-between gap-2 md:gap-4">
        {/* Hayyakum on the right (RTL start) */}
        <img
          src={hayyakumLogo}
          alt="حياكم الله"
          className={
            fixedLayout
              ? (compact ? "h-20 w-auto shrink-0" : "h-24 w-auto shrink-0")
              : (compact ? "h-16 w-auto shrink-0 md:h-20" : "h-20 w-auto shrink-0 md:h-24")
          }
        />

        {/* Thin elegant divider */}
        <div
          className={
            fixedLayout
              ? "h-16 w-px shrink-0 bg-primary-foreground/40"
              : "h-12 w-px shrink-0 bg-primary-foreground/40 md:h-16"
          }
        />

        {/* Saada (center) */}
        <img
          src={saadaLogo}
          alt="فريق السعادة"
          className={
            fixedLayout
              ? "h-16 w-auto shrink-0"
              : "h-12 w-auto shrink-0 md:h-16"
          }
        />

        {/* Thin elegant divider */}
        <div
          className={
            fixedLayout
              ? "h-16 w-px shrink-0 bg-primary-foreground/40"
              : "h-12 w-px shrink-0 bg-primary-foreground/40 md:h-16"
          }
        />

        {/* Khumasia (left) — same size as Saada */}
        <img
          src={khumasiaLogo}
          alt="الخماسية السعودية"
          className={
            fixedLayout
              ? "h-16 w-auto shrink-0"
              : "h-12 w-auto shrink-0 md:h-16"
          }
        />
      </div>

      <div className="relative mt-4 text-right">
        <div className={fixedLayout ? "text-2xl font-semibold" : "text-base font-semibold md:text-2xl"}>
          الخماسية السعودية لخدمات حجاج الداخل
        </div>
        <div className={fixedLayout ? "mt-1 text-base font-bold text-brand-brown" : "mt-1 text-sm font-bold text-brand-brown md:text-base"}>
          تقرير فعالية
        </div>
      </div>
    </div>
  );
}
