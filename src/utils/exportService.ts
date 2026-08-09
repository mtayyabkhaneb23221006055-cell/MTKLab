/**
 * MTKmicro Lab - Centralized Export System
 * Provides clean PDF, CSV, and PNG/JPEG export mechanisms for laboratory tools & data.
 */

export interface ExportData {
  title: string;
  subtitle?: string;
  meta: Record<string, string | number>;
  tableHeaders?: string[];
  tableRows?: (string | number)[][];
  notes?: string;
  imageUri?: string;
}

/**
 * Trigger CSV File Download
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvRows: string[] = [];
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  rows.forEach((row) => {
    const line = row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',');
    csvRows.push(line);
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Trigger Image Canvas PNG/JPEG Download
 */
export function exportImageToFormat(
  imageUri: string,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
) {
  const link = document.createElement('a');
  link.href = imageUri;
  link.download = filename.endsWith(`.${format}`) ? filename : `${filename}.${format}`;
  link.click();
}

/**
 * Generate Printable Professional Lab PDF Report in Browser
 */
export function generatePDFReport(data: ExportData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and view the PDF report.');
    return;
  }

  const metaHtml = Object.entries(data.meta)
    .map(
      ([k, v]) => `
      <div style="margin-bottom: 8px;">
        <span style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.05em;">${k}:</span>
        <span style="font-weight: 700; font-size: 13px; color: #0f172a; margin-left: 6px;">${v}</span>
      </div>
    `
    )
    .join('');

  let tableHtml = '';
  if (data.tableHeaders && data.tableRows && data.tableRows.length > 0) {
    const headers = data.tableHeaders
      .map(
        (h) => `
      <th style="padding: 10px; border: 1px solid #cbd5e1; background: #f1f5f9; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase;">${h}</th>
    `
      )
      .join('');

    const rows = data.tableRows
      .map(
        (row) => `
      <tr>
        ${row
          .map(
            (c) => `
          <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 12px; font-family: monospace;">${c}</td>
        `
          )
          .join('')}
      </tr>
    `
      )
      .join('');

    tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.title} — MTKmicro Lab Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; background: #ffffff; }
          .header { border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; margin: 0; }
          .brand { font-size: 10px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: #0d9488; margin-bottom: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .notes { margin-top: 20px; padding: 12px; background: #f1f5f9; border-left: 4px solid #0d9488; font-size: 12px; font-style: italic; }
          .image-preview { margin-top: 20px; text-align: center; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; }
          .image-preview img { max-width: 100%; max-height: 350px; border-radius: 6px; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; pt: 10px; font-size: 10px; font-family: monospace; color: #64748b; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">MTKMICRO LAB — SCIENTIFIC COMPANION</div>
            <h1 class="title">${data.title}</h1>
            ${data.subtitle ? `<div style="font-size: 12px; color: #64748b; font-weight: 600;">${data.subtitle}</div>` : ''}
          </div>
          <div style="font-size: 11px; font-family: monospace; text-align: right; color: #64748b;">
            Date: ${new Date().toLocaleDateString()}<br/>
            Ref: LAB-${Math.floor(100000 + Math.random() * 900000)}
          </div>
        </div>

        <div class="grid">
          ${metaHtml}
        </div>

        ${data.imageUri ? `<div class="image-preview"><img src="${data.imageUri}" alt="Analysis Image" /></div>` : ''}

        ${tableHtml}

        ${data.notes ? `<div class="notes"><strong>Notes / Observations:</strong><br/>${data.notes}</div>` : ''}

        <div class="footer">
          <span>Generated by MTKmicro Lab v1.0 — Com.MTKmicroLab</span>
          <span>RESEARCH & EDUCATIONAL USE ONLY</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
