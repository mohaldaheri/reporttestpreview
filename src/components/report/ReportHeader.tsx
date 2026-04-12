import hayyakumLogo from "@/assets/hayyakum-logo.png";
import hajjMinistryLogo from "@/assets/hajj-ministry-logo.svg";
import circleOrnament from "@/assets/circle-ornament.svg";
import khumasiaLogo from "@/assets/khumasia-logo.png";
import newHeaderLogo from "@/assets/new-header-logo.png";

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
        background: `#54AE78`,
      }}
    >
      {/* Ornament on the left side */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-0 flex items-center" style={{ transform: 'translateX(-40%)' }}>
        <img
          src={circleOrnament}
          alt=""
          className="h-[140%] w-auto opacity-20"
          style={{ filter: "brightness(0) saturate(100%)" }}
        />
      </div>
      <div className="absolute inset-0 bg-foreground/5" />

      {/* Ministry logo centered on top */}
      <div className="relative flex flex-col items-center gap-3">
        <img
          src={hajjMinistryLogo}
          alt="وزارة الحج والعمرة"
          className="h-14 w-auto md:h-16"
        />
        {/* Khumasia (right) and Hayyakum (left) side by side */}
        <div className="flex w-full items-center justify-between">
          <img
            src={khumasiaLogo}
            alt="الخماسية السعودية"
            className="h-16 w-auto md:h-24"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <img
            src={hayyakumLogo}
            alt="حياكم الله"
            className={compact ? "h-20 w-auto md:h-28" : "h-24 w-auto md:h-36"}
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      </div>

      <div className="relative mt-4 text-right">
        <div className="text-base font-semibold md:text-2xl">
          الخماسية السعودية لخدمات حجاج الداخل
        </div>
        <div className="mt-1 text-sm font-bold text-brand-beige md:text-base">
          تقرير فعالية
        </div>
      </div>
    </div>
  );
}
