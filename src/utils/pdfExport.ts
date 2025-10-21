import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Product, Sale } from "@/types/sales";

export const exportSalesToPDF = (product: Product) => {
  const doc = new jsPDF();
  
  // Set colors - Apple-inspired minimalist design
  const primaryColor: [number, number, number] = [0, 122, 255]; // iOS Blue
  const textColor: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [242, 242, 247];

  // Header with product name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(product.name, 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Sales Report - ${new Date().toLocaleDateString()}`, 20, 33);

  // Summary cards
  const summaryY = 50;
  doc.setTextColor(...textColor);
  
  const totalSales = product.sales.reduce((sum, s) => sum + s.total, 0);
  const totalProfit = product.sales.reduce((sum, s) => sum + s.profit, 0);
  const totalQuantity = product.sales.reduce((sum, s) => sum + s.quantity, 0);
  const pendingAmount = product.sales.reduce((sum, s) => sum + s.remaining, 0);

  // Summary section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 20, summaryY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const summaryData = [
    ["Total Sales", `PKR ${totalSales.toLocaleString()}`],
    ["Total Profit", `PKR ${totalProfit.toLocaleString()}`],
    ["Quantity Sold", totalQuantity.toString()],
    ["Pending Payments", `PKR ${pendingAmount.toLocaleString()}`],
  ];

  let yPos = summaryY + 10;
  summaryData.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, 20, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(value, 100, yPos);
    yPos += 8;
  });

  // Sales table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Sales History", 20, yPos + 10);

  const tableData = product.sales.map((sale) => [
    new Date(sale.date).toLocaleDateString(),
    sale.customer,
    sale.quantity.toString(),
    `PKR ${sale.salePrice.toLocaleString()}`,
    `PKR ${sale.total.toLocaleString()}`,
    `PKR ${sale.paid.toLocaleString()}`,
    `PKR ${sale.remaining.toLocaleString()}`,
    sale.status,
  ]);

  autoTable(doc, {
    startY: yPos + 15,
    head: [
      [
        "Date",
        "Customer",
        "Qty",
        "Price",
        "Total",
        "Paid",
        "Remaining",
        "Status",
      ],
    ],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: lightGray,
      textColor: textColor,
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 8,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 25, halign: "right" },
      7: { cellWidth: 20, halign: "center" },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  doc.save(`${product.name}_sales_report_${new Date().toISOString().split("T")[0]}.pdf`);
};
