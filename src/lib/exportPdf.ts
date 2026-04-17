import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 10;
const CONTENT_WIDTH_MM = A4_WIDTH_MM - PAGE_MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - PAGE_MARGIN_MM * 2;
const SECTION_GAP_MM = 4;
const CAPTURE_SCALE = 2;

async function inlineSvgImages(element: HTMLElement): Promise<() => void> {
  const imgs = element.querySelectorAll("img");
  const originals: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    Array.from(imgs).map(async (img) => {
      const src = img.src;
      if (!src) return;

      try {
        if (src.endsWith(".svg") || src.includes(".svg")) {
          originals.push({ img, src });
          const resp = await fetch(src);
          const text = await resp.text();
          const blob = new Blob([text], { type: "image/svg+xml" });
          img.src = await blobToDataURL(blob);
        } else if (!src.startsWith("data:")) {
          const dataUrl = await imgToDataURL(img);
          if (dataUrl) {
            originals.push({ img, src });
            img.src = dataUrl;
          }
        }
      } catch {
        // Keep original src on failure
      }
    })
  );

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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForFonts(): Promise<void> {
  if ("fonts" in document) {
    await document.fonts.ready;
  }
}

function createExportStage(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const stage = document.createElement("div");
  stage.style.position = "fixed";
  stage.style.left = "-20000px";
  stage.style.top = "0";
  stage.style.width = `${Math.ceil(rect.width)}px`;
  stage.style.padding = "0";
  stage.style.margin = "0";
  stage.style.opacity = "0";
  stage.style.pointerEvents = "none";
  stage.style.background = "#ffffff";
  stage.style.zIndex = "-1";

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${Math.ceil(rect.width)}px`;
  clone.style.maxWidth = "none";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";

  const ornamentImg = clone.querySelector('.pointer-events-none img[alt=""]') as HTMLImageElement | null;
  if (ornamentImg) {
    ornamentImg.style.opacity = "0.70";
    ornamentImg.style.filter = "brightness(0.75) saturate(0)";
  }

  stage.appendChild(clone);
  document.body.appendChild(stage);

  return {
    stage,
    clone,
    cleanup: () => {
      stage.remove();
    },
  };
}

async function prepareElementForCapture(element: HTMLElement): Promise<() => void> {
  await waitForFonts();
  await waitForImages(element);
  await ensureImagesDecoded(element);

  const restore = await inlineSvgImages(element);

  await waitForImages(element);
  await ensureImagesDecoded(element);
  element.getBoundingClientRect();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await delay(300);

  return restore;
}

async function renderSection(section: HTMLElement, width: number): Promise<HTMLCanvasElement> {
  return html2canvas(section, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    imageTimeout: 20000,
    logging: false,
    width,
    windowWidth: width,
    scrollX: 0,
    scrollY: 0,
  });
}

function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, currentY: number) {
  const mmPerPx = CONTENT_WIDTH_MM / canvas.width;
  const totalHeightMM = canvas.height * mmPerPx;
  const maxSliceHeightPx = Math.max(1, Math.floor(CONTENT_HEIGHT_MM / mmPerPx));
  let nextY = currentY;

  if (totalHeightMM <= CONTENT_HEIGHT_MM) {
    const remaining = A4_HEIGHT_MM - PAGE_MARGIN_MM - nextY;
    if (totalHeightMM > remaining && nextY > PAGE_MARGIN_MM) {
      pdf.addPage();
      nextY = PAGE_MARGIN_MM;
    }

    pdf.addImage(canvas, "PNG", PAGE_MARGIN_MM, nextY, CONTENT_WIDTH_MM, totalHeightMM);
    return nextY + totalHeightMM;
  }

  let offsetY = 0;
  while (offsetY < canvas.height) {
    if (nextY > PAGE_MARGIN_MM) {
      pdf.addPage();
      nextY = PAGE_MARGIN_MM;
    }

    const sliceHeightPx = Math.min(maxSliceHeightPx, canvas.height - offsetY);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeightPx;

    const ctx = pageCanvas.getContext("2d");
    if (!ctx) break;

    ctx.drawImage(canvas, 0, offsetY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    const sliceHeightMM = sliceHeightPx * mmPerPx;
    pdf.addImage(pageCanvas, "PNG", PAGE_MARGIN_MM, nextY, CONTENT_WIDTH_MM, sliceHeightMM);
    offsetY += sliceHeightPx;
    nextY += sliceHeightMM;
  }

  return nextY;
}

export async function exportPreviewToPdf(element: HTMLElement, fileName = "تقرير-الفعالية.pdf") {
  const { clone, cleanup } = createExportStage(element);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  try {
    const restore = await prepareElementForCapture(clone);
    const sections = Array.from(clone.querySelectorAll("[data-pdf-section]")) as HTMLElement[];
    const targets = sections.length > 0 ? sections : [clone];
    const exportWidth = Math.ceil(clone.getBoundingClientRect().width);
    let currentY = PAGE_MARGIN_MM;

    for (let index = 0; index < targets.length; index += 1) {
      const section = targets[index];
      const canvas = await renderSection(section, exportWidth);
      currentY = addCanvasToPdf(pdf, canvas, currentY);

      if (index < targets.length - 1) {
        const remaining = A4_HEIGHT_MM - PAGE_MARGIN_MM - currentY;
        if (remaining < SECTION_GAP_MM + 12) {
          pdf.addPage();
          currentY = PAGE_MARGIN_MM;
        } else {
          currentY += SECTION_GAP_MM;
        }
      }
    }

    restore();
    pdf.save(fileName);
  } finally {
    cleanup();
  }
}
