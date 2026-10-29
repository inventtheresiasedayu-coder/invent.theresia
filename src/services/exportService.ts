import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssetItem, LoanRecord } from '../types/inventory';

export const exportService = {
  /**
   * Export assets list to formatted Excel (.xlsx)
   */
  exportAssetsToExcel(assets: AssetItem[], filterTitle: string = 'Semua Aset'): void {
    const rows = assets.map((item, index) => ({
      'No.': index + 1,
      'Kode Aset (KAS)': item.kodeAset,
      'Nama Barang': item.namaBarang,
      'Jenis Aset': item.jenisAsetName,
      'Tim Pelayanan (Timpel)': item.timpelName,
      'Tahun Perolehan': item.tahunPerolehan,
      'Bulan': item.bulanPerolehan || '-',
      'Jumlah': item.quantity,
      'Satuan': item.satuan,
      'Kondisi Fisik': item.kondisi,
      'Lokasi': item.lokasi,
      'Ruang': item.ruangNama,
      'Pengguna': item.pengguna,
      'Status': item.statusPeminjaman,
      'Nilai Perolehan (Rp)': item.hargaNilai > 0 ? item.hargaNilai : '-',
      'Jadwal Perawatan': item.jadwalPerawatan || '-',
      'Terakhir Opname': item.terakhirOpname || '-',
      'Keterangan': item.keterangan || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = [
      { wch: 6 },  // No
      { wch: 26 }, // Kode Aset
      { wch: 35 }, // Nama Barang
      { wch: 30 }, // Jenis Aset
      { wch: 18 }, // Timpel
      { wch: 16 }, // Tahun
      { wch: 10 }, // Bulan
      { wch: 8 },  // Jumlah
      { wch: 8 },  // Satuan
      { wch: 15 }, // Kondisi
      { wch: 28 }, // Lokasi
      { wch: 22 }, // Ruang
      { wch: 18 }, // Pengguna
      { wch: 12 }, // Status
      { wch: 18 }, // Nilai
      { wch: 16 }, // Perawatan
      { wch: 16 }, // Opname
      { wch: 25 }, // Keterangan
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaris PGPM Sedayu');

    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanFilter = filterTitle.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(workbook, `Inventaris_PGPM_Sedayu_${cleanFilter}_${dateStr}.xlsx`);
  },

  /**
   * Export assets to formal PDF with Church Letterhead (KAS PGPM Sedayu standard)
   */
  exportAssetsToPDF(
    assets: AssetItem[],
    title: string = 'LAPORAN REKAPITULASI INVENTARISASI ASET TETAP',
    subTitle: string = 'PAROKI SANTA THERESIA SEDAYU'
  ): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Church Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 45, 90);
    doc.text('PENGURUS GEREJA DAN PAPA MISKIN (PGPM)', pageWidth / 2, 14, { align: 'center' });
    doc.text('PAROKI SANTA THERESIA SEDAYU - KEUSKUPAN AGUNG SEMARANG', pageWidth / 2, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(
      'Gubug, Argosari, Sedayu, Bantul, D.I. Yogyakarta 55752 | Email: invent.theresia.sedayu@gmail.com',
      pageWidth / 2,
      25,
      { align: 'center' }
    );

    // Divider Line
    doc.setDrawColor(20, 45, 90);
    doc.setLineWidth(0.8);
    doc.line(14, 28, pageWidth - 14, 28);
    doc.setLineWidth(0.2);
    doc.line(14, 29, pageWidth - 14, 29);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(title, pageWidth / 2, 35, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    const dateFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Kriteria: ${subTitle} | Tanggal Cetak: ${dateFormatted} | Total: ${assets.length} item`, pageWidth / 2, 40, {
      align: 'center',
    });

    // Table Content
    const tableData = assets.map((item, idx) => [
      idx + 1,
      item.kodeAset,
      item.namaBarang,
      item.jenisAsetKode,
      item.timpelKode,
      item.tahunPerolehan,
      `${item.quantity} ${item.satuan}`,
      item.kondisi,
      item.lokasi,
      item.ruangNama,
      item.statusPeminjaman,
    ]);

    autoTable(doc, {
      startY: 44,
      head: [
        ['No', 'Kode Aset', 'Nama Barang', 'Jenis', 'Timpel', 'Tahun', 'Jml', 'Kondisi', 'Lokasi', 'Ruang', 'Status'],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138], // Dark Blue Church PGPM
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 40,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 36, fontStyle: 'bold' },
        2: { cellWidth: 55 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'center', cellWidth: 14 },
        6: { halign: 'center', cellWidth: 16 },
        7: { halign: 'center', cellWidth: 20 },
        8: { cellWidth: 42 },
        9: { cellWidth: 32 },
        10: { halign: 'center', cellWidth: 20 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer on each page
        const str = `Halaman ${data.pageNumber} | Sistem Inventarisasi PGPM Paroki St. Theresia Sedayu`;
        doc.setFontSize(7);
        doc.setTextColor(130, 130, 130);
        doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      },
    });

    // Signatures section on last page
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    if (finalY + 35 < doc.internal.pageSize.getHeight()) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      const signY = finalY;
      doc.text('Mengetahui / Mengesahkan,', 40, signY);
      doc.text('Pastor Kepala Paroki Sedayu', 40, signY + 5);
      doc.text('(Ketua PGPM Paroki Sedayu)', 40, signY + 9);
      doc.text('_________________________________', 40, signY + 28);
      doc.setFont('helvetica', 'bold');
      doc.text('Romo Paroki St. Theresia Sedayu', 40, signY + 33);

      doc.setFont('helvetica', 'normal');
      doc.text(`Sedayu, ${dateFormatted}`, pageWidth - 90, signY);
      doc.text('Tim Pelayanan Pemeliharaan & Inventaris', pageWidth - 90, signY + 5);
      doc.text('(Pengurus Inventarisasi)', pageWidth - 90, signY + 9);
      doc.text('_________________________________', pageWidth - 90, signY + 28);
      doc.setFont('helvetica', 'bold');
      doc.text('Ketua Tim Inventaris Paroki', pageWidth - 90, signY + 33);
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`Laporan_Inventaris_PGPM_Sedayu_${dateStr}.pdf`);
  },

  /**
   * Export formal Surat Peminjaman Aset (Surat Jalan / Berita Acara)
   */
  exportLoanReceiptPDF(loan: LoanRecord, asset?: AssetItem): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Church Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 45, 90);
    doc.text('PENGURUS GEREJA DAN PAPA MISKIN (PGPM)', pageWidth / 2, 16, { align: 'center' });
    doc.text('PAROKI SANTA THERESIA SEDAYU', pageWidth / 2, 22, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(
      'Gubug, Argosari, Sedayu, Bantul, D.I. Yogyakarta 55752 | Telp/WA: (0274) Paroki Sedayu',
      pageWidth / 2,
      27,
      { align: 'center' }
    );

    // Line
    doc.setDrawColor(20, 45, 90);
    doc.setLineWidth(0.8);
    doc.line(16, 30, pageWidth - 16, 30);
    doc.setLineWidth(0.2);
    doc.line(16, 31, pageWidth - 16, 31);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('SURAT JALAN & BERITA ACARA PEMINJAMAN ASET GEREJA', pageWidth / 2, 39, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Nomor Registrasi: ${loan.id}`, pageWidth / 2, 45, { align: 'center' });

    // Details Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(16, 50, pageWidth - 32, 85, 3, 3, 'FD');

    let curY = 58;
    const drawRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 22, curY);
      doc.setFont('helvetica', 'normal');
      doc.text(`:  ${value}`, 65, curY);
      curY += 8;
    };

    drawRow('Nama Barang Dipinjam', loan.namaBarang);
    drawRow('Kode Inventaris Aset', loan.assetKode);
    drawRow('Jumlah Dipinjam', `${loan.jumlahPinjam} ${asset?.satuan || 'unit'}`);
    drawRow('Nama Peminjam', loan.namaPeminjam);
    drawRow('No. Kontak / WA', loan.kontakPeminjam);
    drawRow('Komunitas / Wilayah', loan.lingkunganWilayah);
    drawRow('Keperluan / Acara', loan.keperluan);
    drawRow('Tanggal Pengambilan', loan.tanggalPinjam);
    drawRow('Batas Pengembalian', loan.tanggalKembaliRencana);
    drawRow('Status Saat Ini', loan.status);

    // Terms
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Ketentuan Peminjaman Aset Paroki:', 16, 145);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const terms = [
      '1. Peminjam bertanggung jawab penuh atas keutuhan, kebersihan, dan keselamatan barang inventaris.',
      '2. Barang wajib dikembalikan tepat waktu sesuai tanggal rencana pengembalian.',
      '3. Apabila terjadi kerusakan atau kehilangan, peminjam wajib memperbaiki atau mengganti sesuai kondisi semula.',
      '4. Dilarang memindahtangankan barang pinjaman kepada pihak ketiga tanpa persetujuan tertulis PGPM.',
    ];
    let termY = 152;
    terms.forEach((t) => {
      doc.text(t, 20, termY);
      termY += 6;
    });

    // Signature boxes
    const signY = 188;
    doc.text('Peminjam / Penanggung Jawab,', 25, signY);
    doc.text('_____________________________', 25, signY + 28);
    doc.setFont('helvetica', 'bold');
    doc.text(loan.namaPeminjam, 25, signY + 33);

    doc.setFont('helvetica', 'normal');
    doc.text('Petugas Inventaris / PGPM,', pageWidth - 80, signY);
    doc.text('_____________________________', pageWidth - 80, signY + 28);
    doc.setFont('helvetica', 'bold');
    doc.text(loan.petugas, pageWidth - 80, signY + 33);

    doc.save(`Surat_Pinjam_${loan.id}_${loan.namaPeminjam.replace(/\s+/g, '_')}.pdf`);
  },
};
