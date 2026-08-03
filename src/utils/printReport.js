import { formatDhakaDateTime } from "./dateUtils";

/**
 * Generates and prints a high-quality ERP Report directly via print preview dialog.
 * 
 * @param {Object} options
 * @param {string} options.reportTitle - Title of the report (e.g. "Sales Reports & Analytics")
 * @param {string} options.reportSubTitle - Subtitle description
 * @param {Array<{label: string, value: string}>} options.filterTags - Array of active filter tags
 * @param {Array<{label: string, value: string, subtext?: string, color?: string}>} options.kpiCards - Summary cards
 * @param {Array<{title: string, columns: Array<string>, rows: Array<Array<any>>, alignments?: Array<string>, compact?: boolean}>} options.tables - Tables to render
 */
export const printReportPdf = ({
  reportTitle = "ERP Report",
  reportSubTitle = "Circle Seed Management System",
  filterTags = [],
  kpiCards = [],
  tables = [],
}) => {
  const generatedAt = formatDhakaDateTime(new Date());

  const kpiCardsHtml = kpiCards.length > 0
    ? `<div class="kpi-grid">
        ${kpiCards
          .map(
            (card) => `
            <div class="kpi-card ${card.color ? `kpi-${card.color}` : ''}">
              <div class="kpi-label">${card.label}</div>
              <div class="kpi-value">${card.value}</div>
              ${card.subtext ? `<div class="kpi-subtext">${card.subtext}</div>` : ''}
            </div>
          `
          )
          .join('')}
      </div>`
    : '';

  const tablesHtml = tables.length > 0
    ? tables
        .map((table) => {
          if (!table.rows || table.rows.length === 0) return '';

          const alignments = table.alignments || [];
          const isCompact = table.compact || table.columns.length >= 7;
          const tableClass = isCompact ? 'table-compact' : 'table-standard';

          const headersHtml = table.columns
            .map((col, idx) => {
              const align = alignments[idx] || 'left';
              return `<th style="text-align: ${align}">${col}</th>`;
            })
            .join('');

          const rowsHtml = table.rows
            .map((row) => {
              const cellsHtml = row
                .map((cell, cIdx) => {
                  const align = alignments[cIdx] || 'left';
                  const isNowrap = isCompact && cIdx !== 3; // Keep nowrap on all compact cells except long text
                  const nowrapCss = isNowrap ? 'white-space: nowrap;' : '';
                  return `<td style="text-align: ${align}; ${nowrapCss}">${cell ?? '-'}</td>`;
                })
                .join('');
              return `<tr>${cellsHtml}</tr>`;
            })
            .join('');

          return `
            <div class="table-section">
              <h3 class="table-title">${table.title}</h3>
              <table class="${tableClass}">
                <thead>
                  <tr>${headersHtml}</tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </div>
          `;
        })
        .join('')
    : '<div class="no-data">No tables available for this report.</div>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${reportTitle} - Circle Seed ERP</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 10mm 8mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            margin: 0;
            padding: 10px 12px;
            color: #0f172a;
            background-color: #ffffff;
            font-size: 11px;
            line-height: 1.4;
          }
          .report-wrapper {
            padding: 14px 16px;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            background-color: #ffffff;
          }
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #059669;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .company-brand {
            display: flex;
            flex-direction: column;
          }
          .company-name {
            font-size: 20px;
            font-weight: 900;
            color: #047857;
            letter-spacing: -0.5px;
          }
          .company-subtitle {
            font-size: 10.5px;
            color: #64748b;
            font-weight: 600;
            margin-top: 1px;
          }
          .report-meta {
            text-align: right;
            font-size: 10px;
            color: #475569;
          }
          .report-title {
            font-size: 15px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 16px;
          }
          .kpi-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
            border-top: 3.5px solid #059669;
          }
          .kpi-emerald { border-top-color: #059669; background-color: #f0fdf4; }
          .kpi-blue { border-top-color: #2563eb; background-color: #eff6ff; }
          .kpi-purple { border-top-color: #9333ea; background-color: #faf5ff; }
          .kpi-amber { border-top-color: #d97706; background-color: #fffbeb; }
          .kpi-rose { border-top-color: #e11d48; background-color: #fff1f2; }
          
          .kpi-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.4px;
          }
          .kpi-value {
            font-size: 15px;
            font-weight: 900;
            color: #0f172a;
            margin-top: 3px;
          }
          .kpi-subtext {
            font-size: 9px;
            color: #475569;
            margin-top: 3px;
            font-weight: 500;
          }
          .table-section {
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .table-title {
            font-size: 12.5px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 1.5px solid #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          /* Standard Tables */
          table.table-standard {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          table.table-standard th {
            background-color: #059669 !important;
            color: #ffffff !important;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9px;
            padding: 6px 8px;
            letter-spacing: 0.3px;
            white-space: nowrap;
          }
          table.table-standard td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
          }

          /* Compact Tables for High Column Count */
          table.table-compact {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5px;
            table-layout: auto;
          }
          table.table-compact th {
            background-color: #059669 !important;
            color: #ffffff !important;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 8px;
            padding: 5px 3px;
            letter-spacing: 0.1px;
            white-space: nowrap;
          }
          table.table-compact td {
            padding: 4px 3px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 8.5px;
            line-height: 1.25;
          }

          tr:nth-child(even) td {
            background-color: #f8fafc;
          }
          .footer-container {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #94a3b8;
          }
          .no-data {
            padding: 20px;
            text-align: center;
            color: #94a3b8;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="report-wrapper">
          <div class="header-container">
            <div class="company-brand">
              <span class="company-name">CIRCLE SEED ERP</span>
              <span class="company-subtitle">Circle Seed Ltd. Management Information System</span>
            </div>
            <div class="report-meta">
              <div class="report-title">${reportTitle}</div>
              <div>Generated: <strong>${generatedAt}</strong></div>
            </div>
          </div>

          ${kpiCardsHtml}

          ${tablesHtml}

          <div class="footer-container">
            <div>Report generated automatically from Circle Seed ERP Software.</div>
            <div>Confidential & Internal Use Only</div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Create or reuse hidden iframe to print directly without opening extra popup window
  let iframe = document.getElementById("erp-report-print-iframe");
  if (iframe) {
    iframe.remove();
  }

  iframe = document.createElement("iframe");
  iframe.id = "erp-report-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Trigger print dialog directly from iframe
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 350);
};
