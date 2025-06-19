// Script para aplicar estilos consistentes a los tickets
document.addEventListener('DOMContentLoaded', function() {
    // Función para aplicar estilos consistentes a los tickets
    function applyConsistentTicketStyles() {
        // Buscar todas las filas que pertenecen a tickets
        const ticketRows = document.querySelectorAll('.ticket-first-row, .ticket-last-row');
        
        // Recorrer todas las filas y aplicar estilos consistentes
        ticketRows.forEach(function(row) {
            // Obtener el tipo de servicio desde el atributo data
            const serviceTypeAttr = row.getAttribute('data-service-type');
            const serviceType = serviceTypeAttr ? serviceTypeAttr.toLowerCase() : '';

            // Definir la clase a aplicar
            let serviceClass = '';
            if (serviceType === 'comedor') {
                serviceClass = 'ticket-comedor';
            } else if (serviceType === 'domicilio') {
                serviceClass = 'ticket-domicilio';
            } else if (serviceType === 'ordena y espera') {
                serviceClass = 'ticket-para-llevar'; // Reutilizamos la clase para el color verde
            } else {
                serviceClass = 'ticket-otro';
            }

            // Aplicar la clase a la fila actual
            if (serviceClass) {
                row.classList.add(serviceClass);
            }
            
            // Asegurarse de que todas las filas del ticket tengan la clase ticket-row
            row.classList.add('ticket-row');
            
            // Si hay filas hermanas (del mismo ticket), aplicar los mismos estilos
            let sibling = row.nextElementSibling;
            while (sibling && !sibling.classList.contains('ticket-first-row')) {
                // Aplicar la misma clase de servicio que la fila principal
                if (serviceClass) {
                    sibling.classList.add(serviceClass);
                }
                
                // Asegurarse de que todas las filas del ticket tengan la clase ticket-row
                sibling.classList.add('ticket-row');
                
                // Pasar a la siguiente fila
                sibling = sibling.nextElementSibling;
                
                // Si llegamos a la última fila o a otra primera fila, terminar
                if (!sibling || sibling.classList.contains('ticket-first-row')) {
                    break;
                }
            }
        });
    }
    
    // Aplicar estilos al cargar la página
    applyConsistentTicketStyles();
    
    // Volver a aplicar estilos cuando se actualice el DOM
    const observer = new MutationObserver(function(mutations) {
        applyConsistentTicketStyles();
    });
    
    // Observar cambios en el cuerpo del documento
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
    
    // Sobrescribir las funciones originales de aplicación de estilos
    // Esta parte se ejecutará después de que se carguen los scripts originales
    window.addEventListener('load', function() {
        if (Avika && Avika.ui) {
            // Guardar referencia a las funciones originales
            const originalUpdatePendingTable = Avika.ui.updatePendingTable;
            const originalUpdateDeliveryTable = Avika.ui.updateDeliveryTable;
            const originalUpdateCompletedTable = Avika.ui.updateCompletedTable;
            
            // Sobrescribir la función updatePendingTable
            Avika.ui.updatePendingTable = function() {
                // Llamar a la función original
                originalUpdatePendingTable.apply(this, arguments);
                
                // Aplicar estilos consistentes
                setTimeout(applyConsistentTicketStyles, 0);
            };
            
            // Sobrescribir la función updateDeliveryTable
            Avika.ui.updateDeliveryTable = function() {
                // Llamar a la función original
                originalUpdateDeliveryTable.apply(this, arguments);
                
                // Aplicar estilos consistentes
                setTimeout(applyConsistentTicketStyles, 0);
            };
            
            // Sobrescribir la función updateCompletedTable
            Avika.ui.updateCompletedTable = function(showAll) {
                // Llamar a la función original
                originalUpdateCompletedTable.call(this, showAll);
                
                // Aplicar estilos consistentes
                setTimeout(applyConsistentTicketStyles, 0);
            };
        }
    });
});
