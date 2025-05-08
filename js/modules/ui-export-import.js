// ui-export-import.js - Funciones para exportación e importación de datos
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Exportar datos a archivo JSON
Avika.ui.exportData = function() {
    if (!Avika.data) {
        Avika.ui.showNotification('No hay datos para exportar', 'warning');
        return;
    }
    
    try {
        // Crear objeto de datos para exportar
        var exportData = {
            pendingOrders: Avika.data.pendingOrders || [],
            deliveryOrders: Avika.data.deliveryOrders || [],
            completedOrders: Avika.data.completedOrders || [],
            config: Avika.config || {},
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        // Convertir a JSON
        var jsonData = JSON.stringify(exportData, null, 2);
        
        // Crear blob y enlace de descarga
        var blob = new Blob([jsonData], {type: 'application/json'});
        var url = URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        var downloadLink = document.createElement('a');
        downloadLink.href = url;
        
        // Generar nombre de archivo con fecha
        var now = new Date();
        var dateStr = now.getFullYear() + '-' + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                     now.getDate().toString().padStart(2, '0') + '_' + 
                     now.getHours().toString().padStart(2, '0') + '-' + 
                     now.getMinutes().toString().padStart(2, '0');
        
        downloadLink.download = 'avika_data_' + dateStr + '.json';
        
        // Simular clic para iniciar descarga
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Limpiar
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        Avika.ui.showNotification('Datos exportados correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar datos:', error);
        Avika.ui.showNotification('Error al exportar datos: ' + error.message, 'error');
    }
};

// Importar datos desde archivo JSON
Avika.ui.importData = function() {
    try {
        // Crear input de archivo oculto
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        // Manejar selección de archivo
        fileInput.onchange = function(event) {
            var file = event.target.files[0];
            if (!file) return;
            
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var importedData = JSON.parse(e.target.result);
                    
                    // Validar datos importados
                    if (!importedData || !importedData.version) {
                        throw new Error('Formato de archivo inválido');
                    }
                    
                    // Mostrar confirmación antes de importar
                    Avika.ui.showConfirmationModal(
                        '¿Estás seguro de que deseas importar estos datos? ' +
                        'Esto reemplazará todos los datos actuales. ' +
                        '<br><br>Datos a importar:' +
                        '<br>- Órdenes pendientes: ' + (importedData.pendingOrders ? importedData.pendingOrders.length : 0) +
                        '<br>- Órdenes en reparto: ' + (importedData.deliveryOrders ? importedData.deliveryOrders.length : 0) +
                        '<br>- Órdenes completadas: ' + (importedData.completedOrders ? importedData.completedOrders.length : 0) +
                        '<br><br>Fecha de exportación: ' + new Date(importedData.exportDate).toLocaleString(),
                        function() {
                            // Realizar importación
                            Avika.ui.performDataImport(importedData);
                        }
                    );
                } catch (error) {
                    console.error('Error al procesar archivo:', error);
                    Avika.ui.showNotification('Error al procesar archivo: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        // Simular clic para abrir selector de archivos
        document.body.appendChild(fileInput);
        fileInput.click();
        
        // Limpiar
        setTimeout(function() {
            document.body.removeChild(fileInput);
        }, 1000);
    } catch (error) {
        console.error('Error al importar datos:', error);
        Avika.ui.showNotification('Error al importar datos: ' + error.message, 'error');
    }
};

// Realizar la importación de datos
Avika.ui.performDataImport = function(importedData) {
    try {
        // Crear copia de seguridad de datos actuales
        var backup = {
            pendingOrders: Avika.data.pendingOrders || [],
            deliveryOrders: Avika.data.deliveryOrders || [],
            completedOrders: Avika.data.completedOrders || [],
            config: Avika.config || {}
        };
        
        // Almacenar copia de seguridad en localStorage
        localStorage.setItem('avika_data_backup', JSON.stringify(backup));
        
        // Actualizar datos
        Avika.data.pendingOrders = importedData.pendingOrders || [];
        Avika.data.deliveryOrders = importedData.deliveryOrders || [];
        Avika.data.completedOrders = importedData.completedOrders || [];
        
        // Actualizar configuración si está presente
        if (importedData.config) {
            // Mantener algunas configuraciones locales
            var localConfig = {
                notificationSound: Avika.config.notificationSound,
                notificationDuration: Avika.config.notificationDuration,
                compactMode: Avika.config.compactMode,
                darkMode: Avika.config.darkMode
            };
            
            // Actualizar configuración
            Avika.config = importedData.config;
            
            // Restaurar configuraciones locales
            Avika.config.notificationSound = localConfig.notificationSound;
            Avika.config.notificationDuration = localConfig.notificationDuration;
            Avika.config.compactMode = localConfig.compactMode;
            Avika.config.darkMode = localConfig.darkMode;
        }
        
        // Guardar datos
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Actualizar tablas
        Avika.ui.updatePendingTable();
        Avika.ui.updateDeliveryTable();
        Avika.ui.updateCompletedTable(false);
        
        // Mostrar notificación con opción de restaurar
        var notificationElement = document.getElementById('notification');
        if (notificationElement) {
            // Limpiar notificación existente
            notificationElement.className = '';
            notificationElement.classList.add('notification', 'notification-success');
            
            // Crear contenido con botón de restaurar
            notificationElement.innerHTML = 'Datos importados correctamente. ' +
                '<button id="btn-restore-backup" class="notification-btn">Restaurar datos anteriores</button>';
            
            // Mostrar notificación
            notificationElement.style.display = 'block';
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateY(0)';
            
            // Configurar botón de restaurar
            var restoreBtn = document.getElementById('btn-restore-backup');
            if (restoreBtn) {
                restoreBtn.onclick = function() {
                    Avika.ui.restoreDataBackup();
                };
            }
            
            // Ocultar notificación después de 10 segundos
            setTimeout(function() {
                notificationElement.style.opacity = '0';
                notificationElement.style.transform = 'translateY(20px)';
                
                setTimeout(function() {
                    notificationElement.style.display = 'none';
                }, 300);
            }, 10000);
        } else {
            Avika.ui.showNotification('Datos importados correctamente', 'success');
        }
    } catch (error) {
        console.error('Error al realizar importación:', error);
        Avika.ui.showNotification('Error al realizar importación: ' + error.message, 'error');
    }
};

// Restaurar copia de seguridad de datos
Avika.ui.restoreDataBackup = function() {
    try {
        // Obtener copia de seguridad
        var backupStr = localStorage.getItem('avika_data_backup');
        if (!backupStr) {
            Avika.ui.showNotification('No hay copia de seguridad disponible', 'warning');
            return;
        }
        
        var backup = JSON.parse(backupStr);
        
        // Restaurar datos
        Avika.data.pendingOrders = backup.pendingOrders || [];
        Avika.data.deliveryOrders = backup.deliveryOrders || [];
        Avika.data.completedOrders = backup.completedOrders || [];
        
        // Restaurar configuración si está presente
        if (backup.config) {
            // Mantener algunas configuraciones actuales
            var currentConfig = {
                notificationSound: Avika.config.notificationSound,
                notificationDuration: Avika.config.notificationDuration,
                compactMode: Avika.config.compactMode,
                darkMode: Avika.config.darkMode
            };
            
            // Restaurar configuración
            Avika.config = backup.config;
            
            // Mantener configuraciones actuales
            Avika.config.notificationSound = currentConfig.notificationSound;
            Avika.config.notificationDuration = currentConfig.notificationDuration;
            Avika.config.compactMode = currentConfig.compactMode;
            Avika.config.darkMode = currentConfig.darkMode;
        }
        
        // Guardar datos
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        
        // Actualizar tablas
        Avika.ui.updatePendingTable();
        Avika.ui.updateDeliveryTable();
        Avika.ui.updateCompletedTable(false);
        
        // Eliminar copia de seguridad
        localStorage.removeItem('avika_data_backup');
        
        Avika.ui.showNotification('Datos restaurados correctamente', 'success');
    } catch (error) {
        console.error('Error al restaurar copia de seguridad:', error);
        Avika.ui.showNotification('Error al restaurar copia de seguridad: ' + error.message, 'error');
    }
};

// Exportar datos a Excel
Avika.ui.exportToExcel = function() {
    if (!window.XLSX) {
        Avika.ui.showNotification('Librería SheetJS no disponible', 'error');
        return;
    }
    
    try {
        // Mostrar indicador de carga
        Avika.ui.showLoading();
        
        // Crear libro de trabajo
        var wb = XLSX.utils.book_new();
        
        // Preparar datos de órdenes pendientes
        var pendingData = [];
        if (Avika.data.pendingOrders && Avika.data.pendingOrders.length > 0) {
            pendingData = Avika.data.pendingOrders.map(function(order) {
                return {
                    'ID': order.id,
                    'Platillo': order.dish,
                    'Categoría': order.category || 'No especificada',
                    'Servicio': Avika.ui.formatServiceType(order.serviceType),
                    'Inicio': order.startTimeFormatted || '',
                    'Tiempo Transcurrido': Avika.ui.calculateElapsedTime(order.startTime),
                    'Combo Especial': order.isSpecialCombo ? 'Sí' : 'No',
                    'Cocina Caliente': order.isSpecialCombo ? (order.hotKitchenFinished ? 'Completado' : 'Pendiente') : 'N/A',
                    'Cocina Fría': order.isSpecialCombo ? (order.coldKitchenFinished ? 'Completado' : 'Pendiente') : 'N/A',
                    'Ticket ID': order.ticketId || 'No especificado'
                };
            });
        }
        
        // Preparar datos de órdenes en reparto
        var deliveryData = [];
        if (Avika.data.deliveryOrders && Avika.data.deliveryOrders.length > 0) {
            deliveryData = Avika.data.deliveryOrders.map(function(order) {
                return {
                    'ID': order.id,
                    'Platillo': order.dish,
                    'Categoría': order.category || 'No especificada',
                    'Inicio': order.startTimeFormatted || '',
                    'Salida': order.departureTimeFormatted || '',
                    'Tiempo en Reparto': Avika.ui.calculateElapsedTime(order.departureTime),
                    'Ticket ID': order.ticketId || 'No especificado'
                };
            });
        }
        
        // Preparar datos de órdenes completadas
        var completedData = [];
        if (Avika.data.completedOrders && Avika.data.completedOrders.length > 0) {
            completedData = Avika.data.completedOrders.map(function(order) {
                var data = {
                    'ID': order.id,
                    'Platillo': order.dish,
                    'Categoría': order.category || 'No especificada',
                    'Servicio': Avika.ui.formatServiceType(order.serviceType),
                    'Inicio': order.startTimeFormatted || '',
                    'Finalización': order.completionTimeFormatted || '',
                    'Tiempo Total': Avika.ui.calculateTotalTime(order),
                    'Ticket ID': order.ticketId || 'No especificado'
                };
                
                // Añadir datos de reparto si aplica
                if (order.serviceType === 'domicilio') {
                    data['Salida'] = order.departureTimeFormatted || 'N/A';
                    data['Llegada'] = order.arrivalTimeFormatted || 'N/A';
                    data['Tiempo de Entrega'] = order.departureTime && order.arrivalTime ? 
                        Avika.ui.calculateDeliveryTime(order) : 'N/A';
                }
                
                return data;
            });
        }
        
        // Crear hojas de trabajo
        if (pendingData.length > 0) {
            var wsPending = XLSX.utils.json_to_sheet(pendingData);
            XLSX.utils.book_append_sheet(wb, wsPending, 'Órdenes Pendientes');
        }
        
        if (deliveryData.length > 0) {
            var wsDelivery = XLSX.utils.json_to_sheet(deliveryData);
            XLSX.utils.book_append_sheet(wb, wsDelivery, 'Órdenes en Reparto');
        }
        
        if (completedData.length > 0) {
            var wsCompleted = XLSX.utils.json_to_sheet(completedData);
            XLSX.utils.book_append_sheet(wb, wsCompleted, 'Órdenes Completadas');
        }
        
        // Generar nombre de archivo con fecha
        var now = new Date();
        var dateStr = now.getFullYear() + '-' + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                     now.getDate().toString().padStart(2, '0') + '_' + 
                     now.getHours().toString().padStart(2, '0') + '-' + 
                     now.getMinutes().toString().padStart(2, '0');
        
        var fileName = 'avika_reporte_' + dateStr + '.xlsx';
        
        // Exportar a archivo
        XLSX.writeFile(wb, fileName);
        
        // Ocultar indicador de carga
        Avika.ui.hideLoading();
        
        Avika.ui.showNotification('Datos exportados a Excel correctamente', 'success');
    } catch (error) {
        // Ocultar indicador de carga
        Avika.ui.hideLoading();
        
        console.error('Error al exportar a Excel:', error);
        Avika.ui.showNotification('Error al exportar a Excel: ' + error.message, 'error');
    }
};

// Calcular tiempo transcurrido para exportación
Avika.ui.calculateElapsedTime = function(startTimeStr) {
    if (!startTimeStr) return 'N/A';
    
    try {
        var startTime = new Date(startTimeStr);
        var now = new Date();
        var elapsedSeconds = Math.floor((now - startTime) / 1000);
        
        return Avika.utils.formatElapsedTime(elapsedSeconds);
    } catch (e) {
        return 'Error';
    }
};

// Limpiar todos los datos
Avika.ui.clearAllData = function() {
    // Crear copia de seguridad de datos actuales
    var backup = {
        pendingOrders: Avika.data.pendingOrders || [],
        deliveryOrders: Avika.data.deliveryOrders || [],
        completedOrders: Avika.data.completedOrders || [],
        config: Avika.config || {}
    };
    
    // Almacenar copia de seguridad en localStorage
    localStorage.setItem('avika_data_backup', JSON.stringify(backup));
    
    // Limpiar datos
    Avika.data.pendingOrders = [];
    Avika.data.deliveryOrders = [];
    Avika.data.completedOrders = [];
    
    // Guardar datos
    if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
        Avika.storage.guardarDatosLocales();
    }
    
    // Actualizar tablas
    Avika.ui.updatePendingTable();
    Avika.ui.updateDeliveryTable();
    Avika.ui.updateCompletedTable(false);
    
    // Mostrar notificación con opción de restaurar
    var notificationElement = document.getElementById('notification');
    if (notificationElement) {
        // Limpiar notificación existente
        notificationElement.className = '';
        notificationElement.classList.add('notification', 'notification-success');
        
        // Crear contenido con botón de restaurar
        notificationElement.innerHTML = 'Todos los datos han sido eliminados. ' +
            '<button id="btn-restore-backup" class="notification-btn">Restaurar datos anteriores</button>';
        
        // Mostrar notificación
        notificationElement.style.display = 'block';
        notificationElement.style.opacity = '1';
        notificationElement.style.transform = 'translateY(0)';
        
        // Configurar botón de restaurar
        var restoreBtn = document.getElementById('btn-restore-backup');
        if (restoreBtn) {
            restoreBtn.onclick = function() {
                Avika.ui.restoreDataBackup();
            };
        }
        
        // Ocultar notificación después de 10 segundos
        setTimeout(function() {
            notificationElement.style.opacity = '0';
            notificationElement.style.transform = 'translateY(20px)';
            
            setTimeout(function() {
                notificationElement.style.display = 'none';
            }, 300);
        }, 10000);
    } else {
        Avika.ui.showNotification('Todos los datos han sido eliminados', 'success');
    }
};
