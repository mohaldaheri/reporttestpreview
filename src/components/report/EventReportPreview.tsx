import ReportHeader from "./ReportHeader";
import happinessTeamLogo from "@/assets/happiness-team-logo.png";

const sampleImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
];

export interface ReportData {
  title: string;
  location: string;
  date: string;
  beneficiaries: string;
  executor: string;
  objective: string;
  description: string;
  reporter: string;
}

export default function EventReportPreview({
  data,
  images,
}: {
  data: ReportData;
  images: string[];
}) {
  const shown = images.length ? images.slice(0, 4) : sampleImages;

  return (
    <div
      className="mx-auto w-full max-w-[820px] rounded-3xl bg-card p-4 shadow-2xl md:p-6"
      dir="rtl"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border">
        <ReportHeader compact />

        <div className="relative px-6 pb-7 pt-5">
          {/* Title */}
          <div className="rounded-2xl border border-border bg-brand-bg px-5 py-4 shadow-sm">
            <div className="mb-2 text-xs font-bold text-primary-dark">عنوان الفعالية</div>
            <div className="text-xl font-bold text-brand-brown">{data.title || "—"}</div>
          </div>

          {/* Meta grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {([
              ["مكان التنفيذ", data.location],
              ["تاريخ التنفيذ", data.date],
              ["عدد المستفيدين", data.beneficiaries],
              ["المنفذ", data.executor],
            ] as const).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                <div className="text-[11px] font-bold text-primary-dark">{label}</div>
                <div className="mt-1 line-clamp-2 text-sm font-semibold text-brand-text">
                  {value || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.25fr]">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-2 text-sm font-bold text-primary-dark">هدف الفعالية</div>
              <p className="line-clamp-5 text-sm leading-7 text-brand-text">
                {data.objective || "—"}
              </p>
              <div
                className="my-4 h-px"
                style={{
                  background: `linear-gradient(to left, transparent, hsl(var(--brand-beige)), transparent)`,
                }}
              />
              <div className="mb-2 text-sm font-bold text-primary-dark">وصف الفعالية</div>
              <p className="line-clamp-6 text-sm leading-7 text-brand-text">
                {data.description || "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 text-sm font-bold text-primary-dark">شواهد الفعالية</div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-brand-bg">
                    <img
                      src={shown[i] || sampleImages[i]}
                      alt={`evidence-${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reporter */}
          <div className="mt-6 flex justify-end pt-5">
            <div className="min-w-[180px] text-right">
              <div className="text-sm font-bold text-primary-dark">معد التقرير</div>
              <div className="mt-2 text-base font-semibold text-brand-brown">
                {data.reporter || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
