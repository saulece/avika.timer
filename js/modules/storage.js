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
        var currentDeliveryHash = JSON.stringify(Avika.data.deliveryOrders).length;
        var currentCompletedHash = JSON.stringify(Avika.data.completedOrders).length;
        
        var currentState = `p${currentPendingHash}.d${currentDeliveryHash}.c${currentCompletedHash}`;
        
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
    console.log('Iniciando carga de datos guardados...');
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
        
        // Obtener datos del localStorage
        var savedMetadata = localStorage.getItem('avika_metadata');
        var savedPending = localStorage.getItem('avika_pendingOrders');
        var savedDelivery = localStorage.getItem('avika_deliveryOrders');
        var savedCompleted = localStorage.getItem('avika_completedOrders');
        var lastSaved = localStorage.getItem('avika_lastSaved');
        
        var metadata = null;
        var datosCorruptos = false;
        
        // Parsear metadata
        if (savedMetadata) {
            try {
                metadata = JSON.parse(savedMetadata);
                console.log('Metadata cargada:', metadata.version, 'Guardado:', metadata.timestamp);
            } catch (parseError) {
                console.error('Error al parsear metadata:', parseError);
                datosCorruptos = true;
            }
        }
        
        // Cargar órdenes pendientes
        if (savedPending) {
            try {
                var pendingData = JSON.parse(savedPending);
                
                // Verificar que sea un array
                if (Array.isArray(pendingData)) {
                    Avika.data.pendingOrders = pendingData;
                    console.log('Órdenes pendientes cargadas:', pendingData.length);
                } else {
                    console.error('Datos de órdenes pendientes no son un array');
                    Avika.data.pendingOrders = [];
                    datosCorruptos = true;
                }
            } catch (parseError) {
                console.error('Error al parsear pendingOrders:', parseError);
                Avika.data.pendingOrders = [];
                datosCorruptos = true;
            }
        } else {
            console.log('No se encontraron órdenes pendientes guardadas');
        }
        
        // Cargar órdenes en reparto
        if (savedDelivery) {
            try {
                var deliveryData = JSON.parse(savedDelivery);
                
                // Verificar que sea un array
                if (Array.isArray(deliveryData)) {
                    Avika.data.deliveryOrders = deliveryData;
                    console.log('Órdenes en reparto cargadas:', deliveryData.length);
                } else {
                    console.error('Datos de órdenes en reparto no son un array');
                    Avika.data.deliveryOrders = [];
                    datosCorruptos = true;
                }
            } catch (parseError) {
                console.error('Error al parsear deliveryOrders:', parseError);
                Avika.data.deliveryOrders = [];
                datosCorruptos = true;
            }
        } else {
            console.log('No se encontraron órdenes en reparto guardadas');
        }
        
        // Cargar órdenes completadas
        if (savedCompleted) {
            try {
                var completedData = JSON.parse(savedCompleted);
                
                // Verificar que sea un array
                if (Array.isArray(completedData)) {
                    Avika.data.completedOrders = completedData;
                    console.log('Órdenes completadas cargadas:', completedData.length);
                } else {
                    console.error('Datos de órdenes completadas no son un array');
                    Avika.data.completedOrders = [];
                    datosCorruptos = true;
                }
            } catch (parseError) {
                console.error('Error al parsear completedOrders:', parseError);
                Avika.data.completedOrders = [];
                datosCorruptos = true;
            }
        } else {
            console.log('No se encontraron órdenes completadas guardadas');
        }
        
        // Verificar integridad de datos
        var datosReparados = this.verificarIntegridad();
        
        // Si hubo datos corruptos o reparados, guardar los datos corregidos
        if (datosCorruptos || datosReparados) {
            console.warn('Se detectaron y repararon problemas en los datos');
            this.guardarDatosLocales();
        }
        
        // Verificar que la UI esté inicializada antes de actualizar tablas
        if (Avika.ui) {
            // Actualizar las interfaces
            if (typeof Avika.ui.updatePendingTable === 'function') {
                try {
                    Avika.ui.updatePendingTable();
                } catch (uiError) {
                    console.error('Error al actualizar tabla de pendientes:', uiError);
                }
            }
            
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                try {
                    Avika.ui.updateDeliveryTable();
                } catch (uiError) {
                    console.error('Error al actualizar tabla de reparto:', uiError);
                }
            }
            
            if (typeof Avika.ui.updateCompletedTable === 'function') {
                try {
                    Avika.ui.updateCompletedTable();
                } catch (uiError) {
                    console.error('Error al actualizar tabla de completados:', uiError);
                }
            }
            
            // Mostrar notificación de carga
            if (lastSaved && typeof Avika.ui.showNotification === 'function') {
                try {
                    var fechaGuardado = new Date(lastSaved);
                    // Verificar que la fecha es válida
                    if (!isNaN(fechaGuardado.getTime())) {
                        Avika.ui.showNotification('Datos cargados de ' + fechaGuardado.toLocaleString());
                    } else {
                        Avika.ui.showNotification('Datos cargados correctamente');
                    }
                } catch (notifError) {
                    console.error('Error al mostrar notificación:', notifError);
                }
            }
        } else {
            console.warn('Avika.ui no está disponible, no se actualizaron las tablas');
        }
        
        // Actualizar el estado guardado para el seguimiento de cambios
        try {
            var currentPendingHash = JSON.stringify(Avika.data.pendingOrders).length;
            var currentDeliveryHash = JSON.stringify(Avika.data.deliveryOrders).length;
            var currentCompletedHash = JSON.stringify(Avika.data.completedOrders).length;
            
            this.lastSavedState = `p${currentPendingHash}.d${currentDeliveryHash}.c${currentCompletedHash}`;
        } catch (hashError) {
            console.error('Error al calcular hash de estado:', hashError);
            this.lastSavedState = '';
        }
                             
        console.log('Datos cargados correctamente');
        return true;
    } catch (e) {
        console.error('Error crítico al cargar datos guardados:', e);
        
        // Reiniciar datos en caso de error grave
        Avika.data = Avika.data || {};
        Avika.data.pendingOrders = [];
        Avika.data.deliveryOrders = [];
        Avika.data.completedOrders = [];
        
        // Intentar actualizar la UI si está disponible
        if (Avika.ui) {
            if (typeof Avika.ui.showNotification === 'function') {
                try {
                    Avika.ui.showNotification('Error al cargar datos. Se han reiniciado.', 'error');
                } catch (notifError) {}
            }
            
            if (typeof Avika.ui.updatePendingTable === 'function') {
                try { Avika.ui.updatePendingTable(); } catch (uiError) {}
            }
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                try { Avika.ui.updateDeliveryTable(); } catch (uiError) {}
            }
            if (typeof Avika.ui.updateCompletedTable === 'function') {
                try { Avika.ui.updateCompletedTable(); } catch (uiError) {}
            }
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
        var ahora = new Date();
        var ahoraISO = ahora.toISOString();

        // Verificar órdenes pendientes
        if (Avika.data.pendingOrders && Array.isArray(Avika.data.pendingOrders)) {
            var indicesInvalidos = [];

            // Detectar entradas inválidas
            for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                var orden = Avika.data.pendingOrders[i];

                // Verificar campos obligatorios
                if (!orden || typeof orden !== 'object') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar ID
                if (!orden.id || typeof orden.id !== 'string') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar nombre del platillo
                if (!orden.dish || typeof orden.dish !== 'string') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar startTime
                if (!orden.startTime) {
                    orden.startTime = ahoraISO;
                    orden.startTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                } else if (typeof orden.startTime !== 'string' || isNaN(new Date(orden.startTime).getTime())) {
                    orden.startTime = ahoraISO;
                    orden.startTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                }

                // Verificar startTimeFormatted
                if (!orden.startTimeFormatted || typeof orden.startTimeFormatted !== 'string') {
                    try {
                        orden.startTimeFormatted = Avika.utils.formatTime(new Date(orden.startTime));
                        reparaciones++;
                    } catch (e) {
                        orden.startTimeFormatted = Avika.utils.formatTime(ahora);
                        reparaciones++;
                    }
                }

                // Verificar cantidad
                if (orden.quantity === undefined || orden.quantity === null || isNaN(orden.quantity)) {
                    orden.quantity = 1;
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
                if (!orden.serviceType || typeof orden.serviceType !== 'string') {
                    orden.serviceType = 'comedor'; // Valor predeterminado
                    reparaciones++;
                }

                // Verificar categoría
                if (!orden.category || typeof orden.category !== 'string') {
                    orden.category = 'Sin categoría';
                    reparaciones++;
                }

                // Verificar customizations
                if (orden.customizations && !Array.isArray(orden.customizations)) {
                    orden.customizations = [];
                    reparaciones++;
                } else if (!orden.customizations) {
                    orden.customizations = [];
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

        // Verificar órdenes en reparto
        if (Avika.data.deliveryOrders && Array.isArray(Avika.data.deliveryOrders)) {
            var indicesInvalidos = [];

            // Detectar entradas inválidas
            for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
                var orden = Avika.data.deliveryOrders[i];

                // Verificar campos obligatorios
                if (!orden || typeof orden !== 'object') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar ID
                if (!orden.id || typeof orden.id !== 'string') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar nombre del platillo
                if (!orden.dish || typeof orden.dish !== 'string') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar startTime
                if (!orden.startTime) {
                    orden.startTime = ahoraISO;
                    orden.startTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                } else if (typeof orden.startTime !== 'string' || isNaN(new Date(orden.startTime).getTime())) {
                    orden.startTime = ahoraISO;
                    orden.startTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                }

                // Verificar preparationTime
                if (!orden.preparationTime) {
                    orden.preparationTime = ahoraISO;
                    orden.preparationTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                } else if (typeof orden.preparationTime !== 'string' || isNaN(new Date(orden.preparationTime).getTime())) {
                    orden.preparationTime = ahoraISO;
                    orden.preparationTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                }

                // Verificar deliveryDepartureTime si existe
                if (orden.deliveryDepartureTime) {
                    if (typeof orden.deliveryDepartureTime !== 'string' || isNaN(new Date(orden.deliveryDepartureTime).getTime())) {
                        // Si el tiempo de salida es inválido, establecerlo a ahora
                        orden.deliveryDepartureTime = ahoraISO;
                        orden.deliveryDepartureTimeFormatted = Avika.utils.formatTime(ahora);
                        reparaciones++;
                    }

                    // Verificar que deliveryDepartureTimeFormatted exista y sea válido
                    if (!orden.deliveryDepartureTimeFormatted || typeof orden.deliveryDepartureTimeFormatted !== 'string') {
                        try {
                            orden.deliveryDepartureTimeFormatted = Avika.utils.formatTime(new Date(orden.deliveryDepartureTime));
                            reparaciones++;
                        } catch (e) {
                            orden.deliveryDepartureTimeFormatted = Avika.utils.formatTime(ahora);
                            reparaciones++;
                        }
                    }
                }

                // Verificar serviceType (debe ser 'domicilio' para órdenes en reparto)
                if (orden.serviceType !== 'domicilio') {
                    orden.serviceType = 'domicilio';
                    reparaciones++;
                }

                // Verificar cantidad
                if (orden.quantity === undefined || orden.quantity === null || isNaN(orden.quantity)) {
                    orden.quantity = 1;
                    reparaciones++;
                }

                // Verificar customizations
                if (orden.customizations && !Array.isArray(orden.customizations)) {
                    orden.customizations = [];
                    reparaciones++;
                } else if (!orden.customizations) {
                    orden.customizations = [];
                    reparaciones++;
                }
            }

            // Eliminar entradas inválidas (de atrás hacia adelante)
            for (var j = indicesInvalidos.length - 1; j >= 0; j--) {
                Avika.data.deliveryOrders.splice(indicesInvalidos[j], 1);
                reparaciones++;
            }
        } else {
            // Si no existe o no es un array, inicializarlo
            Avika.data.deliveryOrders = [];
            reparaciones++;
        }

        // Verificar órdenes completadas
        if (Avika.data.completedOrders && Array.isArray(Avika.data.completedOrders)) {
            var indicesInvalidos = [];

            for (var i = 0; i < Avika.data.completedOrders.length; i++) {
                var orden = Avika.data.completedOrders[i];

                // Verificar campos obligatorios
                if (!orden || typeof orden !== 'object') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar ID
                if (!orden.id || typeof orden.id !== 'string') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar nombre del platillo
                if (!orden.dish || typeof orden.dish !== 'string') {
                    indicesInvalidos.push(i);
                    continue;
                }

                // Verificar startTime
                if (!orden.startTime) {
                    orden.startTime = ahoraISO;
                    orden.startTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                } else if (typeof orden.startTime !== 'string' || isNaN(new Date(orden.startTime).getTime())) {
                    orden.startTime = ahoraISO;
                    orden.startTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                }

                // Verificar finishTime (obligatorio para órdenes completadas)
                if (!orden.finishTime) {
                    orden.finishTime = ahoraISO;
                    orden.finishTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                } else if (typeof orden.finishTime !== 'string' || isNaN(new Date(orden.finishTime).getTime())) {
                    orden.finishTime = ahoraISO;
                    orden.finishTimeFormatted = Avika.utils.formatTime(ahora);
                    reparaciones++;
                }

                // Verificar completionTime (alias de finishTime en algunas versiones)
                if (!orden.completionTime) {
                    orden.completionTime = orden.finishTime;
                    reparaciones++;
                } else if (typeof orden.completionTime !== 'string' || isNaN(new Date(orden.completionTime).getTime())) {
                    orden.completionTime = orden.finishTime;
                    reparaciones++;
                }

                // Verificar completionTimeFormatted
                if (!orden.completionTimeFormatted || typeof orden.completionTimeFormatted !== 'string') {
                    try {
                        orden.completionTimeFormatted = Avika.utils.formatTime(new Date(orden.completionTime));
                        reparaciones++;
                    } catch (e) {
                        orden.completionTimeFormatted = Avika.utils.formatTime(ahora);
                        reparaciones++;
                    }
                }

                // Verificar tiempo de preparación
                if (!orden.prepTime || typeof orden.prepTime !== 'string') {
                    try {
                        var tiempoMillis = new Date(orden.finishTime) - new Date(orden.startTime);
                        var tiempoSecs = Math.floor(tiempoMillis / 1000);
                        var mins = Math.floor(tiempoSecs / 60);
                        var secs = tiempoSecs % 60;

                        orden.prepTime = this.padZero(mins) + ':' + this.padZero(secs) + ' minutos';
                        reparaciones++;
                    } catch (e) {
                        orden.prepTime = '00:00 minutos';
                        reparaciones++;
                    }
                }

                // Verificar deliveryTime para órdenes a domicilio
                if (orden.serviceType === 'domicilio' && orden.deliveryTime) {
                    if (typeof orden.deliveryTime !== 'string' || isNaN(new Date(orden.deliveryTime).getTime())) {
                        orden.deliveryTime = ahoraISO;
                        orden.deliveryTimeFormatted = Avika.utils.formatTime(ahora);
                        reparaciones++;
                    }

                    // Verificar deliveryTimeFormatted
                    if (!orden.deliveryTimeFormatted || typeof orden.deliveryTimeFormatted !== 'string') {
                        try {
                            orden.deliveryTimeFormatted = Avika.utils.formatTime(new Date(orden.deliveryTime));
                            reparaciones++;
                        } catch (e) {
                            orden.deliveryTimeFormatted = Avika.utils.formatTime(ahora);
                            reparaciones++;
                        }
                    }
                }

                // Verificar cantidad
                if (orden.quantity === undefined || orden.quantity === null || isNaN(orden.quantity)) {
                    orden.quantity = 1;
                    reparaciones++;
                }

                // Verificar serviceType
                if (!orden.serviceType || typeof orden.serviceType !== 'string') {
                    orden.serviceType = 'comedor'; // Valor predeterminado
                    reparaciones++;
                }

                // Verificar customizations
                if (orden.customizations && !Array.isArray(orden.customizations)) {
                    orden.customizations = [];
                    reparaciones++;
                } else if (!orden.customizations) {
                    orden.customizations = [];
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
        Avika.data.deliveryOrders = [];
        Avika.data.completedOrders = [];
        this.guardarDatosLocales();
        return true;
    }
},

// Las funciones formatTime y padZero han sido eliminadas porque ahora utilizamos
// directamente Avika.utils.formatTime y Avika.utils.padZero

// Función para limpiar historial
limpiarHistorial: function() {
    // Confirmar con el usuario antes de limpiar
    if (confirm('¿Estás seguro de que deseas eliminar todo el historial de órdenes completadas?')) {
        // Limpiar historial
        Avika.data.completedOrders = [];
        
        // Guardar cambios
        this.guardarDatosLocales();
        
        // Actualizar tabla de completados
        if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable(false);
        }
    }
},

// Limpiar todos los datos
clearAllData: function() {
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
    this.guardarDatosLocales();
    
    // Actualizar tablas si UI está disponible
    if (Avika.ui) {
        if (typeof Avika.ui.updatePendingTable === 'function') {
            Avika.ui.updatePendingTable();
        }
        if (typeof Avika.ui.updateDeliveryTable === 'function') {
            Avika.ui.updateDeliveryTable();
        }
        if (typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable(false);
        }
        
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
                    if (Avika.ui && typeof Avika.ui.restoreDataBackup === 'function') {
                        Avika.ui.restoreDataBackup();
                    }
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
        } else if (typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('Todos los datos han sido eliminados', 'success');
        }
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

