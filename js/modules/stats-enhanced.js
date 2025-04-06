// js/modules/stats-enhanced.js - Estadísticas mejoradas para análisis de tiempos
(function() {
    window.Avika = window.Avika || {};
    Avika.statsEnhanced = Avika.statsEnhanced || {};
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('statsEnhanced');
    }
    
    // Función para calcular estadísticas por tipo de cocina
    Avika.statsEnhanced.calculateKitchenStats = function() {
        try {
            if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
                Avika.ui.showNotification('No hay datos para calcular estadísticas');
                return null;
            }
            
            // Estadísticas por tipo de cocina
            var stats = {
                cold: { count: 0, totalTime: 0, avgTime: 0, minTime: Infinity, maxTime: 0 },
                hot: { count: 0, totalTime: 0, avgTime: 0, minTime: Infinity, maxTime: 0 },
                both: { count: 0, totalTime: 0, avgTime: 0, minTime: Infinity, maxTime: 0 },
                delivery: { count: 0, totalTime: 0, avgTime: 0, minTime: Infinity, maxTime: 0 }
            };
            
            // Procesar órdenes completadas
            Avika.data.completedOrders.forEach(function(order) {
                // Verificar que tiene tiempos completos
                if (!order.startTime || !order.finishTime) return;
                
                var startTime = new Date(order.startTime);
                var finishTime = new Date(order.finishTime);
                
                // Calcular tiempo en segundos
                var timeSeconds = Math.floor((finishTime - startTime) / 1000);
                
                // Determinar tipo de cocina
                var kitchenType = 'unknown';
                
                if (order.kitchenType) {
                    kitchenType = order.kitchenType;
                } else if (order.isSpecialCombo) {
                    kitchenType = 'both';
                } else {
                    // Intentar determinar por categoría
                    for (var category in Avika.config.dishes) {
                        if (Avika.config.dishes[category].includes(order.dish)) {
                            if (Avika.config.kitchenTypes && Avika.config.kitchenTypes[category]) {
                                kitchenType = Avika.config.kitchenTypes[category];
                            }
                            break;
                        }
                    }
                }
                
                // Actualizar estadísticas para este tipo de cocina
                if (stats[kitchenType]) {
                    stats[kitchenType].count++;
                    stats[kitchenType].totalTime += timeSeconds;
                    stats[kitchenType].minTime = Math.min(stats[kitchenType].minTime, timeSeconds);
                    stats[kitchenType].maxTime = Math.max(stats[kitchenType].maxTime, timeSeconds);
                }
                
                // Actualizar estadísticas de entrega si hay datos
                if (order.service === 'domicilio' && order.deliveryDepartureTime && order.deliveryArrivalTime) {
                    var departureTime = new Date(order.deliveryDepartureTime);
                    var arrivalTime = new Date(order.deliveryArrivalTime);
                    var deliveryTimeSeconds = Math.floor((arrivalTime - departureTime) / 1000);
                    
                    stats.delivery.count++;
                    stats.delivery.totalTime += deliveryTimeSeconds;
                    stats.delivery.minTime = Math.min(stats.delivery.minTime, deliveryTimeSeconds);
                    stats.delivery.maxTime = Math.max(stats.delivery.maxTime, deliveryTimeSeconds);
                }
            });
            
            // Calcular promedios
            for (var type in stats) {
                if (stats[type].count > 0) {
                    stats[type].avgTime = Math.round(stats[type].totalTime / stats[type].count);
                }
            }
            
            return stats;
        } catch (e) {
            console.error("Error al calcular estadísticas:", e);
            Avika.ui.showErrorMessage("Error al calcular estadísticas: " + e.message);
            return null;
        }
    };
    
    // Función para mostrar estadísticas en modo detallado
    Avika.statsEnhanced.showDetailedStats = function() {
        try {
            // Calcular estadísticas
            var stats = this.calculateKitchenStats();
            if (!stats) return;
            
            // Crear modal para mostrar estadísticas
            var modal = document.createElement('div');
            modal.className = 'stats-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            
            // Contenido del modal
            var content = document.createElement('div');
            content.style.backgroundColor = 'white';
            content.style.padding = '20px';
            content.style.borderRadius = '8px';
            content.style.maxWidth = '90%';
            content.style.width = '600px';
            content.style.maxHeight = '80vh';
            content.style.overflowY = 'auto';
            content.style.color = '#333';
            
            // Título
            var title = document.createElement('h2');
            title.textContent = 'Estadísticas Detalladas de Tiempos';
            title.style.marginTop = '0';
            title.style.borderBottom = '1px solid #eee';
            title.style.paddingBottom = '10px';
            
            content.appendChild(title);
            
            // Función auxiliar para formatear tiempo
            function formatTimeFromSeconds(seconds) {
                var mins = Math.floor(seconds / 60);
                var secs = seconds % 60;
                return mins + ':' + Avika.dateUtils.padZero(secs);
            }
            
            // Crear tabla para cada tipo de cocina
            var kitchenTypes = {
                cold: 'Cocina Fría',
                hot: 'Cocina Caliente',
                both: 'Combos Especiales',
                delivery: 'Tiempos de Entrega'
            };
            
            for (var type in kitchenTypes) {
                if (stats[type] && stats[type].count > 0) {
                    var typeTitle = document.createElement('h3');
                    typeTitle.textContent = kitchenTypes[type];
                    typeTitle.style.marginTop = '20px';
                    typeTitle.style.marginBottom = '10px';
                    
                    var table = document.createElement('table');
                    table.style.width = '100%';
                    table.style.borderCollapse = 'collapse';
                    
                    // Cabecera
                    var thead = document.createElement('thead');
                    var headerRow = document.createElement('tr');
                    
                    var headers = ['Estadística', 'Valor'];
                    headers.forEach(function(text) {
                        var th = document.createElement('th');
                        th.textContent = text;
                        th.style.padding = '8px';
                        th.style.backgroundColor = type === 'cold' ? '#3498db' : 
                                                  type === 'hot' ? '#e74c3c' : 
                                                  type === 'both' ? '#9b59b6' : '#2ecc71';
                        th.style.color = 'white';
                        th.style.textAlign = 'left';
                        headerRow.appendChild(th);
                    });
                    
                    thead.appendChild(headerRow);
                    table.appendChild(thead);
                    
                    // Cuerpo
                    var tbody = document.createElement('tbody');
                    
                    // Filas de estadísticas
                    var rows = [
                        ['Total platillos', stats[type].count],
                        ['Tiempo promedio', formatTimeFromSeconds(stats[type].avgTime)],
                        ['Tiempo mínimo', formatTimeFromSeconds(stats[type].minTime)],
                        ['Tiempo máximo', formatTimeFromSeconds(stats[type].maxTime)]
                    ];
                    
                    rows.forEach(function(rowData, index) {
                        var row = document.createElement('tr');
                        row.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
                        
                        rowData.forEach(function(cellData) {
                            var cell = document.createElement('td');
                            cell.textContent = cellData;
                            cell.style.padding = '8px';
                            cell.style.border = '1px solid #ddd';
                            row.appendChild(cell);
                        });
                        
                        tbody.appendChild(row);
                    });
                    
                    table.appendChild(tbody);
                    
                    content.appendChild(typeTitle);
                    content.appendChild(table);
                }
            }
            
            // Botón para cerrar
            var closeBtn = document.createElement('button');
            closeBtn.textContent = 'Cerrar';
            closeBtn.style.marginTop = '20px';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.backgroundColor = '#2c3e50';
            closeBtn.style.color = 'white';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '4px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.display = 'block';
            closeBtn.style.width = '100%';
            
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            content.appendChild(closeBtn);
            modal.appendChild(content);
            
            // Añadir al cuerpo
            document.body.appendChild(modal);
            
            // Cerrar con Escape
            function handleEscape(e) {
                if (e.key === 'Escape') {
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', handleEscape);
                }
            }
            
            document.addEventListener('keydown', handleEscape);
            
        } catch (e) {
            console.error("Error al mostrar estadísticas:", e);
            Avika.ui.showErrorMessage("Error al mostrar estadísticas: " + e.message);
        }
    };
    
    // Exportar a CSV mejorado
    Avika.statsEnhanced.exportToCSV = function() {
        try {
            if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
                Avika.ui.showNotification('No hay datos para exportar');
                return;
            }
            
            // Encabezados CSV
            var headers = [
                'Platillo',
                'Tipo de Cocina',
                'Cantidad',
                'Servicio',
                'Hora Inicio',
                'Hora Fin',
                'Tiempo de Preparación',
                'Tiempo Objetivo',
                'Diferencia',
                'Estado',
                'Notas'
            ];
            
            var csv = headers.join(',') + '\n';
            
            // Procesar órdenes completadas
            Avika.data.completedOrders.forEach(function(order) {
                // Verificar que tiene tiempos completos
                if (!order.startTime || !order.finishTime) return;
                
                var startTime = new Date(order.startTime);
                var finishTime = new Date(order.finishTime);
                
                // Formatear horas
                var startTimeFormatted = Avika.dateUtils.formatTime(startTime);
                var endTimeFormatted = Avika.dateUtils.formatTime(finishTime);
                
                // Calcular tiempo en segundos
                var timeSeconds = Math.floor((finishTime - startTime) / 1000);
                var prepTimeFormatted = Math.floor(timeSeconds / 60) + ':' + Avika.dateUtils.padZero(timeSeconds % 60);
                
                // Determinar tipo de cocina
                var kitchenType = 'unknown';
                
                if (order.kitchenType) {
                    kitchenType = order.kitchenType;
                } else if (order.isSpecialCombo) {
                    kitchenType = 'both';
                } else {
                    // Intentar determinar por categoría
                    for (var category in Avika.config.dishes) {
                        if (Avika.config.dishes[category].includes(order.dish)) {
                            if (Avika.config.kitchenTypes && Avika.config.kitchenTypes[category]) {
                                kitchenType = Avika.config.kitchenTypes[category];
                            }
                            break;
                        }
                    }
                }
                
                // Determinar tiempo objetivo según tipo de cocina
                var targetTime = 0;
                if (Avika.config.targetTimes && Avika.config.targetTimes[kitchenType]) {
                    targetTime = Avika.config.targetTimes[kitchenType] * 60; // en segundos
                } else {
                    // Tiempos por defecto si no hay configuración
                    switch (kitchenType) {
                        case 'cold': targetTime = 7 * 60; break; // 7 minutos
                        case 'hot': targetTime = 12 * 60; break; // 12 minutos
                        case 'both': targetTime = 15 * 60; break; // 15 minutos
                        default: targetTime = 10 * 60; // 10 minutos por defecto
                    }
                }
                
                // Calcular diferencia con tiempo objetivo
                var diffTime = timeSeconds - targetTime;
                var diffTimeFormatted = (diffTime < 0 ? '-' : '') + 
                                       Math.floor(Math.abs(diffTime) / 60) + ':' + 
                                       Avika.dateUtils.padZero(Math.abs(diffTime) % 60);
                
                // Determinar estado (a tiempo, tarde)
                var status = diffTime <= 0 ? 'A tiempo' : 'Tarde';
                
                // Formatear tipo de cocina
                var kitchenTypeFormatted = kitchenType === 'cold' ? 'Fría' : 
                                          kitchenType === 'hot' ? 'Caliente' : 
                                          kitchenType === 'both' ? 'Combo' : kitchenType;
                
                // Formatear servicio
                var serviceFormatted = order.service === 'comedor' ? 'Comedor' : 
                                      order.service === 'domicilio' ? 'Domicilio' : 
                                      order.service === 'para-llevar' ? 'Para llevar' : order.service;
                
                // Escapar notas (evitar problemas con comas)
                var notes = order.notes ? '"' + order.notes.replace(/"/g, '""') + '"' : '';
                
                // Crear fila CSV
                var row = [
                    '"' + order.dish + '"',
                    kitchenTypeFormatted,
                    order.quantity || 1,
                    serviceFormatted,
                    startTimeFormatted,
                    endTimeFormatted,
                    prepTimeFormatted,
                    Math.floor(targetTime / 60) + ':' + Avika.dateUtils.padZero(targetTime % 60),
                    diffTimeFormatted,
                    status,
                    notes
                ];
                
                csv += row.join(',') + '\n';
            });
            
            // Crear blob y descargar
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            
            var downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'avika_tiempos_' + new Date().toISOString().split('T')[0] + '.csv';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            Avika.ui.showNotification("Datos exportados a CSV correctamente");
            
        } catch (e) {
            console.error("Error al exportar a CSV:", e);
            Avika.ui.showErrorMessage("Error al exportar datos: " + e.message);
        }
    };
    // Función para exportar a formato Excel
