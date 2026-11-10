/**
 * Client-Side PDF Resume Parser
 * 
 * Uses PDF.js loaded dynamically via CDN so it consumes 0 npm disk space.
 * Extracts text content directly in the candidate's browser with 100% privacy.
 */

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export class PdfService {
  private static isScriptLoaded = false;

  /**
   * Loads the PDF.js library dynamically from CDN
   */
  static loadPdfJs(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.isScriptLoaded && window.pdfjsLib) {
        return resolve(window.pdfjsLib);
      }

      const script = document.createElement('script');
      script.id = 'pdfjs-lib-cdn';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          this.isScriptLoaded = true;
          resolve(window.pdfjsLib);
        } else {
          reject(new Error('PDF.js loaded but pdfjsLib object is not available.'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js from CDN.'));
      document.head.appendChild(script);
    });
  }

  /**
   * Extracts text from an uploaded File (PDF, TXT, or MD)
   */
  static async extractTextFromFile(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();

    // Plain text or Markdown resume
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
      });
    }

    // PDF resume
    if (fileName.endsWith('.pdf')) {
      const pdfjs = await this.loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      let fullText = '';
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let lastY: number | null = null;
        let pageText = '';

        for (const item of textContent.items) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
            pageText += ' ';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }

        fullText += pageText + '\n\n';
      }

      return fullText.trim();
    }

    throw new Error('Unsupported file format. Please upload a .pdf, .txt, or .md file.');
  }
}
