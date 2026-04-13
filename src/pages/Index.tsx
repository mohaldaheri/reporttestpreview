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
import { exportReportAsPdf } from "@/lib/exportPdf";
import { Download, Loader2 } from "lucide-react";

const initialData: ReportData = {
  title: "مبادرة استقبال ضيوف الرحمن",
  location: "مقر الشركة - جدة",
  date: "2026-04-15",
  beneficiaries: "120",
  executor: "فريق خدمة الحجاج",
  objective:
    "تعزيز جودة الترحيب والتنظيم ورفع جاهزية فرق العمل بما ينعكس على تجربة المستفيدين في بداية الخدمة.",
  description:
    "نفذت الشركة فعالية تعريفية وتنظيمية شملت استقبال المستفيدين، توضيح مسار الخدمات، وتقديم رسائل ترحيبية تعكس الهوية البصرية المعتمدة مع توثيق الحدث بالصور.",
  reporter: "محمد الظاهري",
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
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const selected = Array.from(files || []).slice(0, 4);
    const urls = selected.map((file) => URL.createObjectURL(file));
    objectUrlsRef.current = urls;
    setImages(urls);
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
      await exportReportAsPdf(previewRef.current);
    } catch (err) {
      console.error("PDF export failed:", err);
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
            onSubmit={() => setSuccess(true)}
            onReset={resetAll}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                className="rounded-xl gap-2"
                onClick={handleExportPdf}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {exporting ? "جاري التصدير..." : "تصدير PDF"}
              </Button>
              <div className="text-right">
                <h2 className="text-lg font-bold text-brand-brown">معاينة تصميم التقرير</h2>
                <p className="text-sm text-muted-foreground">
                  اضغط على زر التصدير لتحميل التقرير بصيغة PDF
                </p>
              </div>
            </div>
            <div ref={previewRef}>
              <EventReportPreview data={form} images={images} />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تم إصدار التقرير بنجاح</DialogTitle>
            <DialogDescription className="text-right">
              يمكنك الآن تحميل التقرير بصيغة PDF أو إنشاء تقرير جديد.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2 sm:justify-start">
            <Button
              className="bg-primary-dark hover:bg-primary-dark/90 gap-2"
              onClick={() => {
                setSuccess(false);
                handleExportPdf();
              }}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              تحميل التقرير PDF
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
