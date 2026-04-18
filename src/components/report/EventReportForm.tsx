import { useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, FileText, ImagePlus, RefreshCw } from "lucide-react";
import type { ReportData } from "./EventReportPreview";

interface Props {
  form: ReportData;
  images: string[];
  onUpdate: (key: keyof ReportData, value: string) => void;
  onFilesChange: (files: FileList | null) => void;
  onSubmit: () => void;
  onReset: () => void;
  exporting?: boolean;
}

export default function EventReportForm({ form, images, onUpdate, onFilesChange, onSubmit, onReset, exporting }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const imageCountText = useMemo(() => `${images.length} / 4 صور`, [images.length]);

  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-right text-xl text-brand-brown">بيانات الفعالية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-right">
          <Label>عنوان الفعالية</Label>
          <Input value={form.title} onChange={(e) => onUpdate("title", e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="space-y-2 text-right">
            <Label>مكان التنفيذ</Label>
            <Input value={form.location} onChange={(e) => onUpdate("location", e.target.value)} />
          </div>
          <div className="space-y-2 text-right">
            <Label>تاريخ التنفيذ</Label>
            <div className="relative">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => onUpdate("date", e.target.value)}
                className="pr-10"
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="space-y-2 text-right">
            <Label>عدد المستفيدين</Label>
            <Input type="number" value={form.beneficiaries} onChange={(e) => onUpdate("beneficiaries", e.target.value)} />
          </div>
          <div className="space-y-2 text-right">
            <Label>المنفذ</Label>
            <Input value={form.executor} onChange={(e) => onUpdate("executor", e.target.value)} />
          </div>
        </div>

        <div className="space-y-2 text-right">
          <Label>هدف الفعالية</Label>
          <Textarea rows={4} value={form.objective} onChange={(e) => onUpdate("objective", e.target.value)} />
        </div>

        <div className="space-y-2 text-right">
          <Label>وصف الفعالية</Label>
          <Textarea rows={5} value={form.description} onChange={(e) => onUpdate("description", e.target.value)} />
        </div>

        <div className="space-y-2 text-right">
          <div className="flex items-center justify-between" dir="rtl">
            <Label>شواهد الفعالية</Label>
            <span className="text-xs text-muted-foreground" dir="ltr">{imageCountText}</span>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary-light bg-primary/5 px-4 py-6 text-sm font-medium text-primary-dark transition hover:bg-primary/10"
          >
            <ImagePlus className="h-4 w-4" />
            رفع حتى 4 صور
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onFilesChange(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div className="space-y-2 text-right">
          <Label>اسم معد التقرير</Label>
          <Input value={form.reporter} onChange={(e) => onUpdate("reporter", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button className="rounded-xl bg-primary-dark hover:bg-primary-dark/90" onClick={onSubmit} disabled={exporting}>
            <FileText className="ml-2 h-4 w-4" />
            {exporting ? "جاري التصدير..." : "إصدار التقرير"}
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={onReset}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة ضبط
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
