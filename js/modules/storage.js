// storage.js - Funciones de guardado/carga de datos
window.Avika = window.Avika || {};
Avika.storage = {
    lastSavedState: '',
    autoSaveTimer: null,
    
    // Función para guardar datos automáticamente en el almacenamiento local
guardarDatosLocales: function() {
    try {
        // Verificar si hay cambios antes de guardar
        var currentState = JSON.stringify(Avika.data.pendingOrders) + 
                          JSON.stringify(Avika.data.deliveryOrders) + 
                          JSON.stringify(Avika.data.completedOrders);
        
        if (currentState !== this.lastSavedState) {
            localStorage.setItem('avika_pendingOrders', JSON.stringify(Avika.data.pendingOrders));
            localStorage.setItem('avika_deliveryOrders', JSON.stringify(Avika.data.deliveryOrders));
            localStorage.setItem('avika_completedOrders', JSON.stringify(Avika.data.completedOrders));
            localStorage.setItem('avika_lastSaved', new Date().toString());
            this.lastSavedState = currentState;
        }
    } catch (e) {
        console.error('Error al guardar datos localmente:', e);
    }
},

// Función para cargar datos guardados
cargarDatosGuardados: function() {
    try {
        var savedPending = localStorage.getItem('avika_pendingOrders');
        var savedDelivery = localStorage.getItem('avika_deliveryOrders');
        var savedCompleted = localStorage.getItem('avika_completedOrders');
        
        if (savedPending) {
            Avika.data.pendingOrders = JSON.parse(savedPending);
        }
        
        if (savedDelivery) {
            Avika.data.deliveryOrders = JSON.parse(savedDelivery);
        } else {
            Avika.data.deliveryOrders = []; // Inicializar si no existe
        }
        
        if (savedCompleted) {
            Avika.data.completedOrders = JSON.parse(savedCompleted);
        }
        
        // Actualizar las interfaces
        Avika.ui.updatePendingTable();
        Avika.ui.updateDeliveryTable();
        Avika.ui.updateCompletedTable();
        
        var lastSaved = localStorage.getItem('avika_lastSaved');
        if (lastSaved) {
            Avika.ui.showNotification('Datos cargados de ' + new Date(lastSaved).toLocaleString());
        }
        
        // Actualizar el estado guardado
        this.lastSavedState = JSON.stringify(Avika.data.pendingOrders) + 
                             JSON.stringify(Avika.data.deliveryOrders) + 
                             JSON.stringify(Avika.data.completedOrders);
    } catch (e) {
        console.error('Error al cargar datos guardados:', e);
    }
},

    // Verificar y reparar integridad de datos
    verificarIntegridad: function() {
        console.log("Verificando integridad de datos...");
        try {
            var reparaciones = 0;
            
            // Verificar órdenes pendientes
            if (Avika.data.pendingOrders && Array.isArray(Avika.data.pendingOrders)) {
                var indicesInvalidos = [];
                
                // Detectar entradas inválidas
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var orden = Avika.data.pendingOrders[i];
                    
                    // Verificar campos obligatorios
                    if (!orden || !orden.id || !orden.dish || !orden.startTime) {
                        indicesInvalidos.push(i);
                        continue;
                    }
                    
                    // Reparar timestamps si son inválidos
                    if (orden.startTime && isNaN(new Date(orden.startTime).getTime())) {
                        orden.startTime = new Date().toISOString();
                        orden.startTimeFormatted = this.formatTime(new Date());
                        reparaciones++;
                    }
                    
                    // Verificar campos específicos para combos especiales
                    if (orden.isSpecialCombo === true) {
                        if (orden.hotKitchenFinished === undefined) {
                            orden.hotKitchenFinished = false;
                            reparaciones++;
                        }
                        if (orden.coldKitchenFinished === undefined) {
                            orden.coldKitchenFinished = false;
                            reparaciones++;
                        }
                    }
                    
                    // Verificar campos de servicio
                    if (!orden.serviceType) {
                        orden.serviceType = 'comedor'; // Valor predeterminado
                        reparaciones++;
                    }
                }
                
                // Eliminar entradas inválidas (de atrás hacia adelante)
                for (var j = indicesInvalidos.length - 1; j >= 0; j--) {
                    Avika.data.pendingOrders.splice(indicesInvalidos[j], 1);
                    reparaciones++;
                }
            } else {
                // Si no existe o no es un array, inicializarlo
                Avika.data.pendingOrders = [];
                reparaciones++;
            }
            
            // Verificar órdenes completadas (similar a pendientes)
            if (Avika.data.completedOrders && Array.isArray(Avika.data.completedOrders)) {
                var indicesInvalidos = [];
                
                for (var i = 0; i < Avika.data.completedOrders.length; i++) {
                    var orden = Avika.data.completedOrders[i];
                    
                    if (!orden || !orden.id || !orden.dish || !orden.startTime || !orden.finishTime) {
                        indicesInvalidos.push(i);
                        continue;
                    }
                    
                    // Reparar campos específicos
                    if (!orden.prepTime) {
                        var tiempoMillis = new Date(orden.finishTime) - new Date(orden.startTime);
                        var tiempoSecs = Math.floor(tiempoMillis / 1000);
                        var mins = Math.floor(tiempoSecs / 60);
                        var secs = tiempoSecs % 60;
                        
                        orden.prepTime = this.padZero(mins) + ':' + this.padZero(secs) + ' minutos';
                        reparaciones++;
                    }
                }
                
                // Eliminar entradas inválidas
                for (var j = indicesInvalidos.length - 1; j >= 0; j--) {
                    Avika.data.completedOrders.splice(indicesInvalidos[j], 1);
                    reparaciones++;
                }
            } else {
                Avika.data.completedOrders = [];
                reparaciones++;
            }
            
            // Guardar datos reparados
            if (reparaciones > 0) {
                this.guardarDatosLocales();
                console.log("Se realizaron " + reparaciones + " reparaciones en los datos.");
                return true;
            }
            
            console.log("Verificación completada. No se encontraron inconsistencias.");
            return false;
            
        } catch (e) {
            console.error("Error al verificar integridad:", e);
            // En caso de error grave, reiniciar datos
            Avika.data.pendingOrders = [];
            Avika.data.completedOrders = [];
            this.guardarDatosLocales();
            return true;
        }
    },

    // Función auxiliar para formatear tiempo
    formatTime: function(date) {
        if (!date) return '--:--:--';
        
        var hours = this.padZero(date.getHours());
        var minutes = this.padZero(date.getMinutes());
        var seconds = this.padZero(date.getSeconds());
        return hours + ':' + minutes + ':' + seconds;
    },

    // Función auxiliar para añadir ceros a números
    padZero: function(num) {
        return (num < 10 ? '0' : '') + num;
    },

    // Función para limpiar historial
    limpiarHistorial: function() {
        if (confirm('¿Estás seguro de que deseas borrar todo el historial completado?')) {
            Avika.data.completedOrders = [];
            Avika.ui.updateCompletedTable();
            Avika.storage.guardarDatosLocales();
            Avika.ui.showNotification('Historial limpiado');
        }
    },
    
    // Inicializar el autoguardado
    iniciarAutoguardado: function() {
        // Limpiar cualquier temporizador existente
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        // Configurar nuevo temporizador
        var intervalo = Avika.config && Avika.config.autoSaveInterval ? Avika.config.autoSaveInterval : 30000;
        this.autoSaveTimer = setInterval(function() {
            Avika.storage.guardarDatosLocales();
        }, intervalo);
        
        console.log('Autoguardado iniciado con intervalo de ' + intervalo + 'ms');
    }
};