import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReportHeader from "@/components/report/ReportHeader";
import EventReportPreview, { type ReportData } from "@/components/report/EventReportPreview";
import EventReportForm from "@/components/report/EventReportForm";
import { exportPreviewToPdf } from "@/lib/exportPdf";
import { toast } from "sonner";

const initialData: ReportData = {
  title: "",
  location: "",
  date: "",
  beneficiaries: "",
  executor: "",
  objective: "",
  description: "",
  reporter: "",
};

export default function Index() {
  const objectUrlsRef = useRef<string[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(initialData);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const update = (key: keyof ReportData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map((file) => URL.createObjectURL(file));
    const combined = [...objectUrlsRef.current, ...newUrls].slice(0, 4);
    // Revoke URLs that were dropped due to the 4-image limit
    const dropped = [...objectUrlsRef.current, ...newUrls].slice(4);
    dropped.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = combined;
    setImages(combined);
  };

  const resetAll = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setForm(initialData);
    setImages([]);
    setSuccess(false);
  };

  const handleExportPdf = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      await exportPreviewToPdf(previewRef.current);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تصدير التقرير");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadAgain = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      await exportPreviewToPdf(previewRef.current);
    } catch {
      toast.error("حدث خطأ أثناء تحميل التقرير");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-brand-bg" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-3xl shadow-xl">
          <ReportHeader />
        </div>

        <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
          <EventReportForm
            form={form}
            images={images}
            onUpdate={update}
            onFilesChange={handleFiles}
            onSubmit={handleExportPdf}
            onReset={resetAll}
            exporting={exporting}
          />

          <div className="space-y-3">
            <div className="text-right">
              <h2 className="text-lg font-bold text-brand-brown">معاينة تصميم التقرير</h2>
              <p className="text-sm text-muted-foreground">
                اضغط "إصدار التقرير" لتحميل ملف PDF مطابق لهذه المعاينة.
              </p>
            </div>
            <EventReportPreview ref={previewRef} data={form} images={images} />
          </div>
        </div>
      </div>

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تم إصدار التقرير بنجاح</DialogTitle>
            <DialogDescription className="text-right">
              تم تصدير التقرير كملف PDF بنجاح. يمكنك تحميله مرة أخرى أو إنشاء تقرير جديد.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2 sm:justify-start">
            <Button
              className="bg-primary-dark hover:bg-primary-dark/90"
              onClick={handleDownloadAgain}
              disabled={exporting}
            >
              {exporting ? "جاري التحميل..." : "تحميل التقرير"}
            </Button>
            <Button variant="outline" onClick={resetAll}>
              إنشاء تقرير جديد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
