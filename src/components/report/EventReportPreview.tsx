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
  textOverflow: "ellipsis" as const,
  wordBreak: "break-word" as const,
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

                <div className="flex flex-1 flex-col px-8 pb-6 pt-5">
                  {/* Title */}
                  <div className="flex h-[88px] flex-col justify-center rounded-[24px] border border-border bg-brand-bg px-6 py-3">
                    <div className="mb-1 text-xs font-bold text-primary-dark">عنوان الفعالية</div>
                    <div
                      className="text-[22px] font-bold leading-[1.4] text-brand-brown"
                      style={clampStyle(1)}
                    >
                      {data.title || "—"}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {metaItems.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex h-[80px] flex-col justify-center gap-1 rounded-[22px] border border-border bg-card px-4 py-3 shadow-sm"
                      >
                        <div className="text-xs font-bold text-primary-dark" style={clampStyle(1)}>
                          {label}
                        </div>
                        <div
                          className="text-sm font-semibold leading-6 text-brand-text"
                          style={clampStyle(1)}
                        >
                          {value || "—"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Two columns: right (objective + description) | left (evidence) */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {/* Right column (RTL first) */}
                    <div className="flex flex-col gap-4">
                      <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                        <div className="mb-2 text-base font-bold text-primary-dark">هدف الفعالية</div>
                        <p
                          className="text-sm leading-7 text-brand-text"
                          style={{ ...clampStyle(4), minHeight: "112px" }}
                        >
                          {data.objective || "—"}
                        </p>
                      </div>

                      <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
                        <div className="mb-2 text-base font-bold text-primary-dark">وصف الفعالية</div>
                        <p
                          className="text-sm leading-7 text-brand-text"
                          style={{ ...clampStyle(4), minHeight: "112px" }}
                        >
                          {data.description || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Left column: evidence */}
                    <div className="flex flex-col rounded-[24px] border border-border bg-card p-5 shadow-sm">
                      <div className="mb-3 text-base font-bold text-primary-dark text-right">شواهد الفعالية</div>
                      <div className="grid grid-cols-2 gap-3">
                        {evidenceSlots.map((src, i) => (
                          <div
                            key={i}
                            className="overflow-hidden rounded-[16px] border border-border bg-brand-bg"
                          >
                            {src ? (
                              <img
                                src={src}
                                alt={`evidence-${i + 1}`}
                                className="h-[150px] w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-[150px] items-center justify-center px-2 text-xs font-medium text-muted-foreground">
                                لا توجد صورة مرفقة
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reporter footer */}
                  <div className="mt-auto pt-4 pb-20">
                    <div className="text-base font-bold text-primary-dark">معد التقرير</div>
                    <div
                      className="mt-2 text-lg font-semibold text-brand-brown"
                      style={clampStyle(1)}
                    >
                      {data.reporter || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

EventReportPreview.displayName = "EventReportPreview";

export default EventReportPreview;
