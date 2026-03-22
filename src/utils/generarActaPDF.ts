import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EntregaCompleta } from "../hooks/useEntregaCompleta";
import logoImg from "../assets/images/logo.png";

export const generarActaPDF = (entrega: EntregaCompleta) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colores corporativos
  const primaryColor: [number, number, number] = [95, 179, 162]; // Verde turquesa del logo
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Azul oscuro
  const lightGray: [number, number, number] = [245, 245, 245];
  
  // Header con fondo de color
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  // Logo real
  try {
    doc.addImage(logoImg, "PNG", 10, 7, 20, 20);
  } catch (error) {
    console.error("Error al cargar logo:", error);
  }
  
  // Información de la empresa en el header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("GESTIÓN DE ACTIVOS IT", 35, 15);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Control y Entrega de Equipos", 40, 21);
  
  // Fecha en el header
  const fechaActa = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  doc.setFontSize(8);
  doc.text(`Fecha: ${fechaActa}`, pageWidth - 15, 20, { align: "right" });
  
  // Título del documento
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ACTA DE ENTREGA DE EQUIPOS", pageWidth / 2, 48, { align: "center" });
  
  // Línea decorativa
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, 52, pageWidth - 15, 52);
  
  let yPos = 60;
  
  // Sección: Información de la Oficina
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DE LA OFICINA RECEPTORA", 18, yPos);
  yPos += 10;
  
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Regional:", entrega.oficina.regional || "-"],
      ["Ciudad:", entrega.oficina.ciudad || "-"],
      ["Departamento:", entrega.oficina.departamento || "-"],
      ["Localidad:", entrega.oficina.localidad || "-"],
      ["Empresa:", entrega.oficina.empresa || "-"],
      ["Nombre de Oficina:", entrega.oficina.nombre || "-"],
      ["Dirección:", entrega.oficina.direccion || "-"],
      ["Área:", entrega.oficina.area || "-"],
    ],
    theme: "striped",
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: secondaryColor,
      textColor: 255,
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: secondaryColor },
      1: { cellWidth: 130 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Sección: Responsable de la Oficina
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RESPONSABLE DE LA OFICINA", 18, yPos);
  yPos += 10;
  
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Nombre:", entrega.oficina.responsable_nombre || "-"],
      ["Documento:", entrega.oficina.responsable_documento || "-"],
      ["Teléfono:", entrega.oficina.telefono || "-"],
      ["Email:", entrega.oficina.email || "-"],
    ],
    theme: "striped",
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: secondaryColor },
      1: { cellWidth: 130 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Sección: Usuario Final
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("USUARIO FINAL", 18, yPos);
  yPos += 10;
  
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Nombre:", entrega.usuario.nombre || "-"],
      ["Documento:", entrega.usuario.documento || "-"],
      ["Email:", entrega.usuario.email || "-"],
      ["Teléfono:", entrega.usuario.telefono || "-"],
      ["Área:", entrega.usuario.area || "-"],
    ],
    theme: "striped",
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: secondaryColor },
      1: { cellWidth: 130 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Sección: Información de Envío
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN DE ENVÍO", 18, yPos);
  yPos += 10;
  
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Número de Guía:", entrega.envio.numero_guia || "-"],
      ["Empresa de Envío:", entrega.envio.empresa_envio || "-"],
      ["Fecha de Envío:", entrega.envio.fecha_envio ? new Date(entrega.envio.fecha_envio).toLocaleDateString("es-CO") : "-"],
      ["Estado del Envío:", entrega.envio.estado_envio || "-"],
    ],
    theme: "striped",
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: secondaryColor },
      1: { cellWidth: 130 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Sección: Equipos Entregados
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("EQUIPOS ENTREGADOS", 18, yPos);
  yPos += 10;
  
  doc.setTextColor(0, 0, 0);
  
  const activosData = entrega.activos.map((activo, index) => [
    (index + 1).toString(),
    activo.tipo || "-",
    activo.marca || "-",
    activo.modelo || "-",
    activo.serial || "-",
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["#", "Tipo", "Marca", "Modelo", "Serial"]],
    body: activosData,
    theme: "striped",
    styles: { 
      fontSize: 8, 
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: secondaryColor, 
      textColor: 255, 
      fontStyle: "bold",
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 45 },
      4: { cellWidth: 55, fontStyle: "bold", textColor: secondaryColor }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Verificar si necesitamos una nueva página
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  // Sección: Estado de Asignación
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ESTADO DE ASIGNACIÓN", 18, yPos);
  yPos += 10;
  
  doc.setTextColor(0, 0, 0);
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ["Estado:", entrega.estado || "-"],
      ["Fecha de Asignación:", entrega.fecha_asignacion ? new Date(entrega.fecha_asignacion).toLocaleDateString("es-CO") : "-"],
    ],
    theme: "striped",
    styles: { 
      fontSize: 9, 
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: secondaryColor },
      1: { cellWidth: 130 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 20;
  
  // Verificar espacio para firmas
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  // Sección: Firmas
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("FIRMAS Y ACEPTACIÓN", 18, yPos);
  yPos += 15;
  
  doc.setTextColor(0, 0, 0);
  
  // Firma del responsable de oficina
  const col1X = 30;
  const col2X = 120;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.line(col1X, yPos, col1X + 60, yPos);
  doc.text("Responsable de Oficina", col1X, yPos + 5);
  doc.setFontSize(8);
  doc.text(entrega.oficina.responsable_nombre || "", col1X, yPos + 10);
  doc.text(`CC: ${entrega.oficina.responsable_documento || ""}`, col1X, yPos + 15);
  
  // Firma del usuario final
  doc.setFontSize(10);
  doc.line(col2X, yPos, col2X + 60, yPos);
  doc.text("Usuario Final", col2X, yPos + 5);
  doc.setFontSize(8);
  doc.text(entrega.usuario.nombre || "", col2X, yPos + 10);
  doc.text(`CC: ${entrega.usuario.documento || ""}`, col2X, yPos + 15);
  
  // Footer con diseño
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea superior del footer
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    
    // Texto del footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" }
    );
    doc.text(
      `Generado: ${new Date().toLocaleString("es-CO")}`,
      15,
      pageHeight - 12
    );
    doc.text(
      "Sistema de Gestión IT",
      pageWidth - 15,
      pageHeight - 12,
      { align: "right" }
    );
  }
  
  // Generar nombre del archivo
  const nombreArchivo = `Acta_Entrega_${entrega.envio.numero_guia || entrega.asignacion_id}_${new Date().getTime()}.pdf`;
  
  // Descargar PDF
  doc.save(nombreArchivo);
};
