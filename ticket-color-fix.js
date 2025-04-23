// Script para corregir los colores inconsistentes de los tickets
document.addEventListener('DOMContentLoaded', function() {
    // Colores consistentes para cada tipo de servicio
    const TICKET_COLORS = {
        'comedor': '#e6f2ff', // Azul más consistente para comedor
        'domicilio': '#ffe6e6', // Rojo más consistente para domicilio
        'para-llevar': '#e6ffe6', // Verde más consistente para llevar
        'ordena-y-espera': '#fff9e6', // Amarillo claro para ordena y espera
        'otro': '#f5f5f5' // Gris claro para otros
    };

    // Función para aplicar colores consistentes a los tickets
    function fixTicketColors() {
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
                        } else if (serviceText.includes('para llevar')) {
                            currentServiceType = 'para-llevar';
                        } else if (serviceText.includes('ordena y espera')) {
                            currentServiceType = 'ordena-y-espera';
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
        
        // Aplicar colores consistentes a cada grupo de ticket
        for (const ticketId in ticketGroups) {
            const group = ticketGroups[ticketId];
            const color = TICKET_COLORS[group.serviceType] || TICKET_COLORS.otro;
            
            // Aplicar color a todas las filas del ticket
            group.rows.forEach((row, index) => {
                // Aplicar color de fondo
                row.style.backgroundColor = color;
                
                // Aplicar estilos adicionales
                if (index === 0) {
                    row.classList.add('ticket-first-row');
                }
                if (index === group.rows.length - 1) {
                    row.classList.add('ticket-last-row');
                    row.style.borderBottom = '2px solid #999';
                }
                
                // Añadir borde izquierdo a todas las filas del ticket
                row.style.borderLeft = '3px solid #999';
            });
        }
    }
    
    // Aplicar la corrección inicialmente
    setTimeout(fixTicketColors, 500);
    
    // Volver a aplicar la corrección cada vez que cambie el DOM
    const observer = new MutationObserver(function(mutations) {
        setTimeout(fixTicketColors, 100);
    });
    
    // Observar cambios en las tablas
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        observer.observe(table, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    });
    
    // También observar el cuerpo del documento para detectar nuevas tablas
    observer.observe(document.body, { 
        childList: true
    });
});
