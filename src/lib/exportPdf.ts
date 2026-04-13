import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportReportAsPdf(element: HTMLElement, fileName = "تقرير-الفعالية.pdf") {
  // Wait for images to load
  const images = element.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const ratio = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  const pdf = new jsPDF({
    orientation: scaledHeight > pdfHeight ? "portrait" : "portrait",
    unit: "mm",
    format: scaledHeight > pdfHeight ? [pdfWidth, scaledHeight] : "a4",
  });

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, scaledHeight);
  pdf.save(fileName);
}