Avika.statsEnhanced.exportToExcel = function() {
    try {
        if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
            Avika.ui.showNotification('No hay datos para exportar');
            return;
        }
        
        // Crear un libro nuevo
        var wb = XLSX.utils.book_new();
        
        // Datos para la hoja principal
        var wsData = [
            [
                'Platillo', 
                'Tipo de Cocina', 
                'Cantidad', 
                'Servicio', 
                'Fecha', 
                'Hora Inicio', 
                'Hora Fin', 
                'Tiempo de Preparación', 
                'Tiempo Objetivo', 
                'Diferencia', 
                'Estado', 
                'Notas'
            ]
        ];
        
        // Recorrer órdenes completadas
        Avika.data.completedOrders.forEach(function(order) {
            // Verificar que tiene tiempos completos
            if (!order.startTime || !order.finishTime) return;
            
            var startTime = new Date(order.startTime);
            var finishTime = new Date(order.finishTime);
            
            // Formatear fecha
            var dateFormatted = startTime.toLocaleDateString();
            
            // Formatear horas
            var startTimeFormatted = Avika.dateUtils.formatTime(startTime);
            var endTimeFormatted = Avika.dateUtils.formatTime(finishTime);
            
            // Calcular tiempo en segundos
            var timeSeconds = Math.floor((finishTime - startTime) / 1000);
            var prepTimeFormatted = Math.floor(timeSeconds / 60) + ':' + Avika.dateUtils.padZero(timeSeconds % 60);
            
            // Determinar tipo de cocina
            var kitchenType = 'unknown';
            
            if (order.kitchenType) {
                kitchenType = order.kitchenType;
            } else if (order.isSpecialCombo) {
                kitchenType = 'both';
            } else {
                // Intentar determinar por categoría
                for (var category in Avika.config.dishes) {
                    if (Avika.config.dishes[category] && Avika.config.dishes[category].includes(order.dish)) {
                        if (Avika.config.kitchenTypes && Avika.config.kitchenTypes[category]) {
                            kitchenType = Avika.config.kitchenTypes[category];
                        }
                        break;
                    }
                }
            }
            
            // Formatear tipo de cocina
            var kitchenTypeFormatted = kitchenType === 'cold' ? 'Fría' : 
                                       kitchenType === 'hot' ? 'Caliente' : 
                                       kitchenType === 'both' ? 'Combo' : kitchenType;
            
            // Determinar tiempo objetivo según tipo de cocina
            var targetTime = 0;
            if (Avika.config.targetTimes && Avika.config.targetTimes[kitchenType]) {
                targetTime = Avika.config.targetTimes[kitchenType] * 60; // en segundos
            } else {
                // Tiempos por defecto si no hay configuración
                switch (kitchenType) {
                    case 'cold': targetTime = 7 * 60; break; // 7 minutos
                    case 'hot': targetTime = 12 * 60; break; // 12 minutos
                    case 'both': targetTime = 15 * 60; break; // 15 minutos
                    default: targetTime = 10 * 60; // 10 minutos por defecto
                }
            }
            
            // Calcular diferencia con tiempo objetivo
            var diffTime = timeSeconds - targetTime;
            var diffTimeFormatted = (diffTime < 0 ? '-' : '') + 
                                   Math.floor(Math.abs(diffTime) / 60) + ':' + 
                                   Avika.dateUtils.padZero(Math.abs(diffTime) % 60);
            
            // Determinar estado (a tiempo, tarde)
            var status = diffTime <= 0 ? 'A tiempo' : 'Tarde';
            
            // Formatear servicio
            var serviceFormatted = order.service === 'comedor' ? 'Comedor' : 
                                  order.service === 'domicilio' ? 'Domicilio' : 
                                  order.service === 'para-llevar' ? 'Para llevar' : order.service;
            
            // Añadir fila
            wsData.push([
                order.dish,
                kitchenTypeFormatted,
                order.quantity || 1,
                serviceFormatted,
                dateFormatted,
                startTimeFormatted,
                endTimeFormatted,
                prepTimeFormatted,
                Math.floor(targetTime / 60) + ':' + Avika.dateUtils.padZero(targetTime % 60),
                diffTimeFormatted,
                status,
                order.notes || ''
            ]);
        });
        
        // Crear hoja de cálculo
        var ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Añadir la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, "Tiempos de preparación");
        
        // Generar archivo XLSX
        var wbout = XLSX.write(wb, {bookType:'xlsx', type:'binary'});
        
        // Función para convertir cadena a ArrayBuffer
        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
        
        // Crear Blob y descargar
        var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
        var url = URL.createObjectURL(blob);
        
        var downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = 'avika_tiempos_' + new Date().toISOString().split('T')[0] + '.xlsx';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        Avika.ui.showNotification("Datos exportados a Excel correctamente");
        
    } catch (e) {
        console.error("Error al exportar a Excel:", e);
        Avika.ui.showErrorMessage("Error al exportar datos: " + e.message);
    }
};
    console.log("Módulo de estadísticas mejoradas inicializado");
})();