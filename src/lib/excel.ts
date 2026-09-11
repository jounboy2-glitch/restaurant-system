import * as XLSX from 'xlsx'

export function exportToExcel(
  data: any[],
  fileName: string,
  sheetName: string = 'Sheet1'
) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${fileName}-${Date.now()}.xlsx`)
}

export function exportReportToExcel(report: any) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: ማጠቃለያ
  const summaryData = [
    { 'መለኪያ': 'ጠቅላላ ገቢ', 'መጠን (ብር)': report.summary.totalRevenue },
    { 'መለኪያ': 'ጠቅላላ ወጪ', 'መጠን (ብር)': report.summary.totalExpenses },
    { 'መለኪያ': 'ትርፍ/ኪሳራ', 'መጠን (ብር)': report.summary.profit },
    { 'መለኪያ': 'ማርጅን (%)', 'መጠን (ብር)': report.summary.margin.toFixed(2) },
    { 'መለኪያ': 'የትዕዛዞች ብዛት', 'መጠን (ብር)': report.summary.orderCount },
    { 'መለኪያ': 'የክፍያዎች ብዛት', 'መጠን (ብር)': report.summary.paymentCount },
  ]
  const ws1 = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws1, 'ማጠቃለያ')

  // Sheet 2: በክፍያ አይነት
  const methodData = Object.entries(report.byMethod).map(([k, v]) => ({
    'የክፍያ አይነት': k,
    'መጠን (ብር)': v,
  }))
  if (methodData.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(methodData)
    XLSX.utils.book_append_sheet(wb, ws2, 'የክፍያ አይነት')
  }

  // Sheet 3: ወጪዎች
  const categoryData = Object.entries(report.byCategory).map(([k, v]) => ({
    'የወጪ ምድብ': k,
    'መጠን (ብር)': v,
  }))
  if (categoryData.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(categoryData)
    XLSX.utils.book_append_sheet(wb, ws3, 'ወጪዎች')
  }

  XLSX.writeFile(wb, `report-${Date.now()}.xlsx`)
}
