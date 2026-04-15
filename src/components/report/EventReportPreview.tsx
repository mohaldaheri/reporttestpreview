import { forwardRef } from "react";
import ReportHeader from "./ReportHeader";


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

const EventReportPreview = forwardRef<HTMLDivElement, { data: ReportData; images: string[] }>(
  ({ data, images }, ref) => {
  const shown = images.slice(0, 4);

  return (
    <div
      ref={ref}
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
                {shown.length > 0 ? shown.map((src, i) => (
                  <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-brand-bg">
                    <img
                      src={src}
                      alt={`evidence-${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )) : (
                  <div className="col-span-2 flex aspect-[4/3] items-center justify-center rounded-xl bg-brand-bg text-sm text-muted-foreground">
                    لا توجد صور مرفقة
                  </div>
                )}
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
});

EventReportPreview.displayName = "EventReportPreview";

export default EventReportPreview;
