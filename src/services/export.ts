import { TranscriptionSegment, TranscriptionResult } from './gemini';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

export const generateSRT = (segments: TranscriptionSegment[]): string => {
  return segments
    .map((s, i) => {
      const start = s.start.replace('.', ',');
      const end = s.end.replace('.', ',');
      return `${i + 1}\n${start} --> ${end}\n${s.text}\n`;
    })
    .join('\n');
};

export const generateVTT = (segments: TranscriptionSegment[]): string => {
  const header = 'WEBVTT\n\n';
  const body = segments
    .map((s) => {
      return `${s.start} --> ${s.end}\n${s.text}\n`;
    })
    .join('\n');
  return header + body;
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateDocx = async (original: TranscriptionResult, translated: TranscriptionSegment[]) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: "Transcription & Traduction", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Transcription Originale", heading: HeadingLevel.HEADING_2 }),
          ...original.segments.map(s => new Paragraph({
            children: [
              new TextRun({ text: `[${s.start}] `, bold: true }),
              new TextRun(s.text)
            ]
          })),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Traduction Française", heading: HeadingLevel.HEADING_2 }),
          ...translated.map(s => new Paragraph({
            children: [
              new TextRun({ text: `[${s.start}] `, bold: true }),
              new TextRun(s.text)
            ]
          })),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "transcription_traduction.docx";
  a.click();
};

export const generatePdf = (original: TranscriptionResult, translated: TranscriptionSegment[]) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text("Transcription & Traduction", 20, y);
  y += 15;

  doc.setFontSize(14);
  doc.text("Transcription Originale", 20, y);
  y += 10;

  doc.setFontSize(10);
  original.segments.forEach(s => {
    if (y > 280) { doc.addPage(); y = 20; }
    const text = `[${s.start}] ${s.text}`;
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 2;
  });

  y += 10;
  if (y > 280) { doc.addPage(); y = 20; }
  doc.setFontSize(14);
  doc.text("Traduction Française", 20, y);
  y += 10;

  doc.setFontSize(10);
  translated.forEach(s => {
    if (y > 280) { doc.addPage(); y = 20; }
    const text = `[${s.start}] ${s.text}`;
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 2;
  });

  doc.save("transcription_traduction.pdf");
};
