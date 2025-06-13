// storage.js - Funciones de guardado/carga de datos
window.Avika = window.Avika || {};
Avika.storage = {
    lastSavedState: '',
    autoSaveTimer: null,
    
    // Función para guardar datos automáticamente en el almacenamiento local
// Función para guardar datos automáticamente en el almacenamiento local con verificación
guardarDatosLocales: function() {
    try {
        // Solo guardar si hay cambios - Crear "huellas digitales" de los datos actuales
        var currentPendingHash = JSON.stringify(Avika.data.pendingOrders).length;
        var currentBarHash = JSON.stringify(Avika.data.barOrders).length;
        var currentDeliveryHash = JSON.stringify(Avika.data.deliveryOrders).length;
        var currentCompletedHash = JSON.stringify(Avika.data.completedOrders).length;
        
        var currentState = `p${currentPendingHash}.b${currentBarHash}.d${currentDeliveryHash}.c${currentCompletedHash}`;
        
        // Verificar si ha cambiado algo desde la última vez
        if (currentState !== this.lastSavedState) {
            console.log("Guardando cambios detectados en datos...");
            
            // Verificar integridad de datos antes de guardar
            var hasInvalidData = false;
            
            // Verificar órdenes pendientes
            if (Array.isArray(Avika.data.pendingOrders)) {
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var order = Avika.data.pendingOrders[i];
                    if (!order || !order.id || !order.dish) {
                        console.warn("Detectada orden inválida en pendingOrders:", order);
                        hasInvalidData = true;
                        // Reparar datos inválidos
                        Avika.data.pendingOrders = Avika.data.pendingOrders.filter(function(o) {
                            return o && o.id && o.dish;
                        });
                        break;
                    }
                }
            } else {
                Avika.data.pendingOrders = [];
                hasInvalidData = true;
            }
            
            // Verificar órdenes en reparto - similar a pendientes
            if (Array.isArray(Avika.data.deliveryOrders)) {
                for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                    var order = Avika.data.deliveryOrders[i];
                    if (!order || !order.id || !order.dish) {
                        console.warn("Detectada orden inválida en deliveryOrders:", order);
                        hasInvalidData = true;
                        // Reparar datos inválidos
                        Avika.data.deliveryOrders = Avika.data.deliveryOrders.filter(function(o) {
                            return o && o.id && o.dish;
                        });
                        break;
                    }
                }
            } else {
                Avika.data.deliveryOrders = [];
                hasInvalidData = true;
            }
            
            // Verificar órdenes en barra
            if (Array.isArray(Avika.data.barOrders)) {
                for (var i = 0; i < Avika.data.barOrders.length; i++) {
                    var order = Avika.data.barOrders[i];
                    if (!order || !order.id || !order.dish || !order.exitTime) {
                        console.warn("Detectada orden inválida en barOrders:", order);
                        hasInvalidData = true;
                        // Reparar datos inválidos
                        Avika.data.barOrders = Avika.data.barOrders.filter(function(o) {
                            return o && o.id && o.dish && o.exitTime;
                        });
                        break;
                    }
                }
            } else {
                Avika.data.barOrders = [];
                hasInvalidData = true;
            }

            // Verificar órdenes completadas - similar a pendientes
            if (Array.isArray(Avika.data.completedOrders)) {
                for (var i = 0; i < Avika.data.completedOrders.length; i++) {
                    var order = Avika.data.completedOrders[i];
                    if (!order || !order.id || !order.dish) {
                        console.warn("Detectada orden inválida en completedOrders:", order);
                        hasInvalidData = true;
                        // Reparar datos inválidos
                        Avika.data.completedOrders = Avika.data.completedOrders.filter(function(o) {
                            return o && o.id && o.dish;
                        });
                        break;
                    }
                }
            } else {
                Avika.data.completedOrders = [];
                hasInvalidData = true;
            }
            
            // Si hubo problemas de integridad, volver a calcular el estado actual
            if (hasInvalidData) {
                currentPendingHash = JSON.stringify(Avika.data.pendingOrders).length;
                currentDeliveryHash = JSON.stringify(Avika.data.deliveryOrders).length;
                currentCompletedHash = JSON.stringify(Avika.data.completedOrders).length;
                currentState = `p${currentPendingHash}.d${currentDeliveryHash}.c${currentCompletedHash}`;
            }
            
            // Guardar con metadatos adicionales
            var metadata = {
                version: Avika.VERSION || '1.0.0',
                timestamp: new Date().toISOString(),
                counts: {
                    pending: Avika.data.pendingOrders.length,
                    delivery: Avika.data.deliveryOrders.length,
                    completed: Avika.data.completedOrders.length
                }
            };
            
            // Guardar todo
            localStorage.setItem('avika_metadata', JSON.stringify(metadata));
            localStorage.setItem('avika_pendingOrders', JSON.stringify(Avika.data.pendingOrders));
            localStorage.setItem('avika_deliveryOrders', JSON.stringify(Avika.data.deliveryOrders));
            localStorage.setItem('avika_completedOrders', JSON.stringify(Avika.data.completedOrders));
            localStorage.setItem('avika_lastSaved', new Date().toString());
            
            // Actualizar estado guardado
            this.lastSavedState = currentState;
            console.log('Datos guardados correctamente');
        }
    } catch (e) {
        console.error('Error al guardar datos localmente:', e);
    }
},

