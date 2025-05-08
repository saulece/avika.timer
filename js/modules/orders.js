// orders.js - Implementación de funciones para manejo de órdenes
window.Avika = window.Avika || {};

// NOTA: La función getFormatElapsedTimeFunction ha sido eliminada
// Ahora usamos directamente Avika.utils.formatElapsedTime que está centralizada en avika-core.js

Avika.orders = {
    // Estado interno para tracking de tickets
    _ticketStatus: {},

    // Función para iniciar la preparación de un platillo
    startPreparation: function() {
        console.log("Iniciando preparación de platillo");

        try {
            // Obtener datos del formulario
            var selectedDish = document.getElementById('selected-dish-title').textContent;
            var quantity = parseInt(document.getElementById('quantity-display').textContent, 10);
            var serviceType = document.querySelector('.option-btn.selected').getAttribute('id').replace('btn-', '');
            var notes = document.getElementById('notes-input').value;
            var isSpecialCombo = Avika.data.isSpecialCombo;
            var category = Avika.data.currentCategory;
            var customizations = Avika.data.currentCustomizations || [];

            // Validar datos
            if (!selectedDish || selectedDish === '') {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: No se ha seleccionado un platillo', 'error');
                } else {
                    console.error('Error: No se ha seleccionado un platillo');
                }
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: La cantidad debe ser mayor a 0', 'error');
                } else {
                    console.error('Error: La cantidad debe ser mayor a 0');
                }
                return;
            }

            if (!serviceType) {
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error: No se ha seleccionado un tipo de servicio', 'error');
                } else {
                    console.error('Error: No se ha seleccionado un tipo de servicio');
                }
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

                // Actualizar la interfaz
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }

                // Guardar cambios
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }

                // Mostrar notificación
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('¡' + selectedDish + ' en preparación!', 'success');
                } else {
                    console.log('¡' + selectedDish + ' en preparación!');
                }

                // Volver a la sección de categorías
                if (Avika.ui && typeof Avika.ui.showSection === 'function') {
                    Avika.ui.showSection('categories-section');
                }
            } else {
                console.error("Error: orderService no está disponible o no tiene la función createOrder");
                if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('Error al crear la orden. Consulta la consola para más detalles.', 'error');
                }
            }
        } catch (e) {
            console.error("Error al iniciar preparación:", e);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error al crear la orden: ' + e.message, 'error');
            }
        }
    },

    // Función para marcar un platillo individual como terminado (para tickets)
    finishIndividualItem: function(orderId) {
        console.log("Finalizando item individual:", orderId);

        // Buscar el índice de la orden en el array de órdenes pendientes
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                orderIndex = i;
                break;
            }
        }

        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
             if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                 Avika.ui.showNotification("Error: No se encontró la orden solicitada", 'error');
            }
            return;
        }

        var order = Avika.data.pendingOrders[orderIndex];
        order.finished = true;
        order.endTime = new Date();
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);

        // Usar la función centralizada para formatear tiempo transcurrido
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);

        // Manejar el platillo según su tipo de servicio
        // Los tickets de ordena y espera (para-llevar) ahora se comportan como comedor
        // TODOS los tickets de ordena y espera pasan directamente a platillos completados
        if (order.serviceType === 'comedor' || order.serviceType === 'para-llevar') {
            // Verificar si este platillo es parte de un ticket
            if (order.ticketId) {
                // Verificar el estado completo del ticket
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);

                // Si todos los platillos están terminados, mover todos juntos a completados
                if (ticketStatus.isComplete) {
                    console.log("Todos los platillos del ticket", order.ticketId, "están terminados");

                    // Marcar todas las órdenes con el estado completado
                    var itemsToMove = [];

                    // Recopilar todos los items del ticket
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            item.allTicketItemsFinished = true;
                            itemsToMove.push(i);
                        }
                    }

                    console.log("Ticket de comedor listo, moviendo todos los platillos a completados");

                    // Mover todos los items a la sección de completados
                    if (!Avika.data.completedOrders) {
                        Avika.data.completedOrders = [];
                    }

                    // Procesar los items en orden inverso para evitar problemas con los índices
                    for (var i = itemsToMove.length - 1; i >= 0; i--) {
                        var itemIndex = itemsToMove[i];
                        var item = Avika.data.pendingOrders[itemIndex];

                        // Mover a completados
                        Avika.data.completedOrders.unshift(item);
                        Avika.data.pendingOrders.splice(itemIndex, 1);
                    }

                    // Actualizar la tabla de completados
                    if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                        Avika.ui.updateCompletedTable();
                    }
                }
            } else {
                // Si no es parte de un ticket, mover el platillo inmediatamente a completados
                if (!Avika.data.completedOrders) {
                    Avika.data.completedOrders = [];
                }

                // Mover a completados
                Avika.data.completedOrders.unshift(order);
                Avika.data.pendingOrders.splice(orderIndex, 1);

                // Actualizar la tabla de completados
                if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable();
                }
            }
        } else if (order.serviceType === 'domicilio') {
            // Si todos los platillos del ticket están terminados, actualizar estado del ticket
            if (order.ticketId) {
                // Verificar el estado completo del ticket
                var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);

                // Si todos los platillos están terminados, actualizar el estado
                if (ticketStatus.isComplete) {
                    console.log("Todos los platillos del ticket", order.ticketId, "están terminados");

                    // Marcar todas las órdenes con el estado completado
                    var itemsToMove = [];

                    // Recopilar todos los items del ticket
                    for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                        var item = Avika.data.pendingOrders[i];
                        if (item.ticketId === order.ticketId) {
                            item.allTicketItemsFinished = true;
                            itemsToMove.push(i);
                        }
                    }

                    console.log("Ticket a domicilio listo para reparto");

                    // Mover todos los items a la sección de reparto
                    if (!Avika.data.deliveryOrders) {
                        Avika.data.deliveryOrders = [];
                    }

                    // Procesar los items en orden inverso para evitar problemas con los índices
                    for (var i = itemsToMove.length - 1; i >= 0; i--) {
                        var itemIndex = itemsToMove[i];
                        var item = Avika.data.pendingOrders[itemIndex];

                        // Marcar como listo para reparto
                        item.readyForDelivery = true;
                        item.kitchenFinished = true;
                        item.finishTime = new Date();
                        item.finishTimeFormatted = this.formatTime(item.finishTime);

                        // Mover a reparto
                        Avika.data.deliveryOrders.unshift(item);
                        Avika.data.pendingOrders.splice(itemIndex, 1);
                    }

                    // Actualizar la tabla de reparto
                    if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                        Avika.ui.updateDeliveryTable();
                    }
                }
            } else {
                // Platillo individual de domicilio
                // Marcar como listo para reparto
                order.readyForDelivery = true;
                order.kitchenFinished = true;
                order.finishTime = new Date();
                order.finishTimeFormatted = this.formatTime(order.finishTime);

                // Mover a reparto
                if (!Avika.data.deliveryOrders) {
                    Avika.data.deliveryOrders = [];
                }
                Avika.data.deliveryOrders.unshift(order);
                Avika.data.pendingOrders.splice(orderIndex, 1);

                // Actualizar la tabla de reparto
                if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') {
                    Avika.ui.updateDeliveryTable();
                }
            }
        }

        // Actualizar la interfaz
        if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
            Avika.ui.updatePendingTable();
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification("Platillo marcado como listo", 'success');
        }
    },

    // Función para verificar si todos los platillos de un ticket están terminados
    checkTicketCompletionStatus: function(ticketId) {
        if (!ticketId) return false;

        var allItems = [];
        var finishedItems = 0;

        // Recopilar todos los platillos del ticket (pendientes y en reparto)
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            var item = Avika.data.pendingOrders[i];
            if (item.ticketId === ticketId) {
                allItems.push(item);

                // Verificar si está terminado
                if (item.finished ||
                    (item.isSpecialCombo && item.hotKitchenFinished && item.coldKitchenFinished)) {
                    finishedItems++;
                }
            }
        }

        // También verificar en reparto
        for (var i = 0; i < Avika.data.deliveryOrders.length; i++) {
            var item = Avika.data.deliveryOrders[i];
            if (item.ticketId === ticketId) {
                allItems.push(item);
                finishedItems++;  // Los que están en reparto ya están terminados
            }
        }

        // Devolver estado del ticket
        return {
            ticketId: ticketId,
            totalItems: allItems.length,
            finishedItems: finishedItems,
            isComplete: allItems.length > 0 && finishedItems >= allItems.length,
            itemsList: allItems
        };
    },

    // Función para finalizar una orden normal (no parte de un ticket)
    finishPreparation: function(orderId) {
        console.log("Finalizando preparación:", orderId);

        // Buscar el índice de la orden en el array de órdenes pendientes
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                orderIndex = i;
                break;
            }
        }

        if (orderIndex === -1) {
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }

        var order = Avika.data.pendingOrders[orderIndex];

        // Calcular tiempo de preparación
        var endTime = new Date();
        order.endTime = endTime;
        order.preparationTime = Math.floor((endTime - new Date(order.startTime)) / 1000);

        // Usar la función centralizada para formatear tiempo transcurrido
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);

        // Verificar si es un pedido a domicilio o para llevar
        if (order.serviceType === 'domicilio' || order.serviceType === 'para-llevar') {
            // Marcar como listo para reparto
            order.finishTime = endTime;
            order.finishTimeFormatted = this.formatTime(endTime);
            order.kitchenFinished = true;

            // Asegurarse de que el array de órdenes en reparto existe
            if (!Avika.data.deliveryOrders) {
                Avika.data.deliveryOrders = [];
            }

            // Mover a reparto en lugar de a completadas
            Avika.data.deliveryOrders.unshift(order);
            Avika.data.pendingOrders.splice(orderIndex, 1);

            // Actualizar las tablas
            if (Avika.ui) {
                if (typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }

                if (typeof Avika.ui.updateDeliveryTable === 'function') {
                    Avika.ui.updateDeliveryTable();
                }

                // Mostrar notificación
                if (typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('¡' + order.dish + ' listo para reparto! Tiempo de preparación: ' +
                                        order.preparationTimeFormatted, 'success');
                }
            } else {
                console.log('¡' + order.dish + ' listo para reparto! Tiempo de preparación: ' +
                        order.preparationTimeFormatted);
            }
        } else {
            // Para pedidos en comedor, mover directamente a completadas
            if (!Avika.data.completedOrders) {
                 Avika.data.completedOrders = [];
            }
            Avika.data.completedOrders.unshift(order);
            Avika.data.pendingOrders.splice(orderIndex, 1);

            // Actualizar las tablas
            if (Avika.ui) {
                if (typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }

                if (typeof Avika.ui.updateCompletedTable === 'function') {
                    Avika.ui.updateCompletedTable();
                }

                // Mostrar notificación
                if (typeof Avika.ui.showNotification === 'function') {
                    Avika.ui.showNotification('¡' + order.dish + ' terminado! Tiempo: ' +
                                        order.preparationTimeFormatted, 'success');
                }
            } else {
                console.log('¡' + order.dish + ' terminado! Tiempo: ' +
                        order.preparationTimeFormatted);
            }
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }
    },

    // Función para finalizar una cocina caliente (para combos especiales)
    finishHotKitchen: function(orderId) {
        console.log("Finalizando cocina caliente para:", orderId);

        // Buscar la orden
        var order = null;
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                orderIndex = i;
                break;
            }
        }

        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }

        // Marcar cocina caliente como terminada
        order.hotKitchenFinished = true;
        // Registrar la hora de finalización de la cocina caliente
        order.hotKitchenEndTime = new Date();
        order.hotKitchenEndTimeFormatted = this.formatTime(order.hotKitchenEndTime);

        // Si ambas cocinas están terminadas, marcar como completado
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
            this.checkComboCompletion(order);
        } else {
             // Actualizar interfaz solo para reflejar el estado del botón
             if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡Cocina Caliente de ' + order.dish + ' terminada!', 'success');
        }
    },

    // Función para finalizar una cocina fría (para combos especiales)
    finishColdKitchen: function(orderId) {
        console.log("Finalizando cocina fría para:", orderId);

        // Buscar la orden
        var order = null;
        var orderIndex = -1;
        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                orderIndex = i;
                break;
            }
        }

        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }

        // Marcar cocina fría como terminada
        order.coldKitchenFinished = true;
        // Registrar la hora de finalización de la cocina fría
        order.coldKitchenEndTime = new Date();
        order.coldKitchenEndTimeFormatted = this.formatTime(order.coldKitchenEndTime);

        // Si ambas cocinas están terminadas, marcar como completado
        if (order.hotKitchenFinished && order.coldKitchenFinished) {
             this.checkComboCompletion(order);
        } else {
            // Actualizar interfaz solo para reflejar el estado del botón
            if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
        }


        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡Cocina Fría de ' + order.dish + ' terminada!', 'success');
        }
    },

    // Función para verificar si un combo especial está completado y procesarlo adecuadamente
    checkComboCompletion: function(order) {
        if (!order || !order.isSpecialCombo || !order.hotKitchenFinished || !order.coldKitchenFinished) {
            return; // Salir si no es un combo especial o no están ambas cocinas terminadas
        }

        console.log("Verificando completitud de combo especial:", order.id);

        // Marcar el combo como terminado
        order.finished = true;
        order.endTime = new Date(); // Usar el tiempo actual como fin general
        order.preparationTime = Math.floor((order.endTime - new Date(order.startTime)) / 1000);

        // Usar directamente la función centralizada de formateo de tiempo
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);

        // Verificar el estado completo del ticket AL QUE PERTENECE EL COMBO
        if (order.ticketId) {
            var ticketStatus = this.checkTicketCompletionStatus(order.ticketId);

            if (ticketStatus.isComplete) {
                // Todos los platillos del ticket están terminados, mover todo el ticket
                console.log("Todos los platillos del ticket", order.ticketId, "están terminados (incluyendo combo)");

                var itemsToMove = [];
                var serviceType = null;

                // Recopilar índices de los items del ticket en pendingOrders
                for (var i = Avika.data.pendingOrders.length - 1; i >= 0; i--) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === order.ticketId) {
                        item.allTicketItemsFinished = true; // Marcar como parte de un ticket completado
                        itemsToMove.push(i);
                        if (!serviceType) serviceType = item.serviceType;
                    }
                }

                // Mover items según el tipo de servicio
                if (serviceType === 'comedor' || serviceType === 'para-llevar') {
                    console.log("Ticket de comedor/llevar listo, moviendo a completados:", itemsToMove.length, "items");
                    if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
                    for (var k = 0; k < itemsToMove.length; k++) {
                        var idx = itemsToMove[k];
                        Avika.data.completedOrders.unshift(Avika.data.pendingOrders[idx]);
                        Avika.data.pendingOrders.splice(idx, 1);
                    }
                     if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') Avika.ui.updateCompletedTable();

                } else if (serviceType === 'domicilio') {
                    console.log("Ticket a domicilio listo, moviendo a reparto:", itemsToMove.length, "items");
                     if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                    for (var k = 0; k < itemsToMove.length; k++) {
                        var idx = itemsToMove[k];
                        var itemToMove = Avika.data.pendingOrders[idx];
                        // Asegurarse de marcarlo como listo para reparto
                        itemToMove.readyForDelivery = true;
                        itemToMove.kitchenFinished = true; // Ya está terminado si el ticket está completo
                        itemToMove.finishTime = itemToMove.finishTime || new Date(); // Hora de finalización de cocina
                        itemToMove.finishTimeFormatted = itemToMove.finishTimeFormatted || this.formatTime(itemToMove.finishTime);
                        Avika.data.deliveryOrders.unshift(itemToMove);
                         Avika.data.pendingOrders.splice(idx, 1);
                    }
                    if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') Avika.ui.updateDeliveryTable();
                }
                 // Actualizar tabla pendiente después de mover los elementos
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') Avika.ui.updatePendingTable();

            } else {
                // Este combo está terminado pero otros platillos del ticket aún no
                console.log("Combo especial terminado, pero esperando otros platillos del ticket", order.ticketId);
                // Solo actualiza la tabla pendiente para reflejar el estado del combo
                if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') {
                    Avika.ui.updatePendingTable();
                }
            }
        } else {
             // Combo especial individual (sin ticket)
             console.log("Combo especial individual", order.id, "terminado");
             var orderIndex = Avika.data.pendingOrders.findIndex(p => p.id === order.id);
             if (orderIndex !== -1) {
                 if (order.serviceType === 'comedor' || order.serviceType === 'para-llevar') {
                    if (!Avika.data.completedOrders) Avika.data.completedOrders = [];
                    Avika.data.completedOrders.unshift(Avika.data.pendingOrders[orderIndex]);
                    Avika.data.pendingOrders.splice(orderIndex, 1);
                    if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') Avika.ui.updateCompletedTable();
                 } else if (order.serviceType === 'domicilio') {
                    if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                     var itemToMove = Avika.data.pendingOrders[orderIndex];
                     itemToMove.readyForDelivery = true;
                     itemToMove.kitchenFinished = true;
                     itemToMove.finishTime = itemToMove.finishTime || new Date();
                     itemToMove.finishTimeFormatted = itemToMove.finishTimeFormatted || this.formatTime(itemToMove.finishTime);
                     Avika.data.deliveryOrders.unshift(itemToMove);
                     Avika.data.pendingOrders.splice(orderIndex, 1);
                     if (Avika.ui && typeof Avika.ui.updateDeliveryTable === 'function') Avika.ui.updateDeliveryTable();
                 }
                 // Actualizar tabla pendiente después de mover
                 if (Avika.ui && typeof Avika.ui.updatePendingTable === 'function') Avika.ui.updatePendingTable();
             }
        }
    },

    // Función para finalizar la cocina para pedidos a domicilio (no ticket)
    finishKitchenForDelivery: function(orderId) {
        console.log("Finalizando cocina para pedido a domicilio (individual):", orderId);

        // Buscar la orden
        var orderIndex = -1;
        var order = null;

        for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
            if (Avika.data.pendingOrders[i].id === orderId) {
                order = Avika.data.pendingOrders[i];
                orderIndex = i;
                break;
            }
        }

        if (!order) {
            console.error("No se encontró la orden con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden", 'error');
            }
            return;
        }

        // Marcar como terminado en cocina
        order.kitchenFinished = true;
        order.finishTime = new Date(); // Usar finishTime como el momento en que terminó cocina
        order.finishTimeFormatted = this.formatTime(order.finishTime);

        // Calcular tiempo de preparación hasta este punto
        order.preparationTime = Math.floor((order.finishTime - new Date(order.startTime)) / 1000);
        order.preparationTimeFormatted = Avika.utils.formatElapsedTime(order.preparationTime);

        // Asegurarse de que el array de órdenes en reparto existe
        if (!Avika.data.deliveryOrders) {
            Avika.data.deliveryOrders = [];
        }

        // Mover a reparto
        order.readyForDelivery = true; // Marcar como listo para salir
        Avika.data.deliveryOrders.unshift(order);
        Avika.data.pendingOrders.splice(orderIndex, 1);

        // Actualizar interfaces
        if (Avika.ui) {
            if (typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡' + order.dish + ' listo para entregar! Preparación: ' +
                                  order.preparationTimeFormatted, 'success');
        }
    },

    // Función para registrar la salida de una entrega a domicilio
    markDeliveryDeparture: function(orderId) {
        console.log("Registrando salida de domicilio:", orderId);

        var orderIndex = -1;
        var order = null;
        var targetList = null; // Para saber si viene de pending o delivery

        // Buscar primero en deliveryOrders (lo más común para este botón)
        if (Avika.data.deliveryOrders) {
             orderIndex = Avika.data.deliveryOrders.findIndex(o => o.id === orderId);
             if (orderIndex !== -1) {
                 order = Avika.data.deliveryOrders[orderIndex];
                 targetList = Avika.data.deliveryOrders;
             }
        }

        // Si no está en delivery, buscar en pending (por si el ticket se completó justo ahora)
        if (!order && Avika.data.pendingOrders) {
             orderIndex = Avika.data.pendingOrders.findIndex(o => o.id === orderId);
             if (orderIndex !== -1) {
                 order = Avika.data.pendingOrders[orderIndex];
                 targetList = Avika.data.pendingOrders;
                  // Asegurarse de que esté listo para reparto si viene de pendientes
                  if (!order.readyForDelivery) {
                     console.warn("Marcando salida para orden en pendientes que no estaba marcada como 'readyForDelivery'. Asegurando estado.");
                     order.readyForDelivery = true;
                     order.kitchenFinished = true;
                     order.finishTime = order.finishTime || new Date();
                     order.finishTimeFormatted = order.finishTimeFormatted || this.formatTime(order.finishTime);
                  }
             }
        }


        if (!order) {
            console.error("No se encontró la orden con ID:", orderId, "en ninguna lista.");
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification("Error: No se encontró la orden para marcar salida.", 'error');
            }
             // Refrescar UI por si acaso
             if (Avika.ui) {
                 if(Avika.ui.updatePendingTable) Avika.ui.updatePendingTable();
                 if(Avika.ui.updateDeliveryTable) Avika.ui.updateDeliveryTable();
             }
            return;
        }

        // Registrar fecha y hora de salida
        var departureTime = new Date();
        order.deliveryDepartureTime = departureTime;
        order.deliveryDepartureTimeFormatted = this.formatTime(departureTime);


        // Si es parte de un ticket, actualizar todos los platillos del ticket
        if (order.ticketId) {
            var ticketId = order.ticketId;
            var movedItems = []; // Track items moved from pending to delivery

            // Actualizar platillos en pendientes
            if (Avika.data.pendingOrders) {
                for (var i = Avika.data.pendingOrders.length - 1; i >= 0; i--) {
                    var item = Avika.data.pendingOrders[i];
                    if (item.ticketId === ticketId) {
                        item.deliveryDepartureTime = departureTime;
                        item.deliveryDepartureTimeFormatted = this.formatTime(departureTime);
                         // Asegurar que esté listo
                         item.readyForDelivery = true;
                         item.kitchenFinished = true;
                         item.finishTime = item.finishTime || new Date();
                         item.finishTimeFormatted = item.finishTimeFormatted || this.formatTime(item.finishTime);

                        // Mover a reparto
                        if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                        Avika.data.deliveryOrders.unshift(item);
                        movedItems.push(Avika.data.pendingOrders.splice(i, 1)[0]); // Remove and track
                    }
                }
            }

            // Actualizar platillos que ya están en reparto (o se acaban de mover)
             if (Avika.data.deliveryOrders) {
                Avika.data.deliveryOrders.forEach(item => {
                    if (item.ticketId === ticketId && !item.deliveryDepartureTime) { // Solo actualizar si no tiene ya hora de salida
                         item.deliveryDepartureTime = departureTime;
                         item.deliveryDepartureTimeFormatted = this.formatTime(departureTime);
                    }
                });
             }

        } else {
             // Si la orden encontrada estaba en pendientes (individual), moverla a reparto
             if (targetList === Avika.data.pendingOrders) {
                 if (!Avika.data.deliveryOrders) Avika.data.deliveryOrders = [];
                 Avika.data.deliveryOrders.unshift(order);
                 Avika.data.pendingOrders.splice(orderIndex, 1);
             }
        }

        // Actualizar tablas
        if (Avika.ui) {
            if (typeof Avika.ui.updatePendingTable === 'function') {
                Avika.ui.updatePendingTable();
            }
            if (typeof Avika.ui.updateDeliveryTable === 'function') {
                Avika.ui.updateDeliveryTable();
            }
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('¡Salida registrada para ' + (order.ticketId ? `ticket #${order.ticketId.substring(order.ticketId.length - 5)}` : order.dish) + '!', 'success');
        }
    },

    // Función para registrar la entrega a domicilio
    markDeliveryArrival: function(orderId) {
        console.log("Registrando entrega de domicilio:", orderId);

        // Verificar que el array de órdenes en reparto existe
        if (!Avika.data.deliveryOrders || Avika.data.deliveryOrders.length === 0) {
            console.error("No hay órdenes en reparto para marcar como entregadas.");
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error: No hay órdenes en reparto.', 'error');
            }
            return;
        }

        // Buscar la orden en reparto
        var orderIndex = Avika.data.deliveryOrders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            console.error("No se encontró la orden en reparto con ID:", orderId);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error: No se pudo encontrar la orden en reparto.', 'error');
            }
            if (Avika.ui && Avika.ui.updateDeliveryTable) Avika.ui.updateDeliveryTable(); // Refrescar tabla por si acaso
            return;
        }

        var order = Avika.data.deliveryOrders[orderIndex];

        // Registrar fecha y hora de entrega
        var arrivalTime = new Date();
        order.deliveryArrivalTime = arrivalTime;
        order.deliveryArrivalTimeFormatted = this.formatTime(arrivalTime);


        // Calcular tiempo de entrega
        if (!order.deliveryDepartureTime) {
            console.warn("La orden", orderId, "no tiene tiempo de salida registrado. Calculando entrega desde fin de cocina.");
            order.deliveryDepartureTime = new Date(order.finishTime || order.startTime); // Usar finishTime o startTime como fallback
            order.deliveryDepartureTimeFormatted = this.formatTime(order.deliveryDepartureTime);
        }

        var deliveryTimeInSeconds = Math.max(0, Math.floor((arrivalTime - new Date(order.deliveryDepartureTime)) / 1000)); // Evitar tiempos negativos
        order.deliveryTime = deliveryTimeInSeconds;
        order.deliveryTimeFormatted = Avika.utils.formatElapsedTime(deliveryTimeInSeconds);

        // Asegurarse de que el array de órdenes completadas existe
        if (!Avika.data.completedOrders) {
            Avika.data.completedOrders = [];
        }

        // Mover a órdenes completadas (solo la orden clickeada inicialmente)
        Avika.data.completedOrders.unshift(order);

        // Si es parte de un ticket, procesar todos los platillos del ticket
        if (order.ticketId) {
            console.log("Procesando llegada de ticket completo:", order.ticketId);
            var ticketId = order.ticketId;
            var itemsToRemoveFromDelivery = [orderIndex]; // Ya incluimos la orden clickeada

            // Iterar sobre el resto de deliveryOrders para encontrar otros items del mismo ticket
            for (var i = Avika.data.deliveryOrders.length - 1; i >= 0; i--) {
                 // Evitar procesar la orden original de nuevo o índices inválidos
                if (i === orderIndex) continue;

                var item = Avika.data.deliveryOrders[i];
                if (item && item.ticketId === ticketId) {
                    console.log("Procesando otro item del ticket en reparto:", item.id);

                    // Registrar entrega para este platillo
                    item.deliveryArrivalTime = arrivalTime;
                    item.deliveryArrivalTimeFormatted = this.formatTime(arrivalTime);

                    // Asegurarse de que tiene tiempo de salida, usar el de la orden principal como fallback
                    if (!item.deliveryDepartureTime) {
                        console.warn("Item", item.id, "del ticket no tiene tiempo de salida, usando el de la orden principal.");
                        item.deliveryDepartureTime = order.deliveryDepartureTime;
                        item.deliveryDepartureTimeFormatted = order.deliveryDepartureTimeFormatted;
                    }

                    // Calcular tiempo de entrega
                    var itemDeliveryTime = Math.max(0, Math.floor((arrivalTime - new Date(item.deliveryDepartureTime)) / 1000));
                    item.deliveryTime = itemDeliveryTime;
                    item.deliveryTimeFormatted = Avika.utils.formatElapsedTime(itemDeliveryTime);

                    // Mover a completadas
                    Avika.data.completedOrders.unshift(item);
                    itemsToRemoveFromDelivery.push(i); // Marcar para eliminar después
                }
            }

            // Eliminar todos los platillos del ticket de la lista de reparto (de mayor a menor índice)
            itemsToRemoveFromDelivery.sort((a, b) => b - a); // Ordenar índices descendente
            itemsToRemoveFromDelivery.forEach(idx => {
                 Avika.data.deliveryOrders.splice(idx, 1);
            });

        } else {
             // Si no es parte de un ticket, simplemente eliminar la orden original de reparto
             Avika.data.deliveryOrders.splice(orderIndex, 1);
        }

        // Actualizar tablas
        if (Avika.ui) {
            if (typeof Avika.ui.updatePendingTable === 'function') Avika.ui.updatePendingTable(); // Por si acaso algo cambió
            if (typeof Avika.ui.updateDeliveryTable === 'function') Avika.ui.updateDeliveryTable();
            if (typeof Avika.ui.updateCompletedTable === 'function') Avika.ui.updateCompletedTable();
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            var message = order.ticketId
                ? `¡Ticket #${order.ticketId.substring(order.ticketId.length-5)} entregado!`
                : `¡Entrega completada para ${order.dish}!`;
            message += ` Tiempo de entrega: ${order.deliveryTimeFormatted}`;
            Avika.ui.showNotification(message, 'success');
        }
    },

    // Función para limpiar órdenes completadas
    clearCompletedOrders: function() {
        console.log("Limpiando historial de órdenes completadas");

        // Solicitar confirmación
        if (!confirm('¿Estás seguro de que deseas eliminar todo el historial de órdenes completadas? Esta acción no se puede deshacer.')) {
            return false;
        }

        // Verificar si existe el array
        if (!Avika.data) {
            Avika.data = {};
        }

        // Realizar copia de seguridad en localStorage
        try {
            var backup = JSON.stringify(Avika.data.completedOrders || []);
            localStorage.setItem('avika_completedOrders_backup', backup);
            localStorage.setItem('avika_backup_timestamp', new Date().toString());
            console.log("Copia de seguridad del historial creada en localStorage.");
        } catch (e) {
            console.warn("No se pudo crear copia de seguridad del historial:", e);
        }

        // Vaciar array de completadas
        Avika.data.completedOrders = [];

        // Actualizar tabla
        if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
            Avika.ui.updateCompletedTable();
        }

        // Guardar cambios
        if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
            Avika.storage.guardarDatosLocales();
        }

        // Mostrar notificación
        if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
            Avika.ui.showNotification('Historial de órdenes limpiado. Se ha creado una copia de seguridad.', 'info');
        } else {
            console.log('Historial de órdenes limpiado');
        }

        return true;
    },

    // Función auxiliar para formatear tiempo (revisada y simplificada)
    formatTime: function(date) {
        // Usar la función centralizada si está disponible
        if (Avika.utils && typeof Avika.utils.formatTime === 'function') {
            return Avika.utils.formatTime(date);
        }

        // Implementación de respaldo robusta
        if (!(date instanceof Date) || isNaN(date.getTime())) {
             // Intentar parsear si es un string
             if (typeof date === 'string') {
                 try {
                     date = new Date(date);
                     if (isNaN(date.getTime())) return '--:--:--';
                 } catch(e) {
                     return '--:--:--';
                 }
             } else {
                return '--:--:--';
             }
        }

        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

         // Usar padZero de utils si existe, sino un fallback local
        const pad = (Avika.utils && Avika.utils.padZero) ? Avika.utils.padZero : (num) => (num < 10 ? '0' : '') + num;

        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    },

    // Recuperar órdenes completadas desde la copia de seguridad
    restoreCompletedOrdersBackup: function() {
        var backup = localStorage.getItem('avika_completedOrders_backup');
        var timestamp = localStorage.getItem('avika_backup_timestamp');

        if (!backup) {
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('No hay copia de seguridad disponible', 'warning');
            } else {
                console.warn('No hay copia de seguridad disponible');
            }
            return false;
        }

        try {
            var orders = JSON.parse(backup);

            if (!Array.isArray(orders)) { // No verificar longitud, puede ser 0
                 throw new Error("La copia de seguridad no contiene un array válido.");
            }

            // Solicitar confirmación mostrando información sobre la copia
            var confirmMsg = `¿Desea restaurar ${orders.length} órdenes completadas`;
            if (timestamp) {
                confirmMsg += ` desde la copia de seguridad creada el ${new Date(timestamp).toLocaleString()}`;
            }
            confirmMsg += `? Esto reemplazará el historial actual.`;

            if (!confirm(confirmMsg)) {
                return false;
            }

            // Restaurar órdenes
            Avika.data.completedOrders = orders;

            // Actualizar tabla
            if (Avika.ui && typeof Avika.ui.updateCompletedTable === 'function') {
                Avika.ui.updateCompletedTable();
            }

            // Guardar cambios
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }

             // Limpiar la copia de seguridad después de restaurar (opcional, pero recomendado)
             localStorage.removeItem('avika_completedOrders_backup');
             localStorage.removeItem('avika_backup_timestamp');
             console.log("Copia de seguridad restaurada y eliminada de localStorage.");


            // Mostrar notificación
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification(`Se han restaurado ${orders.length} órdenes completadas.`, 'success');
            } else {
                console.log(`Se han restaurado ${orders.length} órdenes completadas.`);
            }

            return true;
        } catch (e) {
            console.error("Error al restaurar copia de seguridad:", e);
            if (Avika.ui && typeof Avika.ui.showNotification === 'function') {
                Avika.ui.showNotification('Error al restaurar copia de seguridad: ' + e.message, 'error');
            }
            return false;
        }
    }
}; // <--- ESTE ES EL CIERRE CORRECTO DEL OBJETO Avika.orders

// --- TODO EL CÓDIGO DESDE AQUÍ HACIA ABAJO HA SIDO ELIMINADO ---