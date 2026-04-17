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

const clampStyle = (lines: number) => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical" as const,
  WebkitLineClamp: lines,
  overflow: "hidden",
});

const EventReportPreview = forwardRef<HTMLDivElement, { data: ReportData; images: string[] }>(
  ({ data, images }, ref) => {
  const shown = images.slice(0, 4);
  const evidenceSlots = Array.from({ length: 4 }, (_, index) => shown[index] ?? null);
  const metaItems = [
    ["مكان التنفيذ", data.location],
    ["تاريخ التنفيذ", data.date],
    ["عدد المستفيدين", data.beneficiaries],
    ["المنفذ", data.executor],
  ] as const;

  return (
    <div
      ref={ref}
      className="mx-auto w-full overflow-x-auto pb-2"
      dir="rtl"
      data-pdf-root
    >
      <div className="flex min-w-fit flex-col items-center gap-6">
        <div className="overflow-hidden rounded-[32px] shadow-2xl">
          <div data-pdf-page className="h-[1123px] w-[794px] overflow-hidden bg-card">
            <div className="flex h-full flex-col bg-card">
              <ReportHeader compact fixedLayout />

              <div className="flex flex-1 flex-col px-8 pb-8 pt-5">
                <div className="flex min-h-[92px] flex-col justify-center rounded-[24px] border border-border bg-brand-bg px-6 py-4">
                  <div className="mb-2 text-xs font-bold text-primary-dark">عنوان الفعالية</div>
                  <div className="text-[24px] font-bold leading-[1.5] text-brand-brown" style={clampStyle(2)}>
                    {data.title || "—"}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3">
                  {metaItems.map(([label, value]) => (
                    <div key={label} className="flex min-h-[84px] flex-col justify-between rounded-[22px] border border-border bg-card px-4 py-3 shadow-sm">
                      <div className="text-xs font-bold text-primary-dark">{label}</div>
                      <div className="text-sm font-semibold leading-6 text-brand-text" style={clampStyle(2)}>
                        {value || "—"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid flex-1 grid-cols-[320px_minmax(0,1fr)] gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                      <div className="mb-3 text-base font-bold text-primary-dark">هدف الفعالية</div>
                      <p className="text-sm leading-8 text-brand-text" style={clampStyle(8)}>
                        {data.objective || "—"}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                      <div className="mb-3 text-base font-bold text-primary-dark">معد التقرير</div>
                      <div className="text-xl font-semibold text-brand-brown" style={clampStyle(2)}>
                        {data.reporter || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col rounded-[24px] border border-border bg-card p-5 shadow-sm">
                    <div className="mb-3 text-base font-bold text-primary-dark">وصف الفعالية</div>
                    <p className="text-sm leading-8 text-brand-text" style={clampStyle(11)}>
                      {data.description || "—"}
                    </p>

                    <div className="mb-3 mt-5 text-base font-bold text-brand-brown">شواهد الفعالية</div>
                    <div className="grid grid-cols-2 gap-3">
                      {evidenceSlots.map((src, i) => (
                        <div key={i} className="overflow-hidden rounded-[20px] border border-border bg-brand-bg">
                          {src ? (
                            <img
                              src={src}
                              alt={`evidence-${i + 1}`}
                              className="h-[180px] w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-[180px] items-center justify-center px-4 text-sm font-medium text-muted-foreground">
                              لا توجد صورة مرفقة
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
