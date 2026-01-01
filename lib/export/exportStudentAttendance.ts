import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export interface StudentAttendanceExportData {
  "Nama Siswa": string;
  Email: string;
  NISN: string;
  "Total Hari": number;
  Hadir: number;
  Terlambat: number;
  Sakit: number;
  Izin: number;
  Alfa: number;
  "Persentase Kehadiran": string;
}

export const exportStudentAttendanceToExcel = async (
  student: any,
  attendances: any[],
  startDate: string,
  endDate: string,
  filename?: string
) => {
  try {
    // Dynamically import xlsx only on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on the client side");
    }

    const XLSX = await import("xlsx");

    // Calculate statistics
    const stats = {
      total: attendances.length,
      present: attendances.filter((a: any) => a.status === "present").length,
      late: attendances.filter((a: any) => a.status === "late").length,
      sick: attendances.filter((a: any) => a.status === "sick").length,
      excused: attendances.filter((a: any) => a.status === "excused").length,
      absent: attendances.filter((a: any) => a.status === "absent").length,
    };

    const presentPercentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    // Transform data for export
    const exportData: StudentAttendanceExportData[] = [
      {
        "Nama Siswa": student.name,
        Email: student.email || "-",
        NISN: student.nisn || "-",
        "Total Hari": stats.total,
        Hadir: stats.present,
        Terlambat: stats.late,
        Sakit: stats.sick,
        Izin: stats.excused,
        Alfa: stats.absent,
        "Persentase Kehadiran": `${presentPercentage}%`,
      },
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Nama Siswa
      { wch: 30 }, // Email
      { wch: 15 }, // NISN
      { wch: 12 }, // Total Hari
      { wch: 10 }, // Hadir
      { wch: 12 }, // Terlambat
      { wch: 10 }, // Sakit
      { wch: 10 }, // Izin
      { wch: 10 }, // Alfa
      { wch: 20 }, // Persentase Kehadiran
    ];
    ws["!cols"] = colWidths;

    // Create filename
    const startDateFormatted = format(new Date(startDate), "dd MMM yyyy", { locale: idLocale });
    const endDateFormatted = format(new Date(endDate), "dd MMM yyyy", { locale: idLocale });
    const exportFilename = filename || `rekap-absensi-${student.name.replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Write file
    XLSX.writeFile(wb, exportFilename);

    return {
      success: true,
      message: `Rekap absensi berhasil diexport: ${exportFilename}`,
      filename: exportFilename,
    };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return {
      success: false,
      message: "Gagal mengexport rekap absensi ke Excel",
      error,
    };
  }
};

export const exportStudentAttendanceDetailToExcel = async (
  student: any,
  attendances: any[],
  startDate: string,
  endDate: string,
  filename?: string
) => {
  try {
    // Dynamically import xlsx only on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on the client side");
    }

    const XLSX = await import("xlsx");

    // Create multiple sheets: Summary and Detail
    const wb = XLSX.utils.book_new();

    // Calculate statistics
    const stats = {
      total: attendances.length,
      present: attendances.filter((a: any) => a.status === "present").length,
      late: attendances.filter((a: any) => a.status === "late").length,
      sick: attendances.filter((a: any) => a.status === "sick").length,
      excused: attendances.filter((a: any) => a.status === "excused").length,
      absent: attendances.filter((a: any) => a.status === "absent").length,
    };

    const presentPercentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    // Sheet 1: Summary
    const summaryData = [
      {
        "Nama Siswa": student.name,
        Email: student.email || "-",
        NISN: student.nisn || "-",
        "Total Hari": stats.total,
        Hadir: stats.present,
        Terlambat: stats.late,
        Sakit: stats.sick,
        Izin: stats.excused,
        Alfa: stats.absent,
        Persentase: `${presentPercentage}%`,
      },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary["!cols"] = [
      { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, 
      { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, 
      { wch: 10 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // Sheet 2: Detail records
    const detailData: any[] = attendances.map((attendance: any) => ({
      "Nama Siswa": student.name,
      Tanggal: format(new Date(attendance.date), "dd/MM/yyyy", { locale: idLocale }),
      "Mata Pelajaran": attendance.schedule?.subject?.name || "-",
      Guru: attendance.schedule?.teacher?.name || "-",
      Ruangan: attendance.schedule?.room || "-",
      "Jam Mulai": attendance.schedule?.startTime || "-",
      "Jam Selesai": attendance.schedule?.endTime || "-",
      Status: getStatusLabel(attendance.status),
      Catatan: attendance.notes || "-",
    }));

    const wsDetail = XLSX.utils.json_to_sheet(detailData);
    wsDetail["!cols"] = [
      { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, 
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Absensi");

    // Create filename
    const exportFilename = filename || `rekap-absensi-detail-${student.name.replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    // Write file
    XLSX.writeFile(wb, exportFilename);

    return {
      success: true,
      message: `Rekap absensi detail berhasil diexport: ${exportFilename}`,
      filename: exportFilename,
    };
  } catch (error) {
    console.error("Error exporting detail to Excel:", error);
    return {
      success: false,
      message: "Gagal mengexport rekap absensi detail ke Excel",
      error,
    };
  }
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    present: "Hadir",
    late: "Terlambat",
    sick: "Sakit",
    excused: "Izin",
    absent: "Alfa",
  };
  return labels[status] || status;
}
