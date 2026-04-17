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

              <div className="flex flex-1 flex-col px-8 pb-8 pt-6">
                <div className="flex min-h-[104px] flex-col justify-center rounded-[24px] border border-border bg-brand-bg px-6 py-5">
                  <div className="mb-2 text-xs font-bold text-primary-dark">عنوان الفعالية</div>
                  <div className="text-[28px] font-bold leading-[1.5] text-brand-brown" style={clampStyle(2)}>
                    {data.title || "—"}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3">
                  {metaItems.map(([label, value]) => (
                    <div key={label} className="flex min-h-[92px] flex-col justify-between rounded-[22px] border border-border bg-card px-4 py-4 shadow-sm">
                      <div className="text-xs font-bold text-primary-dark">{label}</div>
                      <div className="text-sm font-semibold leading-6 text-brand-text" style={clampStyle(2)}>
                        {value || "—"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid flex-1 grid-cols-[290px_minmax(0,1fr)] gap-4">
                  <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                    <div className="mb-3 text-base font-bold text-primary-dark">هدف الفعالية</div>
                    <p className="text-sm leading-8 text-brand-text" style={clampStyle(10)}>
                      {data.objective || "—"}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                    <div className="mb-3 text-base font-bold text-primary-dark">وصف الفعالية</div>
                    <p className="text-sm leading-8 text-brand-text" style={clampStyle(16)}>
                      {data.description || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] shadow-2xl">
          <div data-pdf-page className="h-[1123px] w-[794px] overflow-hidden bg-card">
            <div className="flex h-full flex-col px-8 py-8">
              <div className="rounded-[24px] border border-border bg-brand-bg px-6 py-5 shadow-sm">
                <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4">
                  <div>
                    <div className="text-xs font-bold text-primary-dark">عنوان الفعالية</div>
                    <div className="mt-2 text-lg font-bold leading-8 text-brand-brown" style={clampStyle(2)}>
                      {data.title || "—"}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold text-primary-dark">مكان التنفيذ</div>
                      <div className="mt-1 text-sm font-semibold leading-7 text-brand-text" style={clampStyle(2)}>
                        {data.location || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary-dark">تاريخ التنفيذ</div>
                      <div className="mt-1 text-sm font-semibold leading-7 text-brand-text">{data.date || "—"}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold text-primary-dark">المنفذ</div>
                      <div className="mt-1 text-sm font-semibold leading-7 text-brand-text" style={clampStyle(2)}>
                        {data.executor || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary-dark">عدد المستفيدين</div>
                      <div className="mt-1 text-sm font-semibold leading-7 text-brand-text">{data.beneficiaries || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex-1 rounded-[24px] border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 text-lg font-bold text-brand-brown">شواهد الفعالية</div>
                <div className="grid grid-cols-2 gap-4">
                  {evidenceSlots.map((src, i) => (
                    <div key={i} className="overflow-hidden rounded-[20px] border border-border bg-brand-bg">
                      {src ? (
                        <img
                          src={src}
                          alt={`evidence-${i + 1}`}
                          className="h-[320px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-[320px] items-center justify-center px-6 text-sm font-medium text-muted-foreground">
                          لا توجد صورة مرفقة
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-border bg-card px-6 py-5 shadow-sm">
                <div className="text-sm font-bold text-primary-dark">معد التقرير</div>
                <div className="mt-3 text-2xl font-semibold text-brand-brown" style={clampStyle(2)}>
                  {data.reporter || "—"}
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
