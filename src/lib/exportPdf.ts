import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * Convert all <img> with SVG src inside the element to inline data-URIs
 * so html2canvas can render them correctly.
 */
async function inlineSvgImages(element: HTMLElement): Promise<() => void> {
  const imgs = element.querySelectorAll("img");
  const originals: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    Array.from(imgs).map(async (img) => {
      const src = img.src;
      if (!src) return;

      try {
        // For SVG files, fetch and convert to data URI
        if (src.endsWith(".svg") || src.includes(".svg")) {
          originals.push({ img, src });
          const resp = await fetch(src);
          const text = await resp.text();
          const blob = new Blob([text], { type: "image/svg+xml" });
          const dataUrl = await blobToDataURL(blob);
          img.src = dataUrl;
        }
        // For other images, convert through canvas to ensure CORS
        else if (!src.startsWith("data:")) {
          originals.push({ img, src });
          const dataUrl = await imgToDataURL(img);
          if (dataUrl) img.src = dataUrl;
        }
      } catch {
        // Keep original src on failure
      }
    })
  );

  // Return a restore function
  return () => {
    originals.forEach(({ img, src }) => {
      img.src = src;
    });
  };
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function imgToDataURL(img: HTMLImageElement): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    } catch {
      resolve(null);
    }
  });
}

/** Wait until every <img> inside the element has finished loading. */
async function waitForImages(element: HTMLElement, timeout = 10000): Promise<void> {
  const imgs = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) return resolve();
          const timer = setTimeout(resolve, timeout);
          img.onload = () => { clearTimeout(timer); resolve(); };
          img.onerror = () => { clearTimeout(timer); resolve(); };
        })
    )
  );
}

/** Force all images to fully decode before capture */
async function ensureImagesDecoded(element: HTMLElement): Promise<void> {
  const imgs = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    imgs.map(async (img) => {
      if (!img.src || img.src === "data:,") return;
      try {
        // decode() ensures the image bitmap is ready for painting
        await img.decode();
      } catch {
        // fallback: already loaded or broken
      }
    })
  );
}

/** Small delay helper */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function exportPreviewToPdf(element: HTMLElement, fileName = "تقرير-الفعالية.pdf") {
  // Step 1: Wait for all images to fully load
  await waitForImages(element);
  await ensureImagesDecoded(element);

  // Step 2: Inline SVGs before capture
  const restore = await inlineSvgImages(element);

  // Step 3: After inlining, wait again for the replaced src to settle
  await waitForImages(element);
  await ensureImagesDecoded(element);

  // Step 4: Give the browser enough time to paint everything
  // Multiple reflows + a real delay to ensure blob images are rendered
  element.getBoundingClientRect();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await delay(500);
  element.getBoundingClientRect();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Boost ornament visibility for PDF export
  const ornamentImg = element.querySelector('.pointer-events-none img[alt=""]') as HTMLImageElement | null;
  const origOpacity = ornamentImg?.style.opacity;
  const origFilter = ornamentImg?.style.filter;
  if (ornamentImg) {
    ornamentImg.style.opacity = "0.70";
    ornamentImg.style.filter = "brightness(0.75) saturate(0)";
  }

  try {
    // Final reflow before capture
    element.getBoundingClientRect();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await delay(200);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      imageTimeout: 15000,
      logging: false,
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = 297;
    let position = 0;

    if (imgHeight <= pageHeight) {
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
    } else {
      while (position < imgHeight) {
        const sourceY = (position / imgHeight) * canvas.height;
        const sourceH = Math.min((pageHeight / imgHeight) * canvas.height, canvas.height - sourceY);
        const destH = (sourceH / canvas.height) * imgHeight;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceH;
        const ctx = pageCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceH, 0, 0, canvas.width, sourceH);

        pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, destH);
        position += pageHeight;
        if (position < imgHeight) pdf.addPage();
      }
    }

    pdf.save(fileName);
  } finally {
    // Restore ornament original values
    if (ornamentImg) {
      ornamentImg.style.opacity = origOpacity || "";
      ornamentImg.style.filter = origFilter || "";
    }
    restore();
  }
}
