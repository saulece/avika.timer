// storage.js - Funciones de guardado/carga de datos
window.Avika = window.Avika || {};
Avika.storage = {
    lastSavedState: '',
    
    // Función para guardar datos automáticamente en el almacenamiento local
    guardarDatosLocales: function() {
        try {
            console.log("Guardando datos locales...");
            
            // Verificar que tenemos datos para guardar
            if (!Avika.data) {
                console.warn("No hay datos para guardar");
                return false;
            }
            
            // Preparar objeto de datos
            var dataToSave = {
                pendingOrders: Avika.data.pendingOrders || [],
                completedOrders: Avika.data.completedOrders || [],
                lastSaved: new Date()
            };
            
            // Serializamos fechas correctamente
            var processedData = JSON.stringify(dataToSave, function(key, value) {
                // Convertir objetos Date a strings ISO
                if (value instanceof Date) {
                    return value.toISOString();
                }
                return value;
            });
            
            // Guardar en localStorage
            localStorage.setItem('avika_timer_data', processedData);
            
            console.log("Datos guardados correctamente");
            return true;
        } catch (e) {
            console.error("Error al guardar datos:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al guardar datos: " + e.message);
            }
            return false;
        }
    },
    
    // Función para cargar datos guardados desde el almacenamiento local
    cargarDatosGuardados: function() {
        try {
            console.log("Cargando datos guardados...");
            
            // Obtener datos de localStorage
            var savedData = localStorage.getItem('avika_timer_data');
            
            if (!savedData) {
                console.log("No hay datos guardados para cargar");
                return false;
            }
            
            // Parsear los datos guardados
            var parsedData = JSON.parse(savedData, function(key, value) {
                // Revisar propiedades que deberían ser fechas
                if (key === 'startTime' || key === 'finishTime' || key === 'lastSaved') {
                    return new Date(value);
                }
                return value;
            });
            
            // Restaurar datos
            if (parsedData.pendingOrders) {
                Avika.data.pendingOrders = parsedData.pendingOrders;
            }
            
            if (parsedData.completedOrders) {
                Avika.data.completedOrders = parsedData.completedOrders;
            }
            
            console.log("Datos cargados correctamente", {
                pendingCount: Avika.data.pendingOrders.length,
                completedCount: Avika.data.completedOrders.length,
                lastSaved: parsedData.lastSaved
            });
            
            return true;
        } catch (e) {
            console.error("Error al cargar datos guardados:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al cargar datos: " + e.message);
            }
            return false;
        }
    },
    
    // Función para limpiar el historial de pedidos completados
    limpiarHistorial: function() {
        if (confirm('¿Estás seguro de que deseas eliminar todo el historial de pedidos completados?')) {
            Avika.data.completedOrders = [];
            localStorage.removeItem('avika_completedOrders');
            Avika.ui.updateCompletedTable(false);
            this.guardarDatosLocales();
            console.log('Historial limpiado correctamente');
        }
    },
    
    // Función para exportar datos
    exportarDatos: function() {
        try {
            console.log("Exportando datos...");
            
            if (!Avika.data.completedOrders || Avika.data.completedOrders.length === 0) {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification("No hay datos para exportar", 3000);
                }
                return false;
            }
            
            // Preparar datos para exportar
            var dataToExport = {
                completedOrders: Avika.data.completedOrders,
                exportDate: new Date(),
                appVersion: Avika.VERSION || '1.0.0'
            };
            
            // Convertir a JSON
            var jsonData = JSON.stringify(dataToExport, null, 2);
            
            // Crear blob y enlace para descargar
            var blob = new Blob([jsonData], {type: 'application/json'});
            var url = URL.createObjectURL(blob);
            
            // Crear enlace de descarga
            var downloadLink = document.createElement('a');
            downloadLink.href = url;
            var date = new Date();
            var dateStr = date.getFullYear() + '-' + 
                         (date.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                         date.getDate().toString().padStart(2, '0');
            downloadLink.download = 'avika-datos-' + dateStr + '.json';
            
            // Simular clic y limpiar
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Datos exportados correctamente", 3000);
            }
            
            return true;
        } catch (e) {
            console.error("Error al exportar datos:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al exportar datos: " + e.message);
            }
            return false;
        }
    },
    
    // Función para limpiar todos los datos
    limpiarDatos: function() {
        try {
            console.log("Limpiando datos...");
            
            // Limpiar datos en memoria
            Avika.data.pendingOrders = [];
            Avika.data.completedOrders = [];
            
            // Limpiar almacenamiento local
            localStorage.removeItem('avika_timer_data');
            
            // Actualizar UI
            if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable(false);
            }
            
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Todos los datos han sido eliminados", 3000);
            }
            
            return true;
        } catch (e) {
            console.error("Error al limpiar datos:", e);
            if (Avika.ui && typeof Avika.ui.showErrorMessage === 'function') {
                Avika.ui.showErrorMessage("Error al limpiar datos: " + e.message);
            }
            return false;
        }
    }
};