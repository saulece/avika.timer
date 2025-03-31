// stats.js - Cálculo de estadísticas y exportación

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

    // Función para exportar a Excel (CSV)
    exportarDatos: function() {
        if (Avika.data.completedOrders.length === 0) {
            Avika.ui.showNotification('No hay datos para exportar');
            return;
        }
        
        // Crear encabezados CSV
        var csv = 'Platillo,Categoría,Cantidad,Tipo de Servicio,Inicio,Fin,Tiempo Total,Salida Repartidor,Llegada Repartidor,Tiempo de Entrega\n';
        
        // Agregar cada orden completada
        Avika.data.completedOrders.forEach(function(order) {
            var row = [
                '"' + order.dish + '"',
                '"' + Avika.config.categoryNames[order.category] + '"',
                order.quantity,
                '"' + Avika.config.serviceNames[order.serviceType] + '"',
                '"' + order.startTimeFormatted + '"',
                '"' + order.endTimeFormatted + '"',
                '"' + order.prepTime + '"',
                '"' + (order.deliveryDepartureTimeFormatted || '') + '"',
                '"' + (order.deliveryArrivalTimeFormatted || '') + '"',
                '"' + (order.deliveryTime || '') + '"'
            ];
            
            csv += row.join(',') + '\n';
        });
        
        // Crear link de descarga
        var csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var csvUrl = URL.createObjectURL(csvBlob);
        
        var link = document.createElement('a');
        link.href = csvUrl;
        var hoy = new Date();
        var fecha = hoy.getFullYear() + '-' + Avika.ui.padZero(hoy.getMonth() + 1) + '-' + Avika.ui.padZero(hoy.getDate());
        link.download = 'avika_tiempos_' + fecha + '.csv';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Avika.ui.showNotification('Datos exportados correctamente');
    }
};