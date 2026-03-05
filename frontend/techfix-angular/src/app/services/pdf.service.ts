import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RepairOrder } from '../models/repair.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PdfService {
  private api = inject(ApiService);

  /** Remove characters outside Latin-1 range (emojis, special unicode) that jsPDF can't render. */
  private sanitize(text: string): string {
    return text.replace(/[^\x00-\xFF]/g, '').trim();
  }

  /** Letter-size (215.9 × 279.4 mm) service receipt with logo, signatures and warranty. */
  async generateTicket(repair: RepairOrder): Promise<void> {
    const { jsPDF } = await import('jspdf');

    // ── Page setup ──────────────────────────────────────────────
    const W = 215.9;
    const H = 279.4;
    const M = 18;          // left & right margin
    const CW = W - M * 2;  // content width
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    let y = M;

    // ── Load shop settings (logo + name) ─────────────────────────
    let shopName = 'Aguirre Fix Pro';
    let logoDataUrl: string | null = null;
    try {
      const settings = await firstValueFrom(this.api.getSettings());
      if (settings.shopName) shopName = settings.shopName;
      if (settings.logoBase64 && settings.logoMimeType)
        logoDataUrl = `data:${settings.logoMimeType};base64,${settings.logoBase64}`;
    } catch { /* use defaults */ }

    // ── Helpers ──────────────────────────────────────────────────
    const hLine = (lx = M, rx = W - M, color = 200) => {
      doc.setDrawColor(color);
      doc.setLineWidth(0.3);
      doc.line(lx, y, rx, y);
      y += 3;
    };

    const sectionTitle = (text: string) => {
      y += 2;
      doc.setFillColor(240, 240, 240);
      doc.rect(M, y - 4, CW, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(text.toUpperCase(), M + 3, y);
      y += 5;
      doc.setTextColor(0, 0, 0);
    };

    const dataRow = (label: string, value: string, col2 = false, x2 = M + CW / 2) => {
      if (!col2) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(label, M, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '-', M + 38, y);
        y += 5.5;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text(label, x2, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '-', x2 + 28, y);
      }
    };

    const formatDateStr = (iso: string): string => {
      if (!iso) return '-';
      const d = iso.split('T')[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return iso;
      const [yy, mm, dd] = d.split('-').map(Number);
      const dt = new Date(yy, mm - 1, dd);
      return isNaN(dt.getTime()) ? iso
        : dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // ── HEADER ────────────────────────────────────────────────────
    const logoSize = 22;
    const logoX = M;
    const logoY = y - 2;

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, logoX, logoY, logoSize, logoSize);
      } catch { /* skip logo if error */ }
    }

    const textX = logoDataUrl ? M + logoSize + 5 : M;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(shopName.toUpperCase(), textX, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Servicio Técnico de Reparaciones', textX, y + 11);

    // Folio box top-right
    const folioBoxX = W - M - 48;
    doc.setDrawColor(180); doc.setLineWidth(0.4);
    doc.roundedRect(folioBoxX, logoY, 48, 20, 2, 2);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text('ORDEN DE TRABAJO', folioBoxX + 24, logoY + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(0, 120, 180);
    doc.text(repair.orderNumber, folioBoxX + 24, logoY + 12, { align: 'center' });
    const createdStr = new Date(repair.createdAt).toLocaleDateString('es-MX',
      { day: '2-digit', month: '2-digit', year: 'numeric' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text(`Fecha: ${createdStr}`, folioBoxX + 24, logoY + 17, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    y = logoY + logoSize + 5;

    // Title divider
    doc.setDrawColor(0, 120, 180); doc.setLineWidth(0.8);
    doc.line(M, y, W - M, y);
    y += 1.5;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(0, 120, 180);
    doc.text('COMPROBANTE DE REPARACIÓN', W / 2, y + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0); doc.setLineWidth(0.3);
    y += 9;
    doc.setDrawColor(0, 120, 180); doc.setLineWidth(0.8);
    doc.line(M, y, W - M, y);
    doc.setDrawColor(200); doc.setLineWidth(0.3);
    y += 5;

    // ── CLIENTE ───────────────────────────────────────────────────
    sectionTitle('Datos del Cliente');
    dataRow('Cliente:', repair.clientName ?? '-');
    dataRow('Teléfono:', repair.clientPhone ?? '-');

    // ── DISPOSITIVO ───────────────────────────────────────────────
    sectionTitle('Información del Dispositivo');
    // two columns per row
    doc.setFontSize(8);
    const rowY = y;
    dataRow('Marca:', repair.deviceBrand);
    const afterBrand = y;
    y = rowY;
    dataRow('Modelo:', repair.deviceModel, true);
    y = Math.max(afterBrand, y);

    if (repair.imei) {
      const rY2 = y;
      dataRow('IMEI:', repair.imei);
      const afterImei = y;
      y = rY2;
      if (repair.accessories) dataRow('Accesorios:', repair.accessories, true);
      y = Math.max(afterImei, y);
    } else if (repair.accessories) {
      dataRow('Accesorios:', repair.accessories);
    }

    // ── PROBLEMA ──────────────────────────────────────────────────
    sectionTitle('Descripción del Problema');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const issueLines = doc.splitTextToSize(repair.issueDescription, CW - 4);
    doc.text(issueLines, M + 2, y);
    y += issueLines.length * 4.5 + 3;

    // ── COSTOS Y ESTADO ───────────────────────────────────────────
    sectionTitle('Costos y Estado');
    const rowY2 = y;
    doc.setFontSize(8);

    const statusLabels: Record<string, string> = {
      recibido: 'Recibido', diagnostico: 'En Diagnóstico',
      reparando: 'En Reparación', listo: 'Listo para entregar', entregado: 'Entregado'
    };
    dataRow('Estado:', statusLabels[repair.status] ?? repair.status.toUpperCase());
    const afterStatus = y;
    y = rowY2;
    if (repair.estimatedCompletion)
      dataRow('Entrega est.:', formatDateStr(repair.estimatedCompletion), true);
    y = Math.max(afterStatus, y);

    const rowY3 = y;
    if (repair.estimatedCost) dataRow('Costo Estimado:', `$${repair.estimatedCost}`);
    const afterEst = y;
    y = rowY3;
    if (repair.finalCost) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(0, 140, 60);
      doc.text('COSTO FINAL:', M + CW / 2, y);
      doc.setFontSize(9);
      doc.text(`$${repair.finalCost}`, M + CW / 2 + 28, y);
      doc.setTextColor(0, 0, 0);
    }
    y = Math.max(afterEst, y) + 2;

    // Tech notes
    if (repair.technicianNotes) {
      sectionTitle('Notas del Técnico');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      const noteLines = doc.splitTextToSize(this.sanitize(repair.technicianNotes), CW - 4);
      doc.text(noteLines, M + 2, y);
      y += noteLines.length * 4.5 + 3;
    }

    // ── SIGNATURES ───────────────────────────────────────────────
    y += 6;
    hLine(M, W - M, 180);
    y += 4;

    const sigW = (CW - 10) / 2;
    const sig1X = M;
    const sig2X = M + sigW + 10;
    const sigLineY = y + 18;

    // Box 1 — Firma de quien entrega
    doc.setDrawColor(180); doc.setLineWidth(0.3);
    doc.rect(sig1X, y, sigW, 24);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80);
    doc.text('FIRMA DE QUIEN ENTREGA EL EQUIPO', sig1X + sigW / 2, y + 5, { align: 'center' });
    doc.setDrawColor(140); doc.setLineWidth(0.3);
    doc.line(sig1X + 8, sigLineY, sig1X + sigW - 8, sigLineY);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(120, 120, 120);
    doc.text('Nombre y firma del cliente', sig1X + sigW / 2, sigLineY + 4, { align: 'center' });

    // Box 2 — Firma del técnico
    doc.setDrawColor(180); doc.setLineWidth(0.3);
    doc.rect(sig2X, y, sigW, 24);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80);
    doc.text('FIRMA DEL TÉCNICO QUE RECIBE', sig2X + sigW / 2, y + 5, { align: 'center' });
    doc.setDrawColor(140); doc.setLineWidth(0.3);
    doc.line(sig2X + 8, sigLineY, sig2X + sigW - 8, sigLineY);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(120, 120, 120);
    doc.text('Nombre y firma del técnico', sig2X + sigW / 2, sigLineY + 4, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    y += 30;

    // ── FOOTER / WARRANTY ─────────────────────────────────────────
    y += 4;
    doc.setDrawColor(0, 120, 180); doc.setLineWidth(0.6);
    doc.line(M, y, W - M, y);
    y += 4;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(0, 100, 160);
    doc.text('GARANTÍA Y TÉRMINOS DE SERVICIO', W / 2, y, { align: 'center' });
    y += 4;

    const warrantyText =
      'Toda reparación realizada en nuestro taller cuenta con una GARANTÍA DE 30 DÍAS a partir de la fecha de entrega, ' +
      'la cual cubre exclusivamente la falla reparada. La garantía no aplica en casos de daños por humedad, ' +
      'golpes, mal uso, o intervenciones de terceros. El equipo no reclamado en un plazo de 60 días será ' +
      'considerado abandonado. Al firmar este comprobante, el cliente acepta los términos y condiciones del servicio.';

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(100, 100, 100);
    const wLines = doc.splitTextToSize(warrantyText, CW);
    doc.text(wLines, W / 2, y, { align: 'center' });
    y += wLines.length * 3.5 + 4;

    doc.setFont('helvetica', 'italic'); doc.setFontSize(6); doc.setTextColor(160, 160, 160);
    doc.text(`Comprobante generado el ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })} · ${shopName}`,
      W / 2, y, { align: 'center' });

    doc.save(`${repair.orderNumber}.pdf`);
  }

  /** Letter-size invoice (factura) generated when repair status is 'entregado'. */
  async generateInvoice(repair: RepairOrder): Promise<void> {
    const { jsPDF } = await import('jspdf');

    const W = 215.9;
    const H = 279.4;
    const M = 18;
    const CW = W - M * 2;
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    let y = M;

    // ── Load shop settings ──────────────────────────────────────
    let shopName = 'Aguirre Fix Pro';
    let logoDataUrl: string | null = null;
    try {
      const settings = await firstValueFrom(this.api.getSettings());
      if (settings.shopName) shopName = settings.shopName;
      if (settings.logoBase64 && settings.logoMimeType)
        logoDataUrl = `data:${settings.logoMimeType};base64,${settings.logoBase64}`;
    } catch { /* use defaults */ }

    // ── Helpers ─────────────────────────────────────────────────
    const hLine = (lx = M, rx = W - M, color = 200) => {
      doc.setDrawColor(color); doc.setLineWidth(0.3);
      doc.line(lx, y, rx, y); y += 3;
    };

    const sectionTitle = (text: string) => {
      y += 2;
      doc.setFillColor(230, 240, 255);
      doc.rect(M, y - 4, CW, 7, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(0, 80, 160);
      doc.text(text.toUpperCase(), M + 3, y);
      y += 5; doc.setTextColor(0, 0, 0);
    };

    const dataRow = (label: string, value: string, col2 = false, x2 = M + CW / 2) => {
      if (!col2) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
        doc.text(label, M, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '-', M + 38, y); y += 5.5;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text(label, x2, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '-', x2 + 28, y);
      }
    };

    const formatDateStr = (iso: string): string => {
      if (!iso) return '-';
      const d = iso.split('T')[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return iso;
      const [yy, mm, dd] = d.split('-').map(Number);
      const dt = new Date(yy, mm - 1, dd);
      return isNaN(dt.getTime()) ? iso
        : dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    // ── HEADER ───────────────────────────────────────────────────
    const logoSize = 22;
    const logoX = M;
    const logoY = y - 2;

    if (logoDataUrl) {
      try { doc.addImage(logoDataUrl, logoX, logoY, logoSize, logoSize); } catch { }
    }

    const textX = logoDataUrl ? M + logoSize + 5 : M;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(30, 30, 30);
    doc.text(shopName.toUpperCase(), textX, y + 5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(100, 100, 100);
    doc.text('Servicio Técnico de Reparaciones', textX, y + 11);

    // Folio box top-right — labeled "FACTURA"
    const folioBoxX = W - M - 52;
    doc.setFillColor(0, 80, 160); doc.rect(folioBoxX, logoY, 52, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text('F A C T U R A', folioBoxX + 26, logoY + 5.5, { align: 'center' });

    doc.setDrawColor(0, 80, 160); doc.setLineWidth(0.6);
    doc.rect(folioBoxX, logoY + 8, 52, 14);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(0, 80, 160);
    doc.text(repair.orderNumber, folioBoxX + 26, logoY + 16, { align: 'center' });

    const deliveryDate = repair.updatedAt
      ? new Date(repair.updatedAt).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text(`Fecha entrega: ${deliveryDate}`, folioBoxX + 26, logoY + 20, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    y = logoY + logoSize + 5;

    // Title bar — FACTURA DE SERVICIO TÉCNICO
    doc.setFillColor(0, 80, 160); doc.rect(M, y, CW, 10, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
    doc.text('FACTURA DE SERVICIO TÉCNICO', W / 2, y + 7, { align: 'center' });
    doc.setTextColor(0, 0, 0); y += 14;

    // ── CLIENTE ──────────────────────────────────────────────────
    sectionTitle('Datos del Cliente');
    dataRow('Cliente:', repair.clientName ?? '-');
    dataRow('Teléfono:', repair.clientPhone ?? '-');

    // ── DISPOSITIVO ──────────────────────────────────────────────
    sectionTitle('Equipo Reparado');
    doc.setFontSize(8);
    const rowY = y;
    dataRow('Marca:', repair.deviceBrand);
    const afterBrand = y; y = rowY;
    dataRow('Modelo:', repair.deviceModel, true);
    y = Math.max(afterBrand, y);

    if (repair.imei) {
      const rY2 = y;
      dataRow('IMEI:', repair.imei);
      const afterImei = y; y = rY2;
      if (repair.accessories) dataRow('Accesorios:', repair.accessories, true);
      y = Math.max(afterImei, y);
    } else if (repair.accessories) {
      dataRow('Accesorios:', repair.accessories);
    }

    // ── SERVICIO PRESTADO ─────────────────────────────────────────
    sectionTitle('Descripción del Servicio');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const issueLines = doc.splitTextToSize(repair.issueDescription, CW - 4);
    doc.text(issueLines, M + 2, y);
    y += issueLines.length * 4.5 + 3;

    if (repair.technicianNotes) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80);
      const noteLines = doc.splitTextToSize(
        'Diagnóstico/Observaciones: ' + this.sanitize(repair.technicianNotes), CW - 4);
      doc.text(noteLines, M + 2, y);
      y += noteLines.length * 4 + 3;
      doc.setTextColor(0, 0, 0);
    }

    // ── TABLA DE COBRO ────────────────────────────────────────────
    sectionTitle('Resumen de Cobro');
    y += 1;

    // Table header
    doc.setFillColor(215, 230, 255);
    doc.rect(M, y - 4, CW, 7, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(0, 60, 140);
    doc.text('CONCEPTO', M + 3, y);
    doc.text('IMPORTE', W - M - 3, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 5;

    // Servicio row
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(`Reparación de ${repair.deviceBrand} ${repair.deviceModel}`, M + 3, y);
    const finalAmt = repair.finalCost ?? repair.estimatedCost ?? 0;
    doc.text(`$${finalAmt.toFixed ? finalAmt.toFixed(2) : finalAmt}`, W - M - 3, y, { align: 'right' });
    y += 5.5;

    hLine(M, W - M, 200);

    // Total box
    const totalBoxX = W - M - 65;
    doc.setFillColor(0, 80, 160);
    doc.roundedRect(totalBoxX, y, 65, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(160, 210, 255);
    doc.text('TOTAL PAGADO', totalBoxX + 10, y + 5.5);
    doc.setFontSize(13); doc.setTextColor(255, 255, 255);
    doc.text(`$${finalAmt.toFixed ? finalAmt.toFixed(2) : finalAmt}`, totalBoxX + 60, y + 10, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 20;

    // PAGADO stamp
    doc.setDrawColor(0, 160, 80); doc.setLineWidth(1.2);
    doc.roundedRect(M, y - 16, 38, 14, 2, 2);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(0, 160, 80);
    doc.text('PAGADO', M + 19, y - 7.5, { align: 'center' });
    doc.setTextColor(0, 0, 0); doc.setLineWidth(0.3);
    y += 8;

    // ── FOOTER ───────────────────────────────────────────────────
    y += 4;
    doc.setFillColor(0, 80, 160);
    doc.rect(M, y, CW, 0.8, 'F');
    y += 5;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(0, 100, 160);
    doc.text('GARANTÍA Y TÉRMINOS DE SERVICIO', W / 2, y, { align: 'center' });
    y += 4;

    const warrantyText =
      'Toda reparación realizada en nuestro taller cuenta con una GARANTÍA DE 30 DÍAS a partir de la fecha de entrega, ' +
      'la cual cubre exclusivamente la falla reparada. La garantía no aplica en casos de daños por humedad, ' +
      'golpes, mal uso, o intervenciones de terceros. Al firmar esta factura, el cliente acepta los términos y condiciones del servicio.';

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(100, 100, 100);
    const wLines = doc.splitTextToSize(warrantyText, CW);
    doc.text(wLines, W / 2, y, { align: 'center' });
    y += wLines.length * 3.5 + 4;

    doc.setFont('helvetica', 'italic'); doc.setFontSize(6); doc.setTextColor(160, 160, 160);
    doc.text(
      `Factura generada el ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })} · ${shopName}`,
      W / 2, y, { align: 'center' });

    doc.save(`FACTURA-${repair.orderNumber}.pdf`);
  }
}