// Función para cargar datos guardados
cargarDatosGuardados: function() {
    try {
        // Verificar que window.Avika existe
        if (!window.Avika) {
            window.Avika = {};
            console.warn('window.Avika no existe, inicializando objeto global');
        }
        
        // Asegurar que Avika.data existe
        if (!Avika.data) {
            Avika.data = {};
            console.warn('Avika.data no existe, inicializando objeto vacío');
        }
        
        var savedPending = localStorage.getItem('avika_pendingOrders');
        var savedDelivery = localStorage.getItem('avika_deliveryOrders');
        var savedCompleted = localStorage.getItem('avika_completedOrders');
        
        // Inicializar arrays si no existen
        if (!Avika.data.pendingOrders) {
            Avika.data.pendingOrders = [];
        }
        
        if (!Avika.data.deliveryOrders) {
            Avika.data.deliveryOrders = [];
        }
        
        if (!Avika.data.completedOrders) {
            Avika.data.completedOrders = [];
        }
        
        // Cargar datos guardados si existen
        if (savedPending) {
            try {
                Avika.data.pendingOrders = JSON.parse(savedPending);
                // Reparar fechas para compatibilidad con Android 10
                this._repararFechasEnOrdenes(Avika.data.pendingOrders);
            } catch (parseError) {
                console.error('Error al parsear pendingOrders:', parseError);
                Avika.data.pendingOrders = [];
            }
        }
        
        if (savedDelivery) {
            try {
                Avika.data.deliveryOrders = JSON.parse(savedDelivery);
                // Reparar fechas para compatibilidad con Android 10
                this._repararFechasEnOrdenes(Avika.data.deliveryOrders);
            } catch (parseError) {
                console.error('Error al parsear deliveryOrders:', parseError);
                Avika.data.deliveryOrders = [];
            }
        }
        
        if (savedCompleted) {
            try {
                Avika.data.completedOrders = JSON.parse(savedCompleted);
                // Reparar fechas para compatibilidad con Android 10
                this._repararFechasEnOrdenes(Avika.data.completedOrders);
            } catch (parseError) {
                console.error('Error al parsear completedOrders:', parseError);
                Avika.data.completedOrders = [];
            }
        }
        
        // Verificar integridad de datos
        this.verificarIntegridad();
        
        // Verificar que la UI esté inicializada antes de actualizar tablas
        if (Avika.ui) {
            // Actualizar las interfaces
            if (typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
            
            if (typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable();
            }
        } else {
            console.warn('Avika.ui no está disponible, no se actualizaron las tablas');
        }
        
        console.log('Datos cargados correctamente');
        return true;
    } catch (e) {
        console.error('Error al cargar datos guardados:', e);
        
        // Inicializar con datos vacíos en caso de error
        Avika.data.pendingOrders = [];
        Avika.data.deliveryOrders = [];
        Avika.data.completedOrders = [];
        
        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('Error al cargar datos: ' + e.message, 'error');
        }
        
        return false;
    }
},

    // Verificar y reparar integridad de datos
    verificarIntegridad: function() {
        console.log("Verificando integridad de datos...");
        try {
            // Asegurar que Avika.data existe
            if (!Avika.data) {
                Avika.data = {};
                console.warn('Avika.data no existe, inicializando objeto vacío');
            }
            
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
                        
                        // Usar la implementación centralizada de padZero
                        var padZero = Avika.utils && typeof Avika.utils.padZero === 'function' ? 
                                  Avika.utils.padZero : 
                                  function(num) { return (num < 10 ? '0' : '') + num; };
                        
                        orden.prepTime = padZero(mins) + ':' + padZero(secs) + ' minutos';
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

    // Función auxiliar que utiliza la implementación centralizada de formatTime
    formatTime: function(date) {
        return Avika.utils.formatTime(date);
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
    },
    
    // Función auxiliar para reparar fechas en órdenes
    // Corrige problemas de compatibilidad con Android 10 en tablets Lenovo
    _repararFechasEnOrdenes: function(ordenes) {
        if (!Array.isArray(ordenes)) return;
        
        for (var i = 0; i < ordenes.length; i++) {
            var orden = ordenes[i];
            if (!orden) continue;
            
            // Reparar startTime
            if (orden.startTime && typeof orden.startTime === 'string') {
                try {
                    // Asegurar formato ISO para máxima compatibilidad
                    var fechaTemp = new Date(orden.startTime);
                    if (isNaN(fechaTemp.getTime())) {
                        console.warn('Fecha startTime inválida en orden ' + orden.id + ', regenerando');
                        orden.startTime = new Date();
                    } else {
                        orden.startTime = fechaTemp;
                    }
                } catch (e) {
                    console.error('Error al reparar startTime:', e);
                    orden.startTime = new Date();
                }
            }
            
            // Reparar finishTime si existe
            if (orden.finishTime && typeof orden.finishTime === 'string') {
                try {
                    var fechaTemp = new Date(orden.finishTime);
                    if (isNaN(fechaTemp.getTime())) {
                        console.warn('Fecha finishTime inválida en orden ' + orden.id + ', regenerando');
                        orden.finishTime = new Date();
                    } else {
                        orden.finishTime = fechaTemp;
                    }
                } catch (e) {
                    console.error('Error al reparar finishTime:', e);
                    orden.finishTime = new Date();
                }
            }
            
            // Reparar deliveryDepartureTime si existe
            if (orden.deliveryDepartureTime && typeof orden.deliveryDepartureTime === 'string') {
                try {
                    var fechaTemp = new Date(orden.deliveryDepartureTime);
                    if (isNaN(fechaTemp.getTime())) {
                        console.warn('Fecha deliveryDepartureTime inválida en orden ' + orden.id + ', regenerando');
                        orden.deliveryDepartureTime = new Date();
                    } else {
                        orden.deliveryDepartureTime = fechaTemp;
                    }
                } catch (e) {
                    console.error('Error al reparar deliveryDepartureTime:', e);
                    orden.deliveryDepartureTime = new Date();
                }
            }
            
            // Reparar deliveryArrivalTime si existe
            if (orden.deliveryArrivalTime && typeof orden.deliveryArrivalTime === 'string') {
                try {
                    var fechaTemp = new Date(orden.deliveryArrivalTime);
                    if (isNaN(fechaTemp.getTime())) {
                        console.warn('Fecha deliveryArrivalTime inválida en orden ' + orden.id + ', regenerando');
                        orden.deliveryArrivalTime = new Date();
                    } else {
                        orden.deliveryArrivalTime = fechaTemp;
                    }
                } catch (e) {
                    console.error('Error al reparar deliveryArrivalTime:', e);
                    orden.deliveryArrivalTime = new Date();
                }
            }
            
            // Actualizar el formato de tiempo mostrado
            if (orden.startTime instanceof Date) {
                orden.startTimeFormatted = this.formatTime(orden.startTime);
            }
        }
    }
};