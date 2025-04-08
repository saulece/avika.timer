// stats.js - Cálculo de estadísticas y exportación
window.Avika = window.Avika || {};
Avika.stats = {
    // Función para calcular y mostrar promedios por categoría
    calcularPromedios: function() {
        // Solo usamos órdenes completadas para los cálculos
        if (Avika.data.completedOrders.length === 0) {
            Avika.ui.showNotification('No hay datos suficientes para calcular promedios');
            return;
        }
        
        // Agrupar por categoría
        var categoriasTiempos = {};
        var totalPorCategoria = {};
        
        // Para tiempos de entrega
        var tiempoTotalEntrega = 0;
        var totalEntregas = 0;
        
        // Inicializar contadores para cada categoría
        for (var key in Avika.config.categoryNames) {
            categoriasTiempos[key] = 0;
            totalPorCategoria[key] = 0;
        }
        
        // Sumar tiempos por categoría
        Avika.data.completedOrders.forEach(function(order) {
            // Ignorar órdenes sin tiempo de preparación completo
            if (!order.endTime) return;
            
            var categoria = order.category;
            var tiempoEnSegundos = (new Date(order.endTime) - new Date(order.startTime)) / 1000;
            
            categoriasTiempos[categoria] += tiempoEnSegundos;
            totalPorCategoria[categoria]++;
            
            // Calcular estadísticas de entrega si están disponibles
            if (order.deliveryDepartureTime && order.deliveryArrivalTime) {
                var tiempoEntregaSegundos = (new Date(order.deliveryArrivalTime) - new Date(order.deliveryDepartureTime)) / 1000;
                tiempoTotalEntrega += tiempoEntregaSegundos;
                totalEntregas++;
            }
        });
        
        // Crear tabla HTML con resultados - MODIFICADO para hacerlo más compacto en móviles
        var contenidoPromedio = '<div style="background-color: white; padding: 10px; border-radius: 8px; margin-top: 10px; max-width: 100%; overflow-x: hidden;">';
        contenidoPromedio += '<h2 style="font-size: 1.2rem; margin-bottom: 10px;">Promedio de Preparación por Categoría</h2>';
        contenidoPromedio += '<div style="overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%;">'; // Contenedor con scroll para tablas
        contenidoPromedio += '<table style="width: 100%; border-collapse: collapse; min-width: 280px; table-layout: fixed;">';
        contenidoPromedio += '<thead><tr><th style="padding: 6px; border: 1px solid #ddd; background-color: #3498db; color: white; width: 40%;">Categoría</th><th style="padding: 6px; border: 1px solid #ddd; background-color: #3498db; color: white; width: 30%;">Tiempo</th><th style="padding: 6px; border: 1px solid #ddd; background-color: #3498db; color: white; width: 30%;">Cantidad</th></tr></thead>';
        contenidoPromedio += '<tbody>';
        
        for (var categoria in categoriasTiempos) {
            if (totalPorCategoria[categoria] > 0) {
                var tiempoPromedio = categoriasTiempos[categoria] / totalPorCategoria[categoria];
                var minutos = Math.floor(tiempoPromedio / 60);
                var segundos = Math.floor(tiempoPromedio % 60);
                
                contenidoPromedio += '<tr>';
                contenidoPromedio += '<td style="padding: 6px; border: 1px solid #ddd;">' + Avika.config.categoryNames[categoria] + '</td>';
                contenidoPromedio += '<td style="padding: 6px; border: 1px solid #ddd; text-align: center;">' + Avika.ui.padZero(minutos) + ':' + Avika.ui.padZero(segundos) + ' min</td>';
                contenidoPromedio += '<td style="padding: 6px; border: 1px solid #ddd; text-align: center;">' + totalPorCategoria[categoria] + '</td>';
                contenidoPromedio += '</tr>';
            }
        }
        
        contenidoPromedio += '</tbody></table>';
        contenidoPromedio += '</div>'; // Fin del contenedor con scroll
        
        // Agregar estadísticas de entrega si hay datos
        if (totalEntregas > 0) {
            var tiempoPromedioEntrega = tiempoTotalEntrega / totalEntregas;
            var minutosEntrega = Math.floor(tiempoPromedioEntrega / 60);
            var segundosEntrega = Math.floor(tiempoPromedioEntrega % 60);
            
            contenidoPromedio += '<h2 style="font-size: 1.2rem; margin-top: 15px; margin-bottom: 10px;">Promedio de Tiempo de Entrega</h2>';
            contenidoPromedio += '<div style="overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%;">'; // Contenedor con scroll para tablas
            contenidoPromedio += '<table style="width: 100%; border-collapse: collapse; min-width: 280px; table-layout: fixed;">';
            contenidoPromedio += '<thead><tr><th style="padding: 6px; border: 1px solid #ddd; background-color: #f39c12; color: white; width: 40%;">Concepto</th><th style="padding: 6px; border: 1px solid #ddd; background-color: #f39c12; color: white; width: 30%;">Tiempo</th><th style="padding: 6px; border: 1px solid #ddd; background-color: #f39c12; color: white; width: 30%;">Cantidad</th></tr></thead>';
            contenidoPromedio += '<tbody>';
            contenidoPromedio += '<tr>';
            contenidoPromedio += '<td style="padding: 6px; border: 1px solid #ddd;">Tiempo de Entrega</td>';
            contenidoPromedio += '<td style="padding: 6px; border: 1px solid #ddd; text-align: center;">' + Avika.ui.padZero(minutosEntrega) + ':' + Avika.ui.padZero(segundosEntrega) + ' min</td>';
            contenidoPromedio += '<td style="padding: 6px; border: 1px solid #ddd; text-align: center;">' + totalEntregas + '</td>';
            contenidoPromedio += '</tr>';
            contenidoPromedio += '</tbody></table>';
            contenidoPromedio += '</div>'; // Fin del contenedor con scroll
        }
        
        contenidoPromedio += '</div>';
        
        // Crear un diálogo modal para mostrar los promedios - MODIFICADO para mejores proporciones
        var modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.zIndex = '1001';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.padding = '10px'; // Agregado padding para evitar que el contenido toque los bordes
        
        var modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '15px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.maxWidth = '95%';
        modalContent.style.width = '350px'; // Ancho fijo para mejor visualización en móviles
        modalContent.style.maxHeight = '80%';
        modalContent.style.overflow = 'auto';
        modalContent.style.boxSizing = 'border-box';
        
        modalContent.innerHTML = contenidoPromedio;
        
        var closeButton = document.createElement('button');
        closeButton.textContent = 'Cerrar';
        closeButton.style.marginTop = '15px';
        closeButton.style.padding = '10px 15px';
        closeButton.style.backgroundColor = '#e74c3c';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.width = '100%'; // Botón de ancho completo
        
        closeButton.onclick = function() {
            document.body.removeChild(modal);
        };
        
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },

    // Función para exportar a Excel (CSV) - Versión simplificada
    exportarDatos: function() {
        // Verificar que haya datos para exportar
        if (Avika.data.completedOrders.length === 0) {
            Avika.ui.showNotification('No hay datos para exportar');
            return;
        }
        
        // Exportar directamente todos los datos
        this.exportarCSV();
    },

    // Función para mostrar un modal con opciones de exportación
    mostrarOpcionesExportacion: function() {
        // Esta función ya no se utiliza, pero se mantiene por compatibilidad
        this.exportarDatos();
    },

    // Función para formatear fecha para input date
    formatearFechaParaInput: function(fecha) {
        var year = fecha.getFullYear();
        var month = Avika.ui.padZero(fecha.getMonth() + 1);
        var day = Avika.ui.padZero(fecha.getDate());
        
        return year + '-' + month + '-' + day;
    },

    // Función para exportar a CSV - Simplificada para exportar todos los datos
    exportarCSV: function(fechaDesde, fechaHasta, incluirEstadisticas) {
        Avika.ui.showLoading();
        
        // Incluir estadísticas por defecto
        incluirEstadisticas = (incluirEstadisticas !== false);
        
        // Usar todas las órdenes completadas
        var ordenesAExportar = Avika.data.completedOrders;
        
        // Crear cabecera del CSV
        var csv = 'Platillo,Categoría,Servicio,Inicio,Fin,Tiempo (seg),Tiempo (min:seg),Ticket,Notas\n';
        
        // Agregar datos de cada orden
        ordenesAExportar.forEach(function(order) {
            var tiempoEnSegundos = order.endTime ? (new Date(order.endTime) - new Date(order.startTime)) / 1000 : 0;
            var minutos = Math.floor(tiempoEnSegundos / 60);
            var segundos = Math.floor(tiempoEnSegundos % 60);
            var tiempoFormateado = Avika.ui.padZero(minutos) + ':' + Avika.ui.padZero(segundos);
            
            var row = [
                '"' + order.dish + '"',
                '"' + Avika.config.categoryNames[order.category] + '"',
                '"' + Avika.config.serviceNames[order.serviceType] + '"',
                '"' + new Date(order.startTime).toLocaleString() + '"',
                order.endTime ? '"' + new Date(order.endTime).toLocaleString() + '"' : '""',
                tiempoEnSegundos,
                '"' + tiempoFormateado + '"',
                order.ticketId ? '"' + order.ticketId + '"' : '""',
                order.notes ? '"' + order.notes.replace(/"/g, '""') + '"' : '""'
            ];
            
            csv += row.join(',') + '\n';
        });
        
        // Incluir estadísticas si se solicitó
        if (incluirEstadisticas) {
            // Estadísticas por categoría
            csv += '\nCategoría,Tiempo Promedio (min:seg),Cantidad\n';
            
            var categoriasTiempos = {};
            var totalPorCategoria = {};
            
            // Inicializar contadores para cada categoría
            for (var key in Avika.config.categoryNames) {
                categoriasTiempos[key] = 0;
                totalPorCategoria[key] = 0;
            }
            
            // Sumar tiempos por categoría
            ordenesAExportar.forEach(function(order) {
                if (!order.endTime) return;
                
                var categoria = order.category;
                var tiempoEnSegundos = (new Date(order.endTime) - new Date(order.startTime)) / 1000;
                
                categoriasTiempos[categoria] += tiempoEnSegundos;
                totalPorCategoria[categoria]++;
            });
            
            // Agregar filas de estadísticas
            for (var categoria in categoriasTiempos) {
                if (totalPorCategoria[categoria] > 0) {
                    var tiempoPromedio = categoriasTiempos[categoria] / totalPorCategoria[categoria];
                    var minutos = Math.floor(tiempoPromedio / 60);
                    var segundos = Math.floor(tiempoPromedio % 60);
                    
                    var row = [
                        '"' + Avika.config.categoryNames[categoria] + '"',
                        '"' + Avika.ui.padZero(minutos) + ':' + Avika.ui.padZero(segundos) + '"',
                        totalPorCategoria[categoria]
                    ];
                    
                    csv += row.join(',') + '\n';
                }
            }
            
            // Estadísticas por tipo de servicio
            csv += '\nTipo de Servicio,Tiempo Promedio (min:seg),Cantidad\n';
            
            var serviciosTiempos = {
                'comedor': 0,
                'domicilio': 0,
                'para-llevar': 0
            };
            var totalPorServicio = {
                'comedor': 0,
                'domicilio': 0,
                'para-llevar': 0
            };
            
            // Sumar tiempos por tipo de servicio
            ordenesAExportar.forEach(function(order) {
                var servicio = order.serviceType;
                var tiempoEnSegundos = (new Date(order.endTime) - new Date(order.startTime)) / 1000;
                
                if (serviciosTiempos[servicio] !== undefined) {
                    serviciosTiempos[servicio] += tiempoEnSegundos;
                    totalPorServicio[servicio]++;
                }
            });
            
            // Agregar filas de estadísticas por servicio
            for (var servicio in serviciosTiempos) {
                if (totalPorServicio[servicio] > 0) {
                    var tiempoPromedio = serviciosTiempos[servicio] / totalPorServicio[servicio];
                    var minutos = Math.floor(tiempoPromedio / 60);
                    var segundos = Math.floor(tiempoPromedio % 60);
                    
                    var row = [
                        '"' + Avika.config.serviceNames[servicio] + '"',
                        '"' + Avika.ui.padZero(minutos) + ':' + Avika.ui.padZero(segundos) + '"',
                        totalPorServicio[servicio]
                    ];
                    
                    csv += row.join(',') + '\n';
                }
            }
            
            // Estadísticas para tiempos de entrega (domicilio)
            var tiempoTotalEntrega = 0;
            var totalEntregas = 0;
            
            ordenesAExportar.forEach(function(order) {
                if (order.deliveryDepartureTime && order.deliveryArrivalTime) {
                    var tiempoEntregaSegundos = (new Date(order.deliveryArrivalTime) - new Date(order.deliveryDepartureTime)) / 1000;
                    tiempoTotalEntrega += tiempoEntregaSegundos;
                    totalEntregas++;
                }
            });
            
            if (totalEntregas > 0) {
                csv += '\nEstadísticas de Entrega,Tiempo Promedio (min:seg),Cantidad\n';
                
                var tiempoPromedioEntrega = tiempoTotalEntrega / totalEntregas;
                var minutosEntrega = Math.floor(tiempoPromedioEntrega / 60);
                var segundosEntrega = Math.floor(tiempoPromedioEntrega % 60);
                
                csv += '"Tiempo de Entrega",';
                csv += '"' + Avika.ui.padZero(minutosEntrega) + ':' + Avika.ui.padZero(segundosEntrega) + '",';
                csv += totalEntregas + '\n';
            }
        }
        
        // Crear link de descarga
        var csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var csvUrl = URL.createObjectURL(csvBlob);
        
        var link = document.createElement('a');
        link.href = csvUrl;
        var hoy = new Date();
        var fecha = hoy.getFullYear() + '-' + Avika.ui.padZero(hoy.getMonth() + 1) + '-' + Avika.ui.padZero(hoy.getDate());
        
        // Nombre simplificado del archivo
        var nombreArchivo = 'avika_tiempos_' + fecha;
        
        link.download = nombreArchivo + '.csv';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Avika.ui.hideLoading();
        Avika.ui.showNotification('Datos exportados correctamente: ' + ordenesAExportar.length + ' registros');
    }
};