import * as XLSX from 'xlsx';

export interface DatosExportacion {
  id: number;
  fecha_asignacion: string;
  estado: string;
  numero_guia?: string;
  empresa_envio?: string;
  usuario_nombre?: string;
  usuario_documento?: string;
  usuario_email?: string;
  usuario_telefono?: string;
  oficina_regional?: string;
  oficina_ciudad?: string;
  oficina_localidad?: string;
  activo_tipo?: string;
  activo_marca?: string;
  activo_modelo?: string;
  activo_serial?: string;
}

export const exportarAExcel = (datos: DatosExportacion[], nombreArchivo: string = 'entregas') => {
  if (datos.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Preparar datos para exportación
  const datosFormateados = datos.map(item => ({
    'ID': item.id,
    'Fecha Asignación': item.fecha_asignacion ? new Date(item.fecha_asignacion).toLocaleDateString('es-CO') : '',
    'Estado': item.estado || '',
    'Número de Guía': item.numero_guia || '',
    'Empresa Envío': item.empresa_envio || '',
    'Usuario': item.usuario_nombre || '',
    'Documento': item.usuario_documento || '',
    'Email': item.usuario_email || '',
    'Teléfono': item.usuario_telefono || '',
    'Regional': item.oficina_regional || '',
    'Ciudad': item.oficina_ciudad || '',
    'Localidad': item.oficina_localidad || '',
    'Tipo Activo': item.activo_tipo || '',
    'Marca': item.activo_marca || '',
    'Modelo': item.activo_modelo || '',
    'Serial': item.activo_serial || '',
  }));

  // Crear libro de trabajo
  const ws = XLSX.utils.json_to_sheet(datosFormateados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Entregas');

  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 8 },  // ID
    { wch: 15 }, // Fecha
    { wch: 12 }, // Estado
    { wch: 15 }, // Guía
    { wch: 15 }, // Empresa
    { wch: 25 }, // Usuario
    { wch: 15 }, // Documento
    { wch: 25 }, // Email
    { wch: 15 }, // Teléfono
    { wch: 20 }, // Regional
    { wch: 20 }, // Ciudad
    { wch: 20 }, // Localidad
    { wch: 15 }, // Tipo
    { wch: 15 }, // Marca
    { wch: 15 }, // Modelo
    { wch: 20 }, // Serial
  ];
  ws['!cols'] = colWidths;

  // Generar archivo Excel
  const fecha = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${nombreArchivo}_${fecha}.xlsx`);
};

export const exportarACSV = (datos: DatosExportacion[], nombreArchivo: string = 'entregas') => {
  if (datos.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Preparar datos para exportación
  const datosFormateados = datos.map(item => ({
    'ID': item.id,
    'Fecha Asignación': item.fecha_asignacion ? new Date(item.fecha_asignacion).toLocaleDateString('es-CO') : '',
    'Estado': item.estado || '',
    'Número de Guía': item.numero_guia || '',
    'Empresa Envío': item.empresa_envio || '',
    'Usuario': item.usuario_nombre || '',
    'Documento': item.usuario_documento || '',
    'Email': item.usuario_email || '',
    'Teléfono': item.usuario_telefono || '',
    'Regional': item.oficina_regional || '',
    'Ciudad': item.oficina_ciudad || '',
    'Localidad': item.oficina_localidad || '',
    'Tipo Activo': item.activo_tipo || '',
    'Marca': item.activo_marca || '',
    'Modelo': item.activo_modelo || '',
    'Serial': item.activo_serial || '',
  }));

  // Crear hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(datosFormateados);
  
  // Convertir a CSV
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  // Crear blob y descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fecha = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${nombreArchivo}_${fecha}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
