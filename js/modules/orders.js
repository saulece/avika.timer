// orders.js - Implementación de funciones para manejo de órdenes
window.Avika = window.Avika || {};

// NOTA: La función getFormatElapsedTimeFunction ha sido eliminada
// Ahora usamos directamente Avika.utils.formatElapsedTime que está centralizada en avika-core.js
// NOTA: La función formatTime local ha sido eliminada. Usar Avika.utils.formatTime

Avika.orders = {
    // Estado interno para tracking de tickets
    _ticketStatus: {},

    // Función para iniciar la preparación de un platillo
    startPreparation: function() {
        console.log("Iniciando preparación de platillo");

        try {
            // Obtener datos del formulario
            // Usar Avika.utils.getElement para obtener elementos de forma segura
            var titleElement = Avika.utils.getElement('selected-dish-title');
            var quantityElement = Avika.utils.getElement('quantity-display');
            var serviceElement = document.querySelector('#preparation-section .option-btn.selected'); // QuerySelector es más flexible aquí
            var notesElement = Avika.utils.getElement('notes-input');

            var selectedDish = titleElement ? titleElement.textContent : '';
            var quantity = quantityElement ? parseInt(quantityElement.textContent, 10) : NaN;
            var serviceType = serviceElement ? serviceElement.getAttribute('id').replace('btn-', '') : null;
            var notes = notesElement ? notesElement.value : '';

            var isSpecialCombo = Avika.data.isSpecialCombo;
            var category = Avika.data.currentCategory;
            var customizations = Avika.data.currentCustomizations || [];

            // Validar datos
            if (!selectedDish) {
                 // Llamada UI - Idealmente, esto se haría en el código que llama a startPreparation
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: No se ha seleccionado un platillo', 'error');
                } else { console.error('Error: No se ha seleccionado un platillo'); }
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                // Llamada UI
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: La cantidad debe ser mayor a 0', 'error');
                } else { console.error('Error: La cantidad debe ser mayor a 0'); }
                return;
            }

            if (!serviceType) {
                 // Llamada UI
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: No se ha seleccionado un tipo de servicio', 'error');
                } else { console.error('Error: No se ha seleccionado un tipo de servicio'); }
                return;
            }

            // Usar el orderService para crear la orden
            if (Avika.orderService && typeof Avika.orderService.createOrder === 'function') {
                var order = Avika.orderService.createOrder(
                    selectedDish,
                    category,
                    serviceType,
                    notes,
                    quantity,
                    isSpecialCombo
                );

                // Si es un combo especial, inicializar estados de cocinas
                if (isSpecialCombo) {
                    order.hotKitchenFinished = false;
                    order.coldKitchenFinished = false;
                }

                // Agregar personalizaciones
                order.customizations = customizations;

                // Actualizar la interfaz - Llamada UI
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }

                // Guardar cambios
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }

                // Mostrar notificación - Llamada UI
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('¡' + selectedDish + ' en preparación!', 'success');
                } else { console.log('¡' + selectedDish + ' en preparación!'); }

                // Volver a la sección de categorías - Llamada UI
                if (Avika.ui && typeof Avika.ui.showSection === 'function') {
                    Avika.ui.showSection('categories-section');
                }
            } else {
                console.error("Error: orderService no está disponible o no tiene la función createOrder");
                 // Llamada UI
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error al crear la orden. Consulta la consola para más detalles.', 'error');
                }
            }
        } catch (e) {
            console.error("Error al iniciar preparación:", e);
            // Llamada UI
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error al crear la orden: ' + e.message, 'error');
            }
        }
    },

    // Función para marcar un platillo individual como terminado (para tickets)
    // Refactorizada para devolver un objeto de resultado en lugar de llamar a la UI directamente
    finishIndividualItem: function(orderId) {
        console.log("Finalizando item individual:", orderId);

        var result = {
            success: false,
            message: "Orden no encontrada",
            messageType: 'error',
            order: null,
            updatedTables: [],
            ticketCompleted: false
        };

        var orderIndex = Avika.data.pendingOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            return result; // Devuelve error
        }

        var order = Avika.data.pendingOrders[orderIndex];
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);

        result.success = true;
        result.order = order;
        result.updatedTables.push('pendingTable');
        result.message = "Platillo marcado como listo";
        result.messageType = 'success';

        // Manejar el platillo según su tipo de servicio
        if (order.serviceType === 'comedor' || order.serviceType === 'para-llevar') {
            if (order.ticketId) {
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
                if (ticketStatus.isComplete) {
                    console.log("Ticket de comedor/llevar", order.ticketId, "completado");
                    result.ticketCompleted = true;
                    var itemsToMove = [];
                    for (let i = Avika.data.pendingOrders.length - 1; i >= 0; i--) {
                        if (Avika.data.pendingOrders[i].ticketId === order.ticketId) {
                            itemsToMove.push(Avika.data.pendingOrders.splice(i, 1)[0]);
                        }
                    }
                    if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
                    itemsToMove.forEach(item => Avika.data.completedOrders.unshift(item));
                    result.updatedTables.push('completedTable');
                    result.message = "Ticket completado y movido a historial";
                }
            } else {
                if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
                Avika.data.completedOrders.unshift(Avika.data.pendingOrders.splice(orderIndex, 1)[0]);
                result.updatedTables.push('completedTable');
            }
        } else if (order.serviceType === 'domicilio') {
            if (order.ticketId) {
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);
                if (ticketStatus.isComplete) {
                    console.log("Ticket a domicilio", order.ticketId, "listo para reparto");
                    result.ticketCompleted = true;
                    var itemsToMove = [];
                    for (let i = Avika.data.pendingOrders.length - 1; i >= 0; i--) {
                         if (Avika.data.pendingOrders[i].ticketId === order.ticketId) {
                            itemsToMove.push(Avika.data.pendingOrders.splice(i, 1)[0]);
                        }
                    }
                    if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                    itemsToMove.forEach(item => {
                        item.readyForDelivery = true;
                        item.kitchenFinished = true;
                        item.finishTime = item.finishTime || new Date(); // Asegurar que tenga finishTime
                        item.finishTimeFormatted = item.finishTimeFormatted || Avika.utils.formatTime(item.finishTime);
                        Avika.data.deliveryOrders.unshift(item);
                    });
                    result.updatedTables.push('deliveryTable');
                    result.message = "Ticket listo para reparto";
                }
            } else {
                order.readyForDelivery = true;
                order.kitchenFinished = true;
                order.finishTime = new Date();
                order.finishTimeFormatted = Avika.utils.formatTime(order.finishTime);
                if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                Avika.data.deliveryOrders.unshift(Avika.data.pendingOrders.splice(orderIndex, 1)[0]);
                result.updatedTables.push('deliveryTable');
                result.message = "Platillo listo para reparto";
            }
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        return result; // Devuelve el objeto resultado
    },

    // Función para verificar si todos los platillos de un ticket están terminados
    checkTicketCompletionStatus: function(ticketId) {
        if (!ticketId) return { isComplete: false, totalItems: 0, finishedItems: 0, itemsList: [] }; // Asegurar retorno consistente

        var allItems = [];
        var finishedItems = 0;

        // Usar filter y forEach para claridad
        var pendingTicketItems = Avika.data.pendingOrders.filter(item => item.ticketId === ticketId);
        var deliveryTicketItems = (Avika.data.deliveryOrders || []).filter(item => item.ticketId === ticketId);

        allItems = [...pendingTicketItems, ...deliveryTicketItems];

        allItems.forEach(item => {
             // Si está en delivery, ya terminó cocina. Si está en pending, verificar estado.
            const isFinishedInPending = item.finished || (item.isSpecialCombo && item.hotKitchenFinished && item.coldKitchenFinished);
            const isInDelivery = Avika.data.deliveryOrders.some(d => d.id === item.id); // Verificar si está en delivery

            if (isInDelivery || isFinishedInPending) {
                 finishedItems++;
            }
        });


        return {
            ticketId: ticketId,
            totalItems: allItems.length,
            finishedItems: finishedItems,
            isComplete: allItems.length > 0 && finishedItems >= allItems.length,
            itemsList: allItems
        };
    },

    // Función para finalizar una orden normal (no parte de un ticket)
    // Refactorizada para devolver un objeto de resultado
    finishPreparation: function(orderId) {
        console.log("Finalizando preparación:", orderId);

        var result = {
            success: false,
            message: "Orden no encontrada",
            messageType: 'error',
            order: null,
            updatedTables: []
        };

        var orderIndex = Avika.data.pendingOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            return result;
        }

        var order = Avika.data.pendingOrders[orderIndex];

        var endTime = new Date();
        order.endTime = endTime;
        order.preparationTime = Math.floor((endTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);

        result.success = true;
        result.order = order;

        if (order.serviceType === 'domicilio' || order.serviceType === 'para-llevar') {
            order.finishTime = endTime;
            order.finishTimeFormatted = Avika.utils.formatTime(endTime);
            order.kitchenFinished = true;
            if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
            Avika.data.deliveryOrders.unshift(Avika.data.pendingOrders.splice(orderIndex, 1)[0]);
            result.updatedTables = ['pendingTable', 'deliveryTable'];
            result.message = `¡${order.dish} listo para reparto! Tiempo: ${order.preparationTimeFormatted}`;
            result.messageType = 'success';
        } else {
            if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
            Avika.data.completedOrders.unshift(Avika.data.pendingOrders.splice(orderIndex, 1)[0]);
            result.updatedTables = ['pendingTable', 'completedTable'];
            result.message = `¡${order.dish} terminado! Tiempo: ${order.preparationTimeFormatted}`;
            result.messageType = 'success';
        }

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        return result;
    },

    // Función para finalizar una cocina caliente (para combos especiales)
    // Refactorizada para devolver resultado
    finishHotKitchen: function(orderId) {
        console.log("Finalizando cocina caliente para:", orderId);

        var result = {
            success: false,
            message: "Orden no encontrada",
            messageType: 'error',
            order: null,
            updatedTables: ['pendingTable'], // Siempre actualizar tabla pendiente
            comboCompleted: false
        };

        var orderIndex = Avika.data.pendingOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            return result;
        }

        var order = Avika.data.pendingOrders[orderIndex];

        if (order.hotKitchenFinished) {
            result.message = "Cocina caliente ya estaba terminada";
            result.messageType = 'info';
            result.success = true; // No es un error, pero no hubo cambio
            return result;
        }

        order.hotKitchenFinished = true;
        order.hotKitchenEndTime = new Date();
        order.hotKitchenEndTimeFormatted = Avika.utils.formatTime(order.hotKitchenEndTime);

        result.success = true;
        result.order = order;
        result.message = `¡Cocina Caliente de ${order.dish} terminada!`;
        result.messageType = 'success';

        if (order.coldKitchenFinished) {
             // Llama a checkComboCompletion para manejar la lógica de completitud
             // checkComboCompletion ahora debe devolver qué tablas actualizar
             var completionResult = this.checkComboCompletion(order);
             if (completionResult && completionResult.updatedTables) {
                 result.updatedTables = [...new Set([...result.updatedTables, ...completionResult.updatedTables])]; // Fusionar arrays sin duplicados
             }
             result.comboCompleted = true;
        }

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        return result;
    },

    // Función para finalizar una cocina fría (para combos especiales)
    // Refactorizada para devolver resultado
    finishColdKitchen: function(orderId) {
        console.log("Finalizando cocina fría para:", orderId);

         var result = {
            success: false,
            message: "Orden no encontrada",
            messageType: 'error',
            order: null,
            updatedTables: ['pendingTable'], // Siempre actualizar tabla pendiente
            comboCompleted: false
        };

        var orderIndex = Avika.data.pendingOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            return result;
        }

        var order = Avika.data.pendingOrders[orderIndex];

         if (order.coldKitchenFinished) {
            result.message = "Cocina fría ya estaba terminada";
            result.messageType = 'info';
            result.success = true;
            return result;
        }

        order.coldKitchenFinished = true;
        order.coldKitchenEndTime = new Date();
        order.coldKitchenEndTimeFormatted = Avika.utils.formatTime(order.coldKitchenEndTime);

        result.success = true;
        result.order = order;
        result.message = `¡Cocina Fría de ${order.dish} terminada!`;
        result.messageType = 'success';

        if (order.hotKitchenFinished) {
             var completionResult = this.checkComboCompletion(order);
             if (completionResult && completionResult.updatedTables) {
                 result.updatedTables = [...new Set([...result.updatedTables, ...completionResult.updatedTables])];
             }
             result.comboCompleted = true;
        }

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        return result;
    },

    // Función para verificar si un combo especial está completado y procesarlo adecuadamente
    // Refactorizada para devolver qué tablas necesitan actualización
    checkComboCompletion: function(order) {
        if (!order || !order.isSpecialCombo || !order.hotKitchenFinished || !order.coldKitchenFinished) {
            return null; // No aplica o no está completo
        }

        console.log("Verificando completitud de combo especial:", order.id);

        var updatedTables = ['pendingTable']; // Por defecto, la tabla pendiente se actualiza

        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);

        if (order.ticketId) {
            var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);

            if (ticketStatus.isComplete) {
                console.log("Ticket", order.ticketId, "completo (incluyendo combo)");
                var itemsToMove = [];
                var serviceType = null;

                for (let i = Avika.data.pendingOrders.length - 1; i >= 0; i--) {
                    if (Avika.data.pendingOrders[i].ticketId === order.ticketId) {
                        itemsToMove.push(Avika.data.pendingOrders.splice(i, 1)[0]);
                        if (!serviceType) serviceType = itemsToMove[itemsToMove.length-1].serviceType;
                    }
                }

                if (serviceType === 'comedor' || serviceType === 'para-llevar') {
                    if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
                    itemsToMove.forEach(item => Avika.data.completedOrders.unshift(item));
                    updatedTables.push('completedTable');
                } else if (serviceType === 'domicilio') {
                    if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                    itemsToMove.forEach(item => {
                        item.readyForDelivery = true;
                        item.kitchenFinished = true;
                        item.finishTime = item.finishTime || new Date();
                        item.finishTimeFormatted = item.finishTimeFormatted || Avika.utils.formatTime(item.finishTime);
                        Avika.data.deliveryOrders.unshift(item);
                    });
                    updatedTables.push('deliveryTable');
                }
            } else {
                console.log("Combo especial terminado, pero esperando otros platillos del ticket", order.ticketId);
                // No se mueven órdenes, solo se actualiza la tabla pendiente
            }
        } else {
            console.log("Combo especial individual", order.id, "terminado");
            var orderIndex = Avika.data.pendingOrders.findIndex(p => p.id === order.id);
            if (orderIndex !== -1) {
                var itemToMove = Avika.data.pendingOrders.splice(orderIndex, 1)[0];
                 if (order.serviceType === 'comedor' || order.serviceType === 'para-llevar') {
                    if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
                    Avika.data.completedOrders.unshift(itemToMove);
                    updatedTables.push('completedTable');
                 } else if (order.serviceType === 'domicilio') {
                    if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                    itemToMove.readyForDelivery = true;
                    itemToMove.kitchenFinished = true;
                    itemToMove.finishTime = itemToMove.finishTime || new Date();
                    itemToMove.finishTimeFormatted = itemToMove.finishTimeFormatted || Avika.utils.formatTime(itemToMove.finishTime);
                    Avika.data.deliveryOrders.unshift(itemToMove);
                    updatedTables.push('deliveryTable');
                 }
            }
        }
        return { updatedTables: [...new Set(updatedTables)] }; // Devolver tablas únicas a actualizar
    },

    // Función para finalizar la cocina para pedidos a domicilio (no ticket)
    // Refactorizada para devolver resultado
    finishKitchenForDelivery: function(orderId) {
        console.log("Finalizando cocina para pedido a domicilio (individual):", orderId);

        var result = {
            success: false,
            message: "Orden no encontrada",
            messageType: 'error',
            order: null,
            updatedTables: []
        };

        var orderIndex = Avika.data.pendingOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            return result;
        }

        var order = Avika.data.pendingOrders[orderIndex];

        order.kitchenFinished = true;
        order.finishTime = new Date();
        order.finishTimeFormatted = Avika.utils.formatTime(order.finishTime);
        order.preparationTime = Math.floor((order.finishTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);

        order.readyForDelivery = true;
        if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
        Avika.data.deliveryOrders.unshift(Avika.data.pendingOrders.splice(orderIndex, 1)[0]);

        result.success = true;
        result.order = order;
        result.updatedTables = ['pendingTable', 'deliveryTable'];
        result.message = `¡${order.dish} listo para entregar! Preparación: ${order.preparationTimeFormatted}`;
        result.messageType = 'success';

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        return result;
    },

    // Función para registrar la salida de una entrega a domicilio
    // Refactorizada para devolver resultado
    markDeliveryDeparture: function(orderId) {
        console.log("Registrando salida de domicilio:", orderId);

        var result = {
            success: false,
            message: "Orden no encontrada",
            messageType: 'error',
            order: null,
            updatedTables: []
        };

        var orderIndex = -1;
        var order = null;
        var targetList = null;

        if (Avika.data.deliveryOrders) {
             orderIndex = Avika.data.deliveryOrders.findIndex(o => o.id === orderId);
             if (orderIndex !== -1) {
                 order = Avika.data.deliveryOrders[orderIndex];
                 targetList = Avika.data.deliveryOrders;
                 result.updatedTables.push('deliveryTable'); // La tabla de reparto siempre se actualiza si la encontramos aquí
             }
        }

        if (!order && Avika.data.pendingOrders) {
             orderIndex = Avika.data.pendingOrders.findIndex(o => o.id === orderId);
             if (orderIndex !== -1) {
                 order = Avika.data.pendingOrders[orderIndex];
                 targetList = Avika.data.pendingOrders;
                 result.updatedTables.push('pendingTable'); // La tabla pendiente se actualiza
             }
        }

        if (!order) {
            console.error("No se encontró la orden con ID:", orderId, "en ninguna lista.");
            return result;
        }

        var departureTime = new Date();
        order.deliveryDepartureTime = departureTime;
        order.deliveryDepartureTimeFormatted = Avika.utils.formatTime(departureTime);

        result.success = true;
        result.order = order;
        result.message = `¡Salida registrada para ${order.dish}!`;
        result.messageType = 'success';

        if (order.ticketId) {
            var ticketId = order.ticketId;
            result.message = `¡Salida registrada para ticket #${ticketId.substring(ticketId.length - 5)}!`;

            // Actualizar otros items del ticket en pendingOrders y moverlos
            if (Avika.data.pendingOrders) {
                for (let i = Avika.data.pendingOrders.length - 1; i >= 0; i--) {
                    let item = Avika.data.pendingOrders[i];
                    if (item.ticketId === ticketId) {
                         item.deliveryDepartureTime = departureTime;
                         item.deliveryDepartureTimeFormatted = Avika.utils.formatTime(departureTime);
                         item.readyForDelivery = true;
                         item.kitchenFinished = true;
                         item.finishTime = item.finishTime || new Date();
                         item.finishTimeFormatted = item.finishTimeFormatted || Avika.utils.formatTime(item.finishTime);
                         if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                         Avika.data.deliveryOrders.unshift(Avika.data.pendingOrders.splice(i, 1)[0]);
                         result.updatedTables.push('deliveryTable'); // Necesita actualizar ambas
                    }
                }
            }
            // Actualizar items que ya estaban en deliveryOrders
             if (Avika.data.deliveryOrders) {
                Avika.data.deliveryOrders.forEach(item => {
                    if (item.ticketId === ticketId && item.id !== orderId && !item.deliveryDepartureTime) {
                        item.deliveryDepartureTime = departureTime;
                        item.deliveryDepartureTimeFormatted = Avika.utils.formatTime(departureTime);
                    }
                });
             }

        } else {
             // Orden individual encontrada en pendientes, moverla
             if (targetList === Avika.data.pendingOrders) {
                 if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                 Avika.data.deliveryOrders.unshift(Avika.data.pendingOrders.splice(orderIndex, 1)[0]);
                 result.updatedTables.push('deliveryTable');
             }
        }

         // Asegurar tablas únicas
        result.updatedTables = [...new Set(result.updatedTables)];

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        return result;
    },

    // Función para registrar la entrega a domicilio
    // Refactorizada para devolver resultado
    markDeliveryArrival: function(orderId) {
        console.log("Registrando entrega de domicilio:", orderId);

        var result = {
            success: false,
            message: "Orden en reparto no encontrada",
            messageType: 'error',
            order: null,
            updatedTables: []
        };

        if (!Avika.data.deliveryOrders || Avika.data.deliveryOrders.length === 0) {
            console.error("No hay órdenes en reparto.");
            result.message = "No hay órdenes en reparto";
            return result;
        }

        var orderIndex = Avika.data.deliveryOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            console.error("No se encontró la orden en reparto con ID:", orderId);
            return result;
        }

        var order = Avika.data.deliveryOrders[orderIndex];

        var arrivalTime = new Date();
        order.deliveryArrivalTime = arrivalTime;
        order.deliveryArrivalTimeFormatted = Avika.utils.formatTime(arrivalTime);

        if (!order.deliveryDepartureTime) {
            console.warn("Orden", orderId, "no tiene hora de salida. Usando fin de cocina como referencia.");
            order.deliveryDepartureTime = new Date(order.finishTime || order.startTime);
            order.deliveryDepartureTimeFormatted = Avika.utils.formatTime(order.deliveryDepartureTime);
        }

        var deliveryTimeInSeconds = Math.max(0, Math.floor((arrivalTime - new Date(order.deliveryDepartureTime)) / 1000));
        order.deliveryTime = deliveryTimeInSeconds;
        order.deliveryTimeFormatted = Avika.utils.formatElapsedTime(deliveryTimeInSeconds);

        if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
        Avika.data.completedOrders.unshift(order); // Mover la orden principal primero

        result.success = true;
        result.order = order;
        result.updatedTables = ['deliveryTable', 'completedTable'];
        result.messageType = 'success';
        result.message = `¡Entrega completada para ${order.dish}! Tiempo: ${order.deliveryTimeFormatted}`;


        if (order.ticketId) {
            var ticketId = order.ticketId;
            result.message = `¡Ticket #${ticketId.substring(ticketId.length-5)} entregado! Tiempo: ${order.deliveryTimeFormatted}`;

            var itemsToRemove = [orderIndex];
            for (let i = Avika.data.deliveryOrders.length - 1; i >= 0; i--) {
                if (i === orderIndex) continue;
                let item = Avika.data.deliveryOrders[i];
                if (item && item.ticketId === ticketId) {
                    item.deliveryArrivalTime = arrivalTime;
                    item.deliveryArrivalTimeFormatted = Avika.utils.formatTime(arrivalTime);
                    if (!item.deliveryDepartureTime) {
                        item.deliveryDepartureTime = order.deliveryDepartureTime;
                        item.deliveryDepartureTimeFormatted = order.deliveryDepartureTimeFormatted;
                    }
                    let itemDeliveryTime = Math.max(0, Math.floor((arrivalTime - new Date(item.deliveryDepartureTime)) / 1000));
                    item.deliveryTime = itemDeliveryTime;
                    item.deliveryTimeFormatted = Avika.utils.formatElapsedTime(itemDeliveryTime);
                    Avika.data.completedOrders.unshift(item); // Mover también a completados
                    itemsToRemove.push(i);
                }
            }
            itemsToRemove.sort((a, b) => b - a).forEach(idx => Avika.data.deliveryOrders.splice(idx, 1));
        } else {
            // Orden individual, solo eliminar la original
            Avika.data.deliveryOrders.splice(orderIndex, 1);
        }

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
        return result;
    },

    // Función para limpiar órdenes completadas
    // Refactorizada para devolver resultado
    clearCompletedOrders: function() {
        console.log("Limpiando historial de órdenes completadas");

         var result = {
            success: false,
            message: 'No se realizó ninguna acción',
            messageType: 'info',
            updatedTables: [],
            requiresConfirmation: true, // Indicar que requiere confirmación
            confirmationMessage: '¿Estás seguro de que deseas eliminar todo el historial de órdenes completadas? Esta acción no se puede deshacer.',
            actionToConfirm: 'applyClearCompletedOrders' // Nombre de la función a llamar si se confirma
        };

        // Esta función ahora solo devuelve la necesidad de confirmar
        return result;
    },

    // Función que se llama después de la confirmación para limpiar el historial
    applyClearCompletedOrders: function() {
        console.log("Aplicando limpieza de historial...");
        if (!Avika.data) Avika.data = {};

        try {
            var backup = JSON.stringify(Avika.data.completedOrders || []);
            localStorage.setItem('avika_completedOrders_backup', backup);
            localStorage.setItem('avika_backup_timestamp', new Date().toString());
            console.log("Copia de seguridad del historial creada.");
        } catch (e) {
            console.warn("No se pudo crear copia de seguridad del historial:", e);
        }

        Avika.data.completedOrders = [];

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        return {
            success: true,
            message: 'Historial de órdenes limpiado. Se ha creado una copia de seguridad.',
            messageType: 'info',
            updatedTables: ['completedTable']
        };
    },

    // Recuperar órdenes completadas desde la copia de seguridad
    // Refactorizada para devolver resultado y requerir confirmación
    restoreCompletedOrdersBackup: function() {
        var backup = localStorage.getItem('avika_completedOrders_backup');
        var timestamp = localStorage.getItem('avika_backup_timestamp');

        var result = {
            success: false,
            message: 'No hay copia de seguridad disponible',
            messageType: 'warning',
            requiresConfirmation: false,
            backupData: null
        };

        if (!backup) return result;

        try {
            var orders = JSON.parse(backup);
            if (!Array.isArray(orders)) throw new Error("La copia de seguridad no contiene un array válido.");

            var confirmMsg = `¿Desea restaurar ${orders.length} órdenes completadas`;
            if (timestamp) confirmMsg += ` desde la copia de seguridad creada el ${new Date(timestamp).toLocaleString()}`;
            confirmMsg += `? Esto reemplazará el historial actual.`;

            result.success = true;
            result.requiresConfirmation = true;
            result.confirmationMessage = confirmMsg;
            result.backupData = { orders: orders, timestamp: timestamp };
            result.actionToConfirm = 'applyCompletedOrdersBackup'; // Función a llamar si se confirma
            result.message = "Confirmación requerida para restaurar.";
            result.messageType = 'info';

        } catch (e) {
            console.error("Error al leer copia de seguridad:", e);
            result.message = 'Error al leer copia de seguridad: ' + e.message;
            result.messageType = 'error';
        }
        return result;
    },

    // Aplicar la restauración de la copia de seguridad después de la confirmación
    // Refactorizada para devolver resultado
    applyCompletedOrdersBackup: function(backupData) {
        var result = {
            success: false,
            message: 'Datos de copia de seguridad inválidos',
            messageType: 'error',
            updatedTables: []
        };

        if (!backupData || !Array.isArray(backupData.orders)) {
            return result;
        }

        try {
            Avika.data.completedOrders = backupData.orders;

            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }

            localStorage.removeItem('avika_completedOrders_backup');
            localStorage.removeItem('avika_backup_timestamp');
            console.log("Copia de seguridad restaurada y eliminada.");

            result.success = true;
            result.message = `Se han restaurado ${backupData.orders.length} órdenes completadas.`;
            result.messageType = 'success';
            result.updatedTables.push('completedTable');

        } catch (e) {
            console.error("Error al aplicar copia de seguridad:", e);
            result.message = 'Error al aplicar copia de seguridad: ' + e.message;
        }
        return result;
    },
    // Función de utilidad que ya NO debería estar aquí, usar Avika.utils.formatTime
    // formatTime: function(date) { ... } // ELIMINADA

    // Función para forzar la completitud de un ticket (emergencia)
    // Devuelve un objeto resultado
    forceCompleteTicket: function(ticketId) {
        console.warn("Forzando completitud del ticket (EMERGENCIA):", ticketId);
         var result = {
            success: false,
            message: "Ticket no encontrado o ya procesado.",
            messageType: 'warning',
            updatedTables: [],
            processedCount: 0
        };

        if (!ticketId || !Avika.data.pendingOrders) {
            result.message = "No hay órdenes pendientes para procesar.";
            return result;
        }

        var itemsToComplete = [];
        var now = new Date();
        var nowISO = now.toISOString();
        var nowFormatted = Avika.utils.formatTime(now);

        // Buscar items en pendientes
        for (let i = Avika.data.pendingOrders.length - 1; i >= 0; i--) {
             let item = Avika.data.pendingOrders[i];
             if (item.ticketId === ticketId) {
                 itemsToComplete.push(Avika.data.pendingOrders.splice(i, 1)[0]);
             }
        }
        // Buscar items en reparto (por si quedó atorado ahí)
        if (Avika.data.deliveryOrders) {
             for (let i = Avika.data.deliveryOrders.length - 1; i >= 0; i--) {
                 let item = Avika.data.deliveryOrders[i];
                 if (item.ticketId === ticketId) {
                      itemsToComplete.push(Avika.data.deliveryOrders.splice(i, 1)[0]);
                 }
            }
        }


        if (itemsToComplete.length === 0) {
            return result; // No se encontraron items para este ticket
        }

        if (!Avika.data.completedOrders) Avika.data.completedOrders = [];

        itemsToComplete.forEach(item => {
             item.finished = true;
             item.endTime = item.endTime || nowISO; // Establecer si no existe
             item.preparationTime = item.preparationTime || Math.floor((new Date(item.endTime) - new Date(item.startTime)) / 1000);
             item.preparationTimeFormatted = item.preparationTimeFormatted || Avika.utils.formatElapsedTime(item.preparationTime);
             item.completionTime = item.endTime; // Usar endTime como completionTime
             item.completionTimeFormatted = item.completionTimeFormatted || Avika.utils.formatTime(new Date(item.completionTime));

             // Marcar cocinas de combos si aplica
             if(item.isSpecialCombo) {
                 item.hotKitchenFinished = true;
                 item.coldKitchenFinished = true;
                 item.hotKitchenEndTime = item.hotKitchenEndTime || nowISO;
                 item.coldKitchenEndTime = item.coldKitchenEndTime || nowISO;
                 item.hotKitchenEndTimeFormatted = item.hotKitchenEndTimeFormatted || nowFormatted;
                 item.coldKitchenEndTimeFormatted = item.coldKitchenEndTimeFormatted || nowFormatted;
             }
             // Marcar como cocina terminada para domicilio
             if(item.serviceType === 'domicilio') {
                 item.kitchenFinished = true;
                 item.finishTime = item.finishTime || nowISO;
                 item.finishTimeFormatted = item.finishTimeFormatted || nowFormatted;
                 // Si salió a reparto, marcar llegada
                 if (item.deliveryDepartureTime) {
                     item.deliveryArrivalTime = item.deliveryArrivalTime || nowISO;
                     item.deliveryArrivalTimeFormatted = item.deliveryArrivalTimeFormatted || nowFormatted;
                     item.deliveryTime = item.deliveryTime || Math.max(0, Math.floor((new Date(item.deliveryArrivalTime) - new Date(item.deliveryDepartureTime))/1000));
                     item.deliveryTimeFormatted = item.deliveryTimeFormatted || Avika.utils.formatElapsedTime(item.deliveryTime);
                 }
             }
             item.allTicketItemsFinished = true; // Marcar explícitamente

             Avika.data.completedOrders.unshift(item); // Mover a completados
             result.processedCount++;
        });

        result.success = true;
        result.message = `Ticket ${ticketId.substring(ticketId.length - 5)} (${result.processedCount} items) forzado a completado.`;
        result.messageType = 'success';
        result.updatedTables = ['pendingTable', 'deliveryTable', 'completedTable'];

        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        return result;
    }

}; // --- CIERRE FINAL DEL OBJETO Avika.orders ---