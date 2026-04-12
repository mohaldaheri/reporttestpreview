import hayyakumLogo from "@/assets/hayyakum-logo.png";
import hajjMinistryLogo from "@/assets/hajj-ministry-logo.svg";

function HeaderPatternBand() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[28%] overflow-hidden">
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          opacity: 0.06,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 40px)`,
        }}
      />
    </div>
  );
}

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

export default function ReportHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden text-primary-foreground ${
        compact
          ? "rounded-t-3xl px-6 pb-4 pt-4 md:px-7 md:pb-5 md:pt-5"
          : "px-6 py-5 md:px-8 md:py-6"
      }`}
      style={{
        background: `linear-gradient(135deg, hsl(var(--brand-green)) 0%, hsl(var(--brand-green-dark)) 100%)`,
      }}
    >
      <HeaderPatternBand />
      <div className="absolute inset-0 bg-foreground/5" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={hajjMinistryLogo}
            alt="وزارة الحج والعمرة"
            className="h-14 w-auto md:h-16"
          />
        </div>

        <div className="flex items-center">
          <img
            src={hayyakumLogo}
            alt="حياكم الله"
            className={compact ? "h-24 w-auto md:h-28" : "h-32 w-auto md:h-36"}
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      </div>

      <div className="relative mt-4 text-right">
        <div className="text-xl font-semibold md:text-2xl">
          الخماسية السعودية لخدمات حجاج الداخل
        </div>
        <div className="mt-1 text-sm font-bold text-brand-beige md:text-base">
          تقرير فعالية
        </div>
      </div>
    </div>
  );
}
