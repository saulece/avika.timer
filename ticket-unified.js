// ticket-unified.js - Script unificado para gestión de estilos de tickets
// Este archivo combina la funcionalidad de ticket-color-fix.js y ticket-styles.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Ticket unified script loaded");
    
    // Colores consistentes para cada tipo de servicio
    const TICKET_COLORS = {
        'comedor': '#e6f2ff', // Azul para comedor
        'domicilio': '#ffe6e6', // Rojo para domicilio
        'para-llevar': '#e6ffe6', // Verde para llevar
        'ordena-y-espera': '#fff9e6', // Amarillo claro para ordena y espera
        'otro': '#f5f5f5' // Gris claro para otros
    };

    // Función unificada para aplicar estilos a los tickets
    function applyTicketStyles() {
        // Buscar todas las filas de tickets
        const rows = document.querySelectorAll('tr');
        
        // Agrupar filas por tickets
        const ticketGroups = {};
        let currentTicketId = null;
        let currentServiceType = null;
        
        rows.forEach(row => {
            // Buscar el ID del ticket en la fila
            const ticketLabel = row.querySelector('.ticket-label');
            if (ticketLabel) {
                const ticketText = ticketLabel.textContent;
                const ticketMatch = ticketText.match(/Ticket #(\d+)/);
                if (ticketMatch) {
                    currentTicketId = ticketMatch[1];
                    
                    // Determinar el tipo de servicio
                    const serviceTypeElements = row.querySelectorAll('.service-type');
                    if (serviceTypeElements.length > 0) {
                        const serviceText = serviceTypeElements[0].textContent.toLowerCase();
                        if (serviceText.includes('comedor')) {
                            currentServiceType = 'comedor';
                        } else if (serviceText.includes('domicilio')) {
                            currentServiceType = 'domicilio';
                        } else if (serviceText.includes('para llevar') || serviceText.includes('ordena y espera')) {
                            currentServiceType = 'para-llevar';
                        } else {
                            currentServiceType = 'otro';
                        }
                    }
                    
                    // Inicializar grupo de ticket
                    if (!ticketGroups[currentTicketId]) {
                        ticketGroups[currentTicketId] = {
                            rows: [],
                            serviceType: currentServiceType
                        };
                    }
                }
            }
            
            // Si tenemos un ticket actual, agregar la fila a su grupo
            if (currentTicketId) {
                ticketGroups[currentTicketId].rows.push(row);
                
                // Verificar si es la última fila del ticket
                const nextRow = row.nextElementSibling;
                if (!nextRow || nextRow.querySelector('.ticket-label')) {
                    currentTicketId = null;
                    currentServiceType = null;
                }
            }
        });
        
        // Aplicar estilos consistentes a cada grupo de ticket
        for (const ticketId in ticketGroups) {
            const group = ticketGroups[ticketId];
            const color = TICKET_COLORS[group.serviceType] || TICKET_COLORS.otro;
            
            // Aplicar estilos a todas las filas del ticket
            group.rows.forEach((row, index) => {
                // Aplicar clase según el tipo de servicio
                if (group.serviceType) {
                    row.classList.add(`ticket-${group.serviceType}`);
                }
                
                // Aplicar clase ticket-row a todas las filas
                row.classList.add('ticket-row');
                
                // Aplicar estilos adicionales
                if (index === 0) {
                    row.classList.add('ticket-first-row');
                }
                if (index === group.rows.length - 1) {
                    row.classList.add('ticket-last-row');
                }
                
                // Almacenar el tipo de servicio como atributo data para referencia futura
                row.setAttribute('data-service-type', group.serviceType || 'otro');
            });
        }
    }
    
    // Aplicar estilos inicialmente con un pequeño retraso para asegurar que el DOM esté listo
    setTimeout(applyTicketStyles, 500);
    
    // Configurar un solo observador de mutación para optimizar el rendimiento
    const observer = new MutationObserver(function(mutations) {
        // Usar un temporizador para evitar múltiples actualizaciones en rápida sucesión
        clearTimeout(window.ticketStylesTimer);
        window.ticketStylesTimer = setTimeout(applyTicketStyles, 100);
    });
    
    // Observar cambios en las tablas con una configuración optimizada
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        observer.observe(table, { 
            childList: true, 
            subtree: true
        });
    });
    
    // Integración con Avika UI
    window.addEventListener('load', function() {
        if (window.Avika && Avika.ui) {
            // Guardar referencia a las funciones originales
            const originalUpdatePendingTable = Avika.ui.updatePendingTable;
            const originalUpdateDeliveryTable = Avika.ui.updateDeliveryTable;
            const originalUpdateCompletedTable = Avika.ui.updateCompletedTable;
            
            // Sobrescribir funciones para aplicar estilos después de actualizar tablas
            Avika.ui.updatePendingTable = function() {
                originalUpdatePendingTable.apply(this, arguments);
                setTimeout(applyTicketStyles, 0);
            };
            
            Avika.ui.updateDeliveryTable = function() {
                originalUpdateDeliveryTable.apply(this, arguments);
                setTimeout(applyTicketStyles, 0);
            };
            
            Avika.ui.updateCompletedTable = function(showAll) {
                originalUpdateCompletedTable.call(this, showAll);
                setTimeout(applyTicketStyles, 0);
            };
            
            console.log("Ticket styles integration with Avika UI completed");
        }
    });
});
