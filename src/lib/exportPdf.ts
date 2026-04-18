import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const CAPTURE_SCALE = 2;
const EXPORT_PAGE_WIDTH_PX = 794;

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
      const bounds = img.getBoundingClientRect();
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;
      const renderedWidth = Math.ceil(bounds.width || img.width || naturalWidth);
      const renderedHeight = Math.ceil(bounds.height || img.height || naturalHeight);

      if (!naturalWidth || !naturalHeight || !renderedWidth || !renderedHeight) {
        return resolve(null);
      }

      const maxExportWidth = Math.max(renderedWidth * CAPTURE_SCALE, renderedWidth);
      const maxExportHeight = Math.max(renderedHeight * CAPTURE_SCALE, renderedHeight);
      const scale = Math.min(1, maxExportWidth / naturalWidth, maxExportHeight / naturalHeight);
      const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
      const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

      // Heuristic: small assets (logos, ornaments) often rely on transparency.
      // Photos uploaded by the user are usually large. Preserve alpha for the
      // small ones and compress the large ones to JPEG to save memory on iOS.
      const isLikelyPhoto = naturalWidth >= 600 || naturalHeight >= 600;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d", { alpha: !isLikelyPhoto });
      if (!ctx) return resolve(null);

      if (isLikelyPhoto) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      resolve(
        isLikelyPhoto
          ? canvas.toDataURL("image/jpeg", 0.92)
          : canvas.toDataURL("image/png")
      );
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
  const stage = document.createElement("div");
  // Keep the stage inside the viewport so mobile browsers (esp. iOS Safari)
  // actually paint/layout the cloned element. Hide it visually with clip-path
  // and zero opacity instead of moving it far off-screen.
  stage.style.position = "fixed";
  stage.style.left = "0";
  stage.style.top = "0";
  stage.style.width = `${EXPORT_PAGE_WIDTH_PX}px`;
  stage.style.height = "auto";
  stage.style.padding = "0";
  stage.style.margin = "0";
  stage.style.opacity = "0";
  stage.style.pointerEvents = "none";
  stage.style.background = "#ffffff";
  stage.style.zIndex = "-1";
  stage.style.overflow = "visible";
  stage.style.clipPath = "inset(0)";
  stage.setAttribute("aria-hidden", "true");

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${EXPORT_PAGE_WIDTH_PX}px`;
  clone.style.maxWidth = "none";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.setAttribute("data-export-mode", "pdf");

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

async function renderPage(page: HTMLElement): Promise<HTMLCanvasElement> {
  const width = Math.ceil(page.getBoundingClientRect().width || EXPORT_PAGE_WIDTH_PX);
  const height = Math.ceil(page.getBoundingClientRect().height || width * Math.sqrt(2));

  return html2canvas(page, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    imageTimeout: 20000,
    logging: false,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
  });
}

export async function exportPreviewToPdf(element: HTMLElement, fileName = "تقرير-الفعالية.pdf") {
  const { clone, cleanup } = createExportStage(element);
  const previousScrollX = window.scrollX;
  const previousScrollY = window.scrollY;
  // Scroll to top before capture: iOS Safari uses the visual viewport for
  // html2canvas, and any scroll offset can shift the captured area.
  window.scrollTo(0, 0);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  try {
    const restore = await prepareElementForCapture(clone);
    const pages = Array.from(clone.querySelectorAll("[data-pdf-page]")) as HTMLElement[];
    const targets = pages.length > 0 ? pages : [clone];

    for (let index = 0; index < targets.length; index += 1) {
      const canvas = await renderPage(targets[index]);
      if (index > 0) pdf.addPage();
      pdf.addImage(canvas, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
    }

    restore();
    pdf.save(fileName);
  } finally {
    cleanup();
    window.scrollTo(previousScrollX, previousScrollY);
  }
}
