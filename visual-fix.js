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
        // 1. Corregir estilos de celdas y distribución de información
        fixCellStyles();
        
        // 2. Eliminar recuadros cambiantes de colores no deseados
        removeUnwantedColorChanges();
        
        // 3. Mejorar la distribución de información
        improveInformationLayout();
    }
    
    // Corregir estilos de celdas para una mejor visualización
    function fixCellStyles() {
        // Aplicar estilos a todas las celdas de información de platillos
        const dishCells = document.querySelectorAll('.dish-cell');
        dishCells.forEach(cell => {
            // Asegurar que el padding sea consistente
            cell.style.padding = '8px';
            
            // Mejorar la visualización del nombre del platillo
            const dishName = cell.querySelector('.dish-name');
            if (dishName) {
                dishName.style.fontWeight = 'bold';
                dishName.style.marginBottom = '4px';
            }
            
            // Mejorar la visualización de la categoría
            const category = cell.querySelector('.dish-category');
            if (category) {
                category.style.fontSize = '0.85em';
                category.style.color = '#666';
                category.style.marginBottom = '2px';
            }
        });
        
        // Mejorar la visualización de los detalles
        const detailsCells = document.querySelectorAll('.details-container');
        detailsCells.forEach(cell => {
            cell.style.padding = '8px';
            
            // Mejorar la visualización del tipo de servicio
            const serviceType = cell.querySelector('.service-type');
            if (serviceType) {
                serviceType.style.fontWeight = 'bold';
                serviceType.style.marginBottom = '4px';
            }
            
            // Mejorar la visualización de las personalizaciones
            const customization = cell.querySelector('.dish-customization');
            if (customization) {
                customization.style.fontSize = '0.85em';
                customization.style.color = '#555';
                customization.style.marginBottom = '2px';
            }
            
            // Mejorar la visualización de las notas
            const notes = cell.querySelector('.order-notes');
            if (notes) {
                notes.style.fontSize = '0.85em';
                notes.style.fontStyle = 'italic';
                notes.style.color = '#777';
            }
        });
    }
    
    // Eliminar recuadros cambiantes de colores no deseados
    function removeUnwantedColorChanges() {
        // Establecer colores consistentes para los tickets
        const rows = document.querySelectorAll('tr');
        
        rows.forEach(row => {
            // Verificar si es una fila de ticket (tiene borde izquierdo)
            if (row.style.borderLeft && row.style.borderLeft.includes('solid')) {
                // Asegurar que el color de fondo sea consistente y no cambie
                const currentBg = row.style.backgroundColor;
                
                if (currentBg) {
                    // Fijar el color para evitar cambios
                    row.setAttribute('data-fixed-bg', currentBg);
                    
                    // Prevenir cambios de color con !important
                    if (!row.hasAttribute('data-fixed-style')) {
                        const style = document.createElement('style');
                        const rowId = 'row-' + Math.random().toString(36).substr(2, 9);
                        row.id = rowId;
                        style.textContent = `#${rowId} { background-color: ${currentBg} !important; }`;
                        document.head.appendChild(style);
                        row.setAttribute('data-fixed-style', 'true');
                    }
                }
            }
        });
    }
    
    // Mejorar la distribución de información
    function improveInformationLayout() {
        // Mejorar la distribución en celdas de detalles
        const detailsCells = document.querySelectorAll('.details-container');
        detailsCells.forEach(cell => {
            // Crear un contenedor para organizar mejor la información
            if (!cell.querySelector('.details-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'details-wrapper';
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.gap = '4px';
                
                // Mover todos los elementos al wrapper
                while (cell.firstChild) {
                    wrapper.appendChild(cell.firstChild);
                }
                
                cell.appendChild(wrapper);
            }
        });
        
        // Mejorar la distribución en celdas de platillos
        const dishCells = document.querySelectorAll('.dish-cell');
        dishCells.forEach(cell => {
            // Crear un contenedor para organizar mejor la información
            if (!cell.querySelector('.dish-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'dish-wrapper';
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.gap = '4px';
                
                // Mover todos los elementos al wrapper
                while (cell.firstChild) {
                    wrapper.appendChild(cell.firstChild);
                }
                
                cell.appendChild(wrapper);
            }
        });
        
        // Mejorar la visualización de los botones de acción
        const actionButtons = document.querySelectorAll('.kitchen-btn, .action-btn');
        actionButtons.forEach(button => {
            button.style.margin = '2px 0';
            button.style.padding = '6px 8px';
            button.style.width = '100%';
            button.style.textAlign = 'center';
            button.style.borderRadius = '4px';
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
            margin-bottom: 4px;
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
        }
        
        /* Mejorar la visualización en móviles */
        @media screen and (max-width: 768px) {
            .dish-wrapper, .details-wrapper {
                padding: 4px 0;
            }
            
            .mobile-optimized-table td {
                padding: 8px 6px;
            }
            
            .kitchen-btn, .action-btn {
                padding: 8px 6px !important;
                font-size: 0.9em !important;
            }
        }
    `;
    document.head.appendChild(style);
})();
