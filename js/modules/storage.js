// storage.js - Funciones de guardado/carga de datos
window.Avika = window.Avika || {};
Avika.storage = {
    lastSavedState: '',
    
    // Función para guardar datos automáticamente en el almacenamiento local
    guardarDatosLocales: function() {
        try {
            // Verificar si hay cambios antes de guardar
            var currentState = JSON.stringify(Avika.data.pendingOrders) + JSON.stringify(Avika.data.completedOrders);
            if (currentState !== this.lastSavedState) {
                localStorage.setItem('avika_pendingOrders', JSON.stringify(Avika.data.pendingOrders));
                localStorage.setItem('avika_completedOrders', JSON.stringify(Avika.data.completedOrders));
                localStorage.setItem('avika_lastSaved', new Date().toString());
                this.lastSavedState = currentState;
                console.log('Datos guardados localmente:', new Date().toLocaleTimeString());
            }
        } catch (e) {
            console.error('Error al guardar datos localmente:', e);
        }
    },
    
    // Función para cargar datos guardados desde el almacenamiento local
    cargarDatosGuardados: function() {
        try {
            var pendingOrders = localStorage.getItem('avika_pendingOrders');
            var completedOrders = localStorage.getItem('avika_completedOrders');
            var lastSaved = localStorage.getItem('avika_lastSaved');
            
            if (pendingOrders) {
                var parsedPending = JSON.parse(pendingOrders);
                
                // Restaurar objetos Date
                parsedPending.forEach(function(order) {
                    // Restaurar fechas usando campos ISO si existen
                    if (order.startTimeISO) {
                        order.startTime = new Date(order.startTimeISO);
                    } else if (typeof order.startTime === 'string') {
                        order.startTime = new Date(order.startTime);
                        // Guardar el formato ISO para futuras cargas
                        order.startTimeISO = order.startTime.toISOString();
                    }
                    
                    if (order.finishTimeISO) {
                        order.finishTime = new Date(order.finishTimeISO);
                    } else if (order.finishTime && typeof order.finishTime === 'string') {
                        order.finishTime = new Date(order.finishTime);
                        // Guardar el formato ISO para futuras cargas
                        order.finishTimeISO = order.finishTime.toISOString();
                    }
                    
                    // Otras fechas posibles
                    if (order.kitchenFinishedTimeISO) {
                        order.kitchenFinishedTime = new Date(order.kitchenFinishedTimeISO);
                    } else if (order.kitchenFinishedTime && typeof order.kitchenFinishedTime === 'string') {
                        order.kitchenFinishedTime = new Date(order.kitchenFinishedTime);
                        order.kitchenFinishedTimeISO = order.kitchenFinishedTime.toISOString();
                    }
                });
                
                Avika.data.pendingOrders = parsedPending;
                console.log('Órdenes pendientes cargadas');
            }
            
            if (completedOrders) {
                var parsedCompleted = JSON.parse(completedOrders);
                
                // Restaurar objetos Date
                parsedCompleted.forEach(function(order) {
                    // Restaurar fechas usando campos ISO si existen
                    if (order.startTimeISO) {
                        order.startTime = new Date(order.startTimeISO);
                    } else if (typeof order.startTime === 'string') {
                        order.startTime = new Date(order.startTime);
                        // Guardar el formato ISO para futuras cargas
                        order.startTimeISO = order.startTime.toISOString();
                    }
                    
                    if (order.finishTimeISO) {
                        order.finishTime = new Date(order.finishTimeISO);
                    } else if (order.finishTime && typeof order.finishTime === 'string') {
                        order.finishTime = new Date(order.finishTime);
                        // Guardar el formato ISO para futuras cargas
                        order.finishTimeISO = order.finishTime.toISOString();
                    }
                    
                    // Otras fechas posibles
                    if (order.kitchenFinishedTimeISO) {
                        order.kitchenFinishedTime = new Date(order.kitchenFinishedTimeISO);
                    } else if (order.kitchenFinishedTime && typeof order.kitchenFinishedTime === 'string') {
                        order.kitchenFinishedTime = new Date(order.kitchenFinishedTime);
                        order.kitchenFinishedTimeISO = order.kitchenFinishedTime.toISOString();
                    }
                });
                
                Avika.data.completedOrders = parsedCompleted;
                console.log('Órdenes completadas cargadas');
            }
            
            if (lastSaved) {
                console.log('Última vez guardado:', lastSaved);
            }
            
            // Actualizar el estado guardado para evitar guardar inmediatamente después de cargar
            this.lastSavedState = JSON.stringify(Avika.data.pendingOrders) + JSON.stringify(Avika.data.completedOrders);
            
            return true;
        } catch (e) {
            console.error('Error al cargar datos guardados:', e);
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
    }
};