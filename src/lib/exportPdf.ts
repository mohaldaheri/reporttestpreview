import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export async function exportPreviewToPdf(element: HTMLElement, fileName = "تقرير-الفعالية.pdf") {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
  });

  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: imgHeight > 297 ? "portrait" : "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = 297;
  let position = 0;

  if (imgHeight <= pageHeight) {
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-page
    while (position < imgHeight) {
      const sourceY = (position / imgHeight) * canvas.height;
      const sourceH = Math.min((pageHeight / imgHeight) * canvas.height, canvas.height - sourceY);
      const destH = (sourceH / canvas.height) * imgHeight;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceH;
      const ctx = pageCanvas.getContext("2d")!;
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceH, 0, 0, canvas.width, sourceH);

      pdf.addImage(pageCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, imgWidth, destH);
      position += pageHeight;
      if (position < imgHeight) pdf.addPage();
    }
  }

  pdf.save(fileName);
}
