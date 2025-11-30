"use client";

import { useCallback } from "react";

function uint8ArrayToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  const chunks = [] as string[];

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
  }

  return btoa(chunks.join(""));
}

export function usePDFSigner() {
  const embedTextSignature = useCallback(
    async (
      pdfBase64: string,
      signatureText: string,
      position: { x: number; y: number }
    ) => {
      const { PDFDocument, rgb } = await import("pdf-lib");

      const base64Data = pdfBase64.includes("base64,")
        ? pdfBase64.split("base64,")[1]
        : pdfBase64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++)
        bytes[i] = binaryString.charCodeAt(i);

      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      const pdfY = height - position.y - 30;

      firstPage.drawText(signatureText, {
        x: position.x,
        y: pdfY,
        size: 24,
        color: rgb(0, 0, 0),
      });

      const signedDate = new Date().toLocaleDateString();
      firstPage.drawText(`Signed on: ${signedDate}`, {
        x: position.x,
        y: pdfY - 20,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedBase64 = uint8ArrayToBase64(modifiedPdfBytes);
      return `data:application/pdf;base64,${modifiedBase64}`;
    },
    []
  );

  const embedSignature = useCallback(
    async (
      pdfBase64: string,
      opts: { text?: string; imageBase64?: string },
      position: { x: number; y: number }
    ) => {
      if (opts.imageBase64) {
        return embedTextSignature(pdfBase64, opts.text || "", position);
      }

      return embedTextSignature(pdfBase64, opts.text || "", position);
    },
    [embedTextSignature]
  );

  return { embedSignature };
}
