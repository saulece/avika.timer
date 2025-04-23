// Script para corregir problemas visuales en la información de platillos
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que la aplicación esté completamente cargada
    setTimeout(function() {
        applyVisualFixes();
        
        // Observar cambios en el DOM para aplicar correcciones cuando se actualice la tabla
        const observer = new MutationObserver(function(mutations) {
            setTimeout(applyVisualFixes, 100);
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
    }, 800);
    
    // Función principal para aplicar correcciones visuales
    function applyVisualFixes() {
        // 1. Corregir la visualización de la información de los platillos
        fixDishInformation();
        
        // 2. Eliminar recuadros cambiantes de colores no deseados
        fixTicketColors();
    }
    
    // Corregir la visualización de la información de los platillos
    function fixDishInformation() {
        // Mejorar la visualización de la información en las celdas de platillos
        const dishCells = document.querySelectorAll('.dish-cell');
        dishCells.forEach(cell => {
            // Crear un contenedor estructurado para la información
            if (!cell.querySelector('.dish-info-container')) {
                // Crear contenedor principal
                const container = document.createElement('div');
                container.className = 'dish-info-container';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = '4px';
                
                // Mover todos los elementos al contenedor
                while (cell.firstChild) {
                    // Conservar el elemento ticket-label fuera del contenedor si existe
                    if (cell.firstChild.className === 'ticket-label') {
                        const ticketLabel = cell.firstChild;
                        cell.removeChild(ticketLabel);
                        cell.appendChild(ticketLabel);
                        continue;
                    }
                    container.appendChild(cell.firstChild);
                }
                
                cell.appendChild(container);
            }
            
            // Mejorar el estilo del nombre del platillo
            const dishName = cell.querySelector('.dish-name');
            if (dishName) {
                dishName.style.fontWeight = 'bold';
                dishName.style.fontSize = '1.05em';
                dishName.style.color = '#333';
                dishName.style.padding = '2px 0';
            }
            
            // Mejorar el estilo de la categoría
            const category = cell.querySelector('.dish-category');
            if (category) {
                category.style.fontSize = '0.85em';
                category.style.color = '#666';
                category.style.padding = '1px 0';
                category.style.fontStyle = 'italic';
            }
            
            // Mejorar el estilo del ID del ticket
            const ticketId = cell.querySelector('.ticket-id');
            if (ticketId) {
                ticketId.style.fontSize = '0.85em';
                ticketId.style.color = '#555';
                ticketId.style.fontWeight = 'bold';
                ticketId.style.padding = '1px 0';
            }
        });
        
        // Mejorar la visualización de la información en las celdas de detalles
        const detailsCells = document.querySelectorAll('.details-container');
        detailsCells.forEach(cell => {
            // Crear un contenedor estructurado para la información
            if (!cell.querySelector('.details-info-container')) {
                // Crear contenedor principal
                const container = document.createElement('div');
                container.className = 'details-info-container';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = '4px';
                
                // Mover todos los elementos al contenedor
                while (cell.firstChild) {
                    container.appendChild(cell.firstChild);
                }
                
                cell.appendChild(container);
            }
            
            // Mejorar el estilo del tipo de servicio
            const serviceType = cell.querySelector('.service-type');
            if (serviceType) {
                serviceType.style.fontWeight = 'bold';
                serviceType.style.fontSize = '0.95em';
                serviceType.style.color = '#444';
                serviceType.style.padding = '2px 0';
            }
            
            // Mejorar el estilo de las personalizaciones
            const customization = cell.querySelector('.dish-customization');
            if (customization) {
                customization.style.fontSize = '0.85em';
                customization.style.color = '#555';
                customization.style.padding = '1px 0';
            }
            
            // Mejorar el estilo de las notas
            const notes = cell.querySelector('.order-notes');
            if (notes) {
                notes.style.fontSize = '0.85em';
                notes.style.fontStyle = 'italic';
                notes.style.color = '#666';
                notes.style.padding = '1px 0';
                notes.style.borderLeft = '2px solid #ddd';
                notes.style.paddingLeft = '4px';
                notes.style.marginTop = '2px';
            }
        });
    }
    
    // Corregir los colores de los tickets para evitar cambios no deseados
    function fixTicketColors() {
        // Colores consistentes para cada tipo de servicio
        const TICKET_COLORS = {
            'comedor': '#e6f2ff',      // Azul claro para comedor
            'domicilio': '#ffe6e6',    // Rojo claro para domicilio
            'para-llevar': '#e6ffe6',  // Verde claro para llevar
            'ordena-y-espera': '#fff9e6', // Amarillo claro para ordena y espera
            'otro': '#f5f5f5'          // Gris claro para otros
        };
        
        // Buscar todas las filas de tickets
        const rows = document.querySelectorAll('tr');
        
        // Procesar cada fila
        rows.forEach(row => {
            // Verificar si es una fila de ticket (tiene borde izquierdo)
            if (row.style.borderLeft && row.style.borderLeft.includes('solid')) {
                // Determinar el tipo de servicio
                let serviceType = 'otro';
                const serviceTypeElement = row.querySelector('.service-type');
                
                if (serviceTypeElement) {
                    const serviceText = serviceTypeElement.textContent.toLowerCase();
                    if (serviceText.includes('comedor')) {
                        serviceType = 'comedor';
                    } else if (serviceText.includes('domicilio')) {
                        serviceType = 'domicilio';
                    } else if (serviceText.includes('para llevar') || serviceText.includes('ordena y espera')) {
                        serviceType = 'para-llevar';
                    }
                }
                
                // Aplicar color consistente
                const color = TICKET_COLORS[serviceType];
                
                // Fijar el color para evitar cambios
                if (!row.hasAttribute('data-fixed-color')) {
                    row.style.backgroundColor = color;
                    row.setAttribute('data-fixed-color', 'true');
                    
                    // Añadir un estilo inline con !important para prevenir cambios
                    row.style.setProperty('background-color', color, 'important');
                }
            }
        });
    }
});

// Agregar estilos CSS adicionales para mejorar la visualización
(function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Mejorar la visualización de las tablas */
        .mobile-optimized-table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            margin-bottom: 15px;
        }
        
        /* Mejorar la visualización de las celdas */
        .mobile-optimized-table td {
            border: 1px solid #e0e0e0;
            vertical-align: top;
            padding: 8px;
            transition: none !important;
        }
        
        /* Evitar transiciones que puedan causar parpadeos */
        .mobile-optimized-table tr, 
        .mobile-optimized-table td, 
        .mobile-optimized-table th {
            transition: none !important;
        }
        
        /* Mejorar la visualización de los tickets */
        .ticket-first-row {
            border-top: 2px solid #999 !important;
        }
        
        .ticket-last-row {
            border-bottom: 2px solid #999 !important;
        }
        
        /* Mejorar la visualización de la información de platillos */
        .dish-name {
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .dish-category, .dish-customization {
            font-size: 0.85em;
            color: #666;
            margin-bottom: 2px;
        }
        
        .order-notes {
            font-size: 0.85em;
            font-style: italic;
            color: #777;
            border-left: 2px solid #ddd;
            padding-left: 4px;
            margin-top: 2px;
        }
        
        /* Mejorar la visualización en móviles */
        @media screen and (max-width: 768px) {
            .dish-info-container, .details-info-container {
                padding: 2px 0;
            }
            
            .mobile-optimized-table td {
                padding: 6px;
            }
        }
    `;
    document.head.appendChild(style);
})();
