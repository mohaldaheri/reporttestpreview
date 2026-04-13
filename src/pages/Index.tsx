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
  const [form, setForm] = useState(initialData);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);

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
            <div className="text-right">
              <h2 className="text-lg font-bold text-brand-brown">معاينة تصميم التقرير</h2>
              <p className="text-sm text-muted-foreground">
                هذه معاينة بصرية سريعة. الخطوة التالية يمكن أن تكون إضافة توليد PDF الحقيقي.
              </p>
            </div>
            <EventReportPreview data={form} images={images} />
          </div>
        </div>
      </div>

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تم إصدار التقرير بنجاح</DialogTitle>
            <DialogDescription className="text-right">
              هذه نافذة معاينة أولية. في النسخة التالية سنربط الزر بتصدير PDF الحقيقي.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row-reverse gap-2 sm:justify-start">
            <Button className="bg-primary-dark hover:bg-primary-dark/90">تحميل التقرير</Button>
            <Button variant="outline" onClick={resetAll}>
              إنشاء تقرير جديد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
