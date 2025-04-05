// ui-controller.js - Funciones de interfaz de usuario para Avika Timer
// Este módulo maneja toda la interacción con el usuario y actualización de la UI

window.Avika = window.Avika || {};

Avika.ui = {
    // Estado de la UI
    state: {
        lastSavedState: '',
        currentSection: 'categories-section',
        expandedTickets: {},
        ticketMode: false,
        ticketItems: [],
        ticketService: 'comedor'
    },
    
    // Inicializar todos los eventos de la aplicación
    initEvents: function() {
        try {
            console.log("Inicializando eventos...");
            
            // Asegurar que las funciones de formato estén disponibles
            this.ensureFormatFunctions();
            
            // Inicializar botones de servicio
            var btnComedorIndividual = document.getElementById('btn-comedor');
            var btnDomicilioIndividual = document.getElementById('btn-domicilio');
            var btnParaLlevarIndividual = document.getElementById('btn-para-llevar');
            
            var btnComedorTicket = document.getElementById('ticket-btn-comedor');
            var btnDomicilioTicket = document.getElementById('ticket-btn-domicilio');
            var btnParaLlevarTicket = document.getElementById('ticket-btn-para-llevar');
            
            // Asignar eventos a botones de servicio individual
            if (btnComedorIndividual) {
                btnComedorIndividual.onclick = null; // Eliminar onclick inline
                btnComedorIndividual.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'comedor');
                });
            }
            
            if (btnDomicilioIndividual) {
                btnDomicilioIndividual.onclick = null; // Eliminar onclick inline
                btnDomicilioIndividual.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'domicilio');
                });
            }
            
            if (btnParaLlevarIndividual) {
                btnParaLlevarIndividual.onclick = null; // Eliminar onclick inline
                btnParaLlevarIndividual.addEventListener('click', function() {
                    Avika.ui.selectService(this, 'para-llevar');
                });
            }
            
            // Asignar eventos a botones de servicio del ticket
            if (btnComedorTicket) {
                btnComedorTicket.onclick = null; // Eliminar onclick inline
                btnComedorTicket.addEventListener('click', function() {
                    Avika.ui.selectTicketService(this, 'comedor');
                });
            }
            
            if (btnDomicilioTicket) {
                btnDomicilioTicket.onclick = null; // Eliminar onclick inline
                btnDomicilioTicket.addEventListener('click', function() {
                    Avika.ui.selectTicketService(this, 'domicilio');
                });
            }
            
            if (btnParaLlevarTicket) {
                btnParaLlevarTicket.onclick = null; // Eliminar onclick inline
                btnParaLlevarTicket.addEventListener('click', function() {
                    Avika.ui.selectTicketService(this, 'para-llevar');
                });
            }
            
            // Inicializar botones de cantidad
            var quantityBtns = document.querySelectorAll('.qty-btn');
            quantityBtns.forEach(function(btn) {
                btn.onclick = null; // Eliminar onclick inline
                
                if (btn.textContent === '-') {
                    btn.addEventListener('click', function() {
                        Avika.ui.changeQuantity(-1);
                    });
                } else if (btn.textContent === '+') {
                    btn.addEventListener('click', function() {
                        Avika.ui.changeQuantity(1);
                    });
                }
            });
            
            // Inicializar botón para iniciar preparación
            var btnStart = document.getElementById('btn-start');
            if (btnStart) {
                console.log("Asignando evento al botón iniciar preparación");
                // Eliminar cualquier evento anterior
                var btnStartClone = btnStart.cloneNode(true);
                if (btnStart.parentNode) {
                    btnStart.parentNode.replaceChild(btnStartClone, btnStart);
                    btnStart = btnStartClone;
                }
                
                // Asignar nuevo evento
                btnStart.addEventListener('click', function() {
                    console.log("Clic en botón iniciar preparación");
                    Avika.ui.startPreparation();
                });
            } else {
                console.error("Botón iniciar preparación no encontrado");
            }
            
            // Inicializar botón para cancelar
            var btnCancel = document.getElementById('btn-cancel');
            if (btnCancel) {
                console.log("Asignando evento al botón cancelar");
                // Eliminar cualquier evento anterior
                var btnCancelClone = btnCancel.cloneNode(true);
                if (btnCancel.parentNode) {
                    btnCancel.parentNode.replaceChild(btnCancelClone, btnCancel);
                    btnCancel = btnCancelClone;
                }
                
                // Asignar nuevo evento
                btnCancel.addEventListener('click', function() {
                    console.log("Clic en botón cancelar");
                    Avika.ui.showSection('dishes-section');
                });
            } else {
                console.error("Botón cancelar no encontrado");
            }
            
            // Inicializar botón para volver a categorías
            var btnBackToCategories = document.getElementById('btn-back-to-categories');
            if (btnBackToCategories) {
                btnBackToCategories.addEventListener('click', function() {
                    Avika.ui.showSection('categories-section');
                });
            }
            
            // Inicializar ticket/comanda
            var newTicketBtn = document.getElementById('btn-new-ticket');
            if (newTicketBtn) {
                newTicketBtn.addEventListener('click', function() {
                    Avika.ui.enableTicketMode();
                });
            }
            
            // Inicializar botón para desbloquear tickets
            var forceCompleteBtn = document.getElementById('btn-force-complete');
            if (forceCompleteBtn) {
                forceCompleteBtn.addEventListener('click', function() {
                    Avika.ui.showForceCompleteModal();
                });
            }
            
            console.log("Eventos inicializados correctamente");
            return true;
        } catch (e) {
            console.error("Error durante la inicialización de eventos:", e);
            console.error("Detalles del error:", e.message);
            console.error("Stack:", e.stack);
            
            // Mostrar mensaje de error al usuario
            this.showErrorMessage('Hubo un problema al inicializar la aplicación: ' + e.message);
            return false;
        }
    },
    
    // Asegurar que las funciones de formato estén disponibles
    ensureFormatFunctions: function() {
        // Verificar si las funciones de formato están disponibles globalmente
        if (typeof window.formatTime !== 'function') {
            window.formatTime = this.formatTime.bind(this);
        }
        
        if (typeof window.calculateElapsedTime !== 'function') {
            window.calculateElapsedTime = this.calculateElapsedTime.bind(this);
        }
        
        // También crear alias para acceder desde cualquier contexto
        Avika.formatTime = this.formatTime.bind(this);
        Avika.calculateElapsedTime = this.calculateElapsedTime.bind(this);
        
        console.log("Funciones de formato aseguradas");
        return true;
    },
    
    // Función para mostrar mensajes de error
    showErrorMessage: function(message) {
        console.error("Error:", message);
        
        // Buscar o crear un elemento para mostrar errores
        var errorContainer = document.getElementById('error-message');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'error-message';
            errorContainer.style.position = 'fixed';
            errorContainer.style.top = '20%';
            errorContainer.style.left = '50%';
            errorContainer.style.transform = 'translateX(-50%)';
            errorContainer.style.backgroundColor = '#f44336';
            errorContainer.style.color = 'white';
            errorContainer.style.padding = '15px 20px';
            errorContainer.style.borderRadius = '5px';
            errorContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            errorContainer.style.zIndex = '9999';
            errorContainer.style.maxWidth = '80%';
            errorContainer.style.textAlign = 'center';
            document.body.appendChild(errorContainer);
        }
        
        // Añadir mensaje y botón de cerrar
        errorContainer.innerHTML = '<span id="close-error" style="position:absolute;right:10px;top:10px;cursor:pointer;font-weight:bold;">&times;</span>' +
                               '<p style="margin:0;">' + message + '</p>';
        
        // Mostrar el error
        errorContainer.style.display = 'block';
        
        // Añadir evento para cerrar
        var closeBtn = document.getElementById('close-error');
        if (closeBtn) {
            closeBtn.onclick = function() {
                errorContainer.style.display = 'none';
            };
        }
    },
    
    // Ocultar mensaje de error
    hideErrorMessage: function() {
        var errorContainer = document.getElementById('error-message');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    },
    
    // Función para formatear hora
    padZero: function(num) {
        try {
            return (num < 10 ? '0' : '') + num;
        } catch (e) {
            console.error("Error en padZero:", e);
            return '00';
        }
    },

    formatTime: function(date) {
        if (!date) return '--:--:--';
        
        try {
            // Asegurarnos de que date sea un objeto Date
            var d = date instanceof Date ? date : new Date(date);
            
            if (isNaN(d.getTime())) {
                console.warn("Fecha inválida:", date);
                return '--:--:--';
            }
            
            var hours = d.getHours();
            var minutes = d.getMinutes();
            var seconds = d.getSeconds();
            
            // Asegurar que esta función use siempre padZero del mismo objeto
            return this.padZero(hours) + ':' + this.padZero(minutes) + ':' + this.padZero(seconds);
        } catch (e) {
            console.error("Error en formatTime:", e);
            return '--:--:--';
        }
    },
    
    // Mostrar platos de una categoría seleccionada
    showDishes: function(category) {
        console.log("Mostrando platos de la categoría:", category);
        try {
            // Verificar que la categoría existe
            if (!category || !Avika.config.categoryNames || !Avika.config.categoryNames[category]) {
                console.error("Error: Categoría no válida:", category);
                this.showNotification("Error: Categoría no válida.");
                return;
            }
            
            // Llamar a la función selectCategory para mostrar los platos
            if (typeof this.selectCategory === 'function') {
                this.selectCategory(category);
            } else {
                console.error("Error: Función selectCategory no encontrada");
                this.showNotification("Error: No se pueden mostrar los platos.");
            }
        } catch (e) {
            console.error("Error al mostrar platos:", e);
            this.showNotification("Error al mostrar platillos: " + e.message);
        }
    },
    
    // Mostrar secciones de la aplicación
    showSection: function(sectionId) {
        try {
            if (!sectionId) {
                console.error("Error: No se proporcionó un ID de sección.");
                return;
            }
            
            console.log("Mostrando sección:", sectionId);
            
            // Ocultar todas las secciones
            var sections = document.querySelectorAll('.app-section');
            for (var i = 0; i < sections.length; i++) {
                sections[i].style.display = 'none';
            }
            
            // Mostrar la sección solicitada
            var section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
                this.state.currentSection = sectionId;
                
                // Si es la sección de platillos, enfocar la búsqueda si existe
                if (sectionId === 'dishes-section') {
                    var searchInput = document.getElementById('dish-search');
                    if (searchInput) {
                        setTimeout(function() {
                            searchInput.focus();
                        }, 300);
                    }
                }
                
                // Si es la sección de detalles, resetear personalización
                if (sectionId === 'dish-details-section') {
                    this.resetCustomization();
                }
                
                // Si es la sección de categorías, actualizar contadores
                if (sectionId === 'categories-section') {
                    if (typeof this.updatePendingCount === 'function') {
                        this.updatePendingCount();
                    }
                }
            } else {
                console.error("Sección no encontrada:", sectionId);
                this.showNotification("Error: No se pudo mostrar la sección " + sectionId);
            }
        } catch (e) {
            console.error("Error al mostrar sección:", e);
            this.showNotification("Error: " + e.message);
        }
    },
    
    // Seleccionar servicio
    selectService: function(button, service) {
        console.log("Seleccionando servicio:", service);
        
        // Actualizar estado
        Avika.data.currentService = service;
        
        // Actualizar clases de botones para indicar selección
        var serviceBtns = document.querySelectorAll('.service-btn');
        serviceBtns.forEach(function(btn) {
            btn.classList.remove('selected');
        });
        
        if (button) {
            button.classList.add('selected');
        }
    },
    
    // Seleccionar servicio para ticket
    selectTicketService: function(button, service) {
        console.log("Seleccionando servicio para ticket:", service);
        
        // Actualizar estado
        this.state.ticketService = service;
        
        // Actualizar clases de botones para indicar selección
        var serviceBtns = document.querySelectorAll('.option-btn');
        serviceBtns.forEach(function(btn) {
            btn.classList.remove('selected');
        });
        
        if (button) {
            button.classList.add('selected');
        }
    },
    
    // Detectar tipo de dispositivo y adaptar interfaz
    detectDevice: function() {
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        var isSmallScreen = window.innerWidth < 480;
        
        if (isMobile || isSmallScreen) {
            document.body.classList.add('mobile-device');
            console.log("Dispositivo móvil detectado. Adaptando interfaz...");
            
            // Si es dispositivo móvil, reducir el tamaño de los textos y elementos
            this.adaptMobileInterface();
        } else {
            document.body.classList.remove('mobile-device');
            console.log("Dispositivo de escritorio detectado");
        }
        
        // Registrar evento de cambio de tamaño de ventana
        window.addEventListener('resize', function() {
            var isSmallScreen = window.innerWidth < 480;
            if (isSmallScreen) {
                document.body.classList.add('mobile-device');
                Avika.ui.adaptMobileInterface();
            } else {
                document.body.classList.remove('mobile-device');
            }
        });
        
        return isMobile || isSmallScreen;
    },
    
    // Adaptar interfaz para móviles
    adaptMobileInterface: function() {
        try {
            console.log("Adaptando interfaz para móviles...");
            
            // Reducir altura de encabezado
            var header = document.querySelector('header');
            if (header) {
                header.style.padding = '8px';
            }
            
            // Aplicar estilos adicionales para categorías en móviles
            var categoryContainer = document.querySelector('.category-container');
            if (categoryContainer) {
                // Asegurar que tenga máximo 3 botones por fila
                var buttons = categoryContainer.querySelectorAll('.category-btn');
                var screenWidth = window.innerWidth;
                var maxButtons = screenWidth < 360 ? 2 : 3;
                
                // Asignar ancho aproximado para mostrar 2 o 3 botones por fila
                var buttonWidth = (screenWidth - 40) / maxButtons;
                buttons.forEach(function(btn) {
                    // Establecer ancho fijo para cada botón
                    btn.style.width = (buttonWidth - 10) + 'px';
                    btn.style.margin = '3px';
                    
                    // Ajustar texto para que quepa mejor
                    var text = btn.textContent;
                    if (text.includes("Platillos")) {
                        btn.textContent = text.replace("Platillos", "Plat.");
                    }
                    if (text.includes("Entradas")) {
                        btn.textContent = text.replace("Entradas", "Ent.");
                    }
                });
            }
            
            console.log("Interfaz móvil adaptada correctamente");
        } catch (e) {
            console.error("Error al adaptar interfaz móvil:", e);
        }
    },
    
    // Mostrar selector de tiempo personalizado
    showTimeSelector: function(callback) {
        var self = this;
        
        // Crear modal para selector de tiempo
        var modalContainer = document.createElement('div');
        modalContainer.className = 'time-selector-modal';
        modalContainer.style.position = 'fixed';
        modalContainer.style.top = '0';
        modalContainer.style.left = '0';
        modalContainer.style.width = '100%';
        modalContainer.style.height = '100%';
        modalContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modalContainer.style.display = 'flex';
        modalContainer.style.justifyContent = 'center';
        modalContainer.style.alignItems = 'center';
        modalContainer.style.zIndex = '9999';
        
        var modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        modalContent.style.maxWidth = '400px';
        modalContent.style.width = '90%';
        modalContent.style.color = '#333'; // Asegurar texto visible
        
        var title = document.createElement('h3');
        title.textContent = 'Seleccionar hora';
        title.style.marginTop = '0';
        title.style.marginBottom = '15px';
        title.style.color = '#333'; // Asegurar texto visible
        
        var timeContainer = document.createElement('div');
        timeContainer.style.display = 'flex';
        timeContainer.style.alignItems = 'center';
        timeContainer.style.justifyContent = 'center';
        timeContainer.style.marginBottom = '20px';
        
        // Inputs para hora y minuto
        var hourInput = document.createElement('input');
        hourInput.type = 'number';
        hourInput.min = '0';
        hourInput.max = '23';
        hourInput.step = '1';
        hourInput.value = new Date().getHours();
        hourInput.style.width = '60px';
        hourInput.style.textAlign = 'center';
        hourInput.style.fontSize = '24px';
        hourInput.style.padding = '5px';
        hourInput.style.marginRight = '5px';
        hourInput.style.color = '#333'; // Asegurar texto visible
        
        var separator = document.createElement('span');
        separator.textContent = ':';
        separator.style.fontSize = '24px';
        separator.style.margin = '0 5px';
        separator.style.fontWeight = 'bold';
        separator.style.color = '#333'; // Asegurar texto visible
        
        var minuteInput = document.createElement('input');
        minuteInput.type = 'number';
        minuteInput.min = '0';
        minuteInput.max = '59';
        minuteInput.step = '1';
        minuteInput.value = new Date().getMinutes();
        minuteInput.style.width = '60px';
        minuteInput.style.textAlign = 'center';
        minuteInput.style.fontSize = '24px';
        minuteInput.style.padding = '5px';
        minuteInput.style.color = '#333'; // Asegurar texto visible
        
        timeContainer.appendChild(hourInput);
        timeContainer.appendChild(separator);
        timeContainer.appendChild(minuteInput);
        
        // Contenedor para botones
        var buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'space-between';
        
        var nowButton = document.createElement('button');
        nowButton.textContent = 'Usar hora actual';
        nowButton.style.padding = '8px 15px';
        nowButton.style.backgroundColor = '#4CAF50';
        nowButton.style.color = 'white';
        nowButton.style.border = 'none';
        nowButton.style.borderRadius = '4px';
        nowButton.style.cursor = 'pointer';
        
        var customButton = document.createElement('button');
        customButton.textContent = 'Usar hora personalizada';
        customButton.style.padding = '8px 15px';
        customButton.style.backgroundColor = '#2196F3';
        customButton.style.color = 'white';
        customButton.style.border = 'none';
        customButton.style.borderRadius = '4px';
        customButton.style.cursor = 'pointer';
        
        buttonsContainer.appendChild(nowButton);
        buttonsContainer.appendChild(customButton);
        
        // Añadir elementos al modal
        modalContent.appendChild(title);
        modalContent.appendChild(timeContainer);
        modalContent.appendChild(buttonsContainer);
        modalContainer.appendChild(modalContent);
        
        // Añadir modal al documento
        document.body.appendChild(modalContainer);
        
        // Enfocar el input de hora
        setTimeout(function() {
            hourInput.focus();
        }, 100);
        
        // Evento para botón de hora actual
        nowButton.addEventListener('click', function() {
            document.body.removeChild(modalContainer);
            if (typeof callback === 'function') {
                callback(new Date());
            }
        });
        
        // Evento para botón de hora personalizada
        customButton.addEventListener('click', function() {
            var hour = parseInt(hourInput.value);
            var minute = parseInt(minuteInput.value);
            
            // Validar entrada
            if (isNaN(hour) || hour < 0 || hour > 23) {
                self.showErrorMessage("Hora inválida. Debe estar entre 0 y 23.");
                return;
            }
            
            if (isNaN(minute) || minute < 0 || minute > 59) {
                self.showErrorMessage("Minutos inválidos. Deben estar entre 0 y 59.");
                return;
            }
            
            // Crear objeto Date con la hora seleccionada
            var selectedTime = new Date();
            selectedTime.setHours(hour, minute, 0);
            
            document.body.removeChild(modalContainer);
            if (typeof callback === 'function') {
                callback(selectedTime);
            }
        });
    },
    
    // Modificar startPreparation para permitir hora personalizada
    startPreparation: function() {
        const self = this; // Guardar referencia a this
        
        // Mostrar selector de tiempo
        this.showTimeSelector(function(selectedTime) {
            console.log("Iniciando preparación con hora:", selectedTime);
            
            try {
                // Obtener datos de personalización
                var customizationText = '';
                if (Avika.data.currentCustomizations && Avika.data.currentCustomizations.length > 0) {
                    Avika.data.currentCustomizations.forEach(function(code) {
                        if (Avika.config.customizationOptions[code]) {
                            customizationText += Avika.config.customizationOptions[code] + ', ';
                        }
                    });
                    customizationText = customizationText.slice(0, -2); // Eliminar la última coma y espacio
                }
                
                // Obtener notas
                var notes = '';
                var notesInput = document.getElementById('notes-input');
                if (notesInput) {
                    notes = notesInput.value.trim();
                }
                
                // Si estamos en modo ticket, agregar a la lista de items del ticket
                if (self.state.ticketMode) {
                    console.log("Agregando platillo al ticket actual");
                    
                    // Crear objeto para el item del ticket
                    var ticketItem = {
                        dish: Avika.data.currentDish,
                        quantity: Avika.data.currentQuantity,
                        customizations: Avika.data.currentCustomizations || [],
                        customizationText: customizationText,
                        notes: notes,
                        service: Avika.data.currentService,
                        startTime: selectedTime, // Usar la hora seleccionada
                        startTimeFormatted: Avika.ui.formatTime(selectedTime)
                    };
                    
                    // Agregar a la lista de items
                    self.state.ticketItems.push(ticketItem);
                    
                    // Actualizar tabla de items del ticket
                    self.updateTicketItems();
                    
                    // Actualizar el texto del botón de agregar
                    var addButton = document.getElementById('btn-add-to-ticket');
                    if (addButton) {
                        addButton.textContent = 'Agregar otro platillo';
                    }
                    
                    // Mostrar modal de ticket
                    var ticketModal = document.getElementById('ticket-modal');
                    if (ticketModal) {
                        ticketModal.style.display = 'block';
                    } else {
                        self.showErrorMessage("El modal del ticket no se pudo encontrar");
                    }
                    
                    // Mostrar notificación
                    self.showNotification("Platillo agregado al ticket");
                    
                    return;
                }
                
                // Si no estamos en modo ticket, crear un nuevo platillo individual
                var newOrder = {
                    dish: Avika.data.currentDish,
                    quantity: Avika.data.currentQuantity,
                    customizations: Avika.data.currentCustomizations || [],
                    notes: notes,
                    service: Avika.data.currentService,
                    startTime: selectedTime, // Usar la hora seleccionada
                    startTimeFormatted: Avika.ui.formatTime(selectedTime)
                };
                
                // Agregar a la lista de órdenes pendientes
                if (!Avika.data.pendingOrders) {
                    Avika.data.pendingOrders = [];
                }
                
                Avika.data.pendingOrders.push(newOrder);
                
                // Guardar datos
                if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                    Avika.storage.guardarDatosLocales();
                }
                
                // Actualizar tabla de órdenes pendientes
                self.updatePendingTable();
                
                // Mostrar notificación
                self.showNotification("Platillo agregado a la lista de preparación");
                
                // Volver a la sección de categorías
                self.showSection('categories-section');
            } catch (e) {
                console.error("Error al iniciar preparación:", e);
                self.showErrorMessage("Error al iniciar preparación: " + e.message);
            }
        });
    },
    
    // Completar ticket
    completeTicket: function(ticketId) {
        console.log("Completando ticket:", ticketId);
        
        try {
            // Encontrar todas las órdenes asociadas a este ticket
            var ticketOrders = [];
            var orderIndices = [];
            
            // Buscar todas las órdenes del ticket
            if (Avika.data.pendingOrders) {
                for (var i = 0; i < Avika.data.pendingOrders.length; i++) {
                    var order = Avika.data.pendingOrders[i];
                    if (order.ticketId === ticketId) {
                        orderIndices.push(i);
                        ticketOrders.push(order);
                    }
                }
            }
            
            if (ticketOrders.length === 0) {
                this.showNotification("Error: No se encontraron órdenes para el ticket " + ticketId);
                return;
            }
            
            console.log("Completando", ticketOrders.length, "órdenes del ticket", ticketId);
            
            // Marcar todas las órdenes como completadas
            var now = new Date();
            
            for (var j = 0; j < ticketOrders.length; j++) {
                var order = ticketOrders[j];
                
                // Actualizar estado y tiempo de finalización
                order.status = 'completed';
                order.finishTime = now;
                
                // Mover a órdenes completadas
                if (!Avika.data.completedOrders) {
                    Avika.data.completedOrders = [];
                }
                
                // Crear una copia para evitar referencias
                var orderCopy = JSON.parse(JSON.stringify(order));
                
                // Guardar formato ISO para las fechas (para restaurarlas después)
                if (order.startTime) {
                    orderCopy.startTimeISO = new Date(order.startTime).toISOString();
                }
                if (now) {
                    orderCopy.finishTimeISO = now.toISOString();
                }
                
                Avika.data.completedOrders.push(orderCopy);
            }
            
            // Eliminar órdenes del array pendingOrders (desde el final para no afectar índices)
            for (var i = orderIndices.length - 1; i >= 0; i--) {
                Avika.data.pendingOrders.splice(orderIndices[i], 1);
            }
            
            // Guardar datos
            if (Avika.storage && typeof Avika.storage.guardarDatosLocales === 'function') {
                Avika.storage.guardarDatosLocales();
            }
            
            // Actualizar tablas
            this.updatePendingTable();
            if (typeof this.updateCompletedTable === 'function') {
                this.updateCompletedTable(false);
            }
            
            // Cerrar el modal
            var forceCompleteModal = document.getElementById('force-complete-modal');
            if (forceCompleteModal) {
                forceCompleteModal.style.display = 'none';
            }
            
            // Mostrar notificación
            this.showNotification("Ticket #" + ticketId.replace('ticket-', '') + " completado manualmente");
            
        } catch (e) {
            console.error("Error al completar ticket:", e);
            this.showErrorMessage("Error al completar ticket: " + e.message);
        }
    },
    
    // Implementar la función addOrderRow correctamente
    addOrderRow: function(tbody, order, index) {
        var row = tbody.insertRow();
        var self = this;
        
        // Platillo
        var dishCell = row.insertCell(0);
        dishCell.textContent = order.dish + (order.quantity > 1 ? ' (' + order.quantity + ')' : '');
        dishCell.style.color = "#333"; // Asegurar color de texto visible
        
        // Hora de inicio
        var startCell = row.insertCell(1);
        startCell.textContent = Avika.ui.formatTime(new Date(order.startTime));
        startCell.style.color = "#333"; // Asegurar color de texto visible
        
        // Temporizador
        var timerCell = row.insertCell(2);
        timerCell.className = 'timer-cell';
        timerCell.setAttribute('data-start-time', order.startTime);
        timerCell.textContent = Avika.ui.calculateElapsedTime(order.startTime);
        timerCell.style.color = "#333"; // Asegurar color de texto visible
        
        // Detalles
        var detailsCell = row.insertCell(3);
        detailsCell.style.color = "#333"; // Asegurar color de texto visible
        
        // Servicio
        var serviceText = '';
        switch (order.service) {
            case 'comedor': serviceText = 'Comedor'; break;
            case 'domicilio': serviceText = 'Domicilio'; break;
            case 'para-llevar': serviceText = 'Ordena y espera'; break;
            default: serviceText = order.service;
        }
        
        // Personalización
        var customText = '';
        if (order.customizations && order.customizations.length > 0) {
            order.customizations.forEach(function(code) {
                if (Avika.config.customizationOptions[code]) {
                    customText += Avika.config.customizationOptions[code] + ', ';
                }
            });
            customText = customText.slice(0, -2); // Eliminar última coma y espacio
        }
        
        // Notas
        var notesText = order.notes ? '<br>Nota: ' + order.notes : '';
        
        // Combinar toda la información
        detailsCell.innerHTML = '<strong>' + serviceText + '</strong>' + 
                              (customText ? '<br>' + customText : '') + 
                              notesText;
        
        // Acciones
        var actionsCell = row.insertCell(4);
        
        // Botón para marcar como completado
        var completeBtn = document.createElement('button');
        completeBtn.textContent = 'Listo';
        completeBtn.className = 'action-btn';
        
        completeBtn.onclick = function() {
            Avika.ui.completeOrder(index);
        };
        
        actionsCell.appendChild(completeBtn);
    }
};