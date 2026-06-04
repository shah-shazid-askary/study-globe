const loadScript = (src) => new Promise((resolve, reject) => {
  if (typeof document === 'undefined') {
    resolve();
    return;
  }
  if (document.querySelector(`script[src="${src}"]`)) {
    resolve();
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
  document.body.appendChild(script);
});

let pdfJsPromise = null;
let mammothPromise = null;

export const loadPdfJs = async () => {
  if (typeof window === 'undefined') return null;
  if (window.pdfjsLib) return window.pdfjsLib;
  if (!pdfJsPromise) {
    pdfJsPromise = loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js').then(() => {
      if (window.pdfjsLib?.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      }
      return window.pdfjsLib;
    });
  }

  return pdfJsPromise;
};

export const loadMammoth = async () => {
  if (typeof window === 'undefined') return null;
  if (window.mammoth) return window.mammoth;
  if (!mammothPromise) {
    mammothPromise = loadScript('https://unpkg.com/mammoth/mammoth.browser.min.js').then(() => window.mammoth);
  }

  return mammothPromise;
};

export const readPdfAsText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await loadPdfJs();
  if (!pdfjsLib) throw new Error('PDF.js library could not be loaded.');

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    if (pageText.trim()) {
      pages.push(pageText);
    }
  }

  return pages.join('\n\n');
};

export const readDocxAsText = async (file) => {
  const mammoth = await loadMammoth();
  if (!mammoth) throw new Error('Mammoth library could not be loaded.');
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value || '';
};

export const readFileAsText = async (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return readPdfAsText(file);
  }

  if (extension === 'docx') {
    return readDocxAsText(file);
  }

  if (['txt', 'md', 'text', 'rtf'].includes(extension)) {
    return file.text();
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or text-based file.');
};
