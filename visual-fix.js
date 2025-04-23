// Script para corregir problemas visuales en la información de platillos
document.addEventListener('DOMContentLoaded', function() {
    console.log("Visual fix script loaded");
    
    // Aplicar las correcciones visuales después de que la aplicación esté completamente cargada
    setTimeout(function() {
        try {
            console.log("Applying visual fixes");
            // Aplicar estilos CSS solamente, sin manipular el DOM
            applyVisualStyles();
        } catch (error) {
            console.error("Error applying visual fixes:", error);
        }
    }, 1500);
    
    // Función para aplicar estilos CSS sin manipular el DOM
    function applyVisualStyles() {
        // Crear un elemento de estilo para aplicar las correcciones visuales
        const styleElement = document.createElement('style');
        styleElement.textContent = `
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
                font-size: 1.05em;
                color: #333;
                padding: 2px 0;
            }
            
            .dish-category {
                font-size: 0.85em;
                color: #666;
                margin-bottom: 2px;
                font-style: italic;
            }
            
            .ticket-id {
                font-size: 0.85em;
                color: #555;
                font-weight: bold;
                margin-bottom: 2px;
            }
            
            .service-type {
                font-weight: bold;
                font-size: 0.95em;
                color: #444;
                margin-bottom: 2px;
            }
            
            .dish-customization {
                font-size: 0.85em;
                color: #555;
                margin-bottom: 2px;
            }
            
            .order-notes {
                font-size: 0.85em;
                font-style: italic;
                color: #666;
                border-left: 2px solid #ddd;
                padding-left: 4px;
                margin-top: 2px;
            }
            
            /* Colores consistentes para tickets */
            tr.ticket-comedor {
                background-color: #e6f2ff !important;
            }
            
            tr.ticket-domicilio {
                background-color: #ffe6e6 !important;
            }
            
            tr.ticket-para-llevar {
                background-color: #e6ffe6 !important;
            }
            
            /* Mejorar la visualización en móviles */
            @media screen and (max-width: 768px) {
                .mobile-optimized-table td {
                    padding: 6px;
                }
            }
        `;
        document.head.appendChild(styleElement);
        
        console.log("Visual styles applied successfully");
    }
});
