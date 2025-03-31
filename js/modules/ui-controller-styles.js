// ui-controller-styles.js - Estilos y configuración visual para la aplicación Avika

// Función para inicializar estilos
Avika.styles = {
    // Inicializar todos los estilos necesarios
    init: function() {
        this.addDeliveryStyles();
    },
    
    // Función para agregar estilos para botones de entrega y elementos de UI
    addDeliveryStyles: function() {
        if (document.getElementById('delivery-styles')) return;
        
        var styleElement = document.createElement('style');
        styleElement.id = 'delivery-styles';
        styleElement.textContent = `
.finish-btn.delivery {
    background-color: #f39c12;
}
.finish-btn.delivery-arrived {
    background-color: #3498db;
}

/* Estilos para subcategorías */
.subcategories-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
    padding: 10px;
    background-color: var(--highlight-bg);
    border-radius: 8px;
}

.subcategory-btn {
    background-color: var(--container-bg);
    color: var(--text-color);
    border: 1px solid var(--primary-btn);
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.subcategory-btn:hover {
    background-color: var(--primary-btn);
    color: white;
}

.subcategory-btn.active {
    background-color: var(--primary-btn);
    color: white;
    font-weight: bold;
}

/* Contenedor para los botones de platillos */
.dishes-buttons-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
}

/* Ajustes para el encabezado de acción en la tabla */
.pending-orders-section th:nth-child(5),
.pending-orders-section td.action-cell {
    background-color: var(--container-bg);
    position: sticky;
    right: 0;
    z-index: 2;
}

.pending-orders-section th:nth-child(5) {
    background-color: var(--table-header-bg);
    color: var(--table-header-text);
    z-index: 3;
}

/* Estilos específicos para móviles */
@media (max-width: 768px) {
    .subcategories-container {
        padding: 8px;
        margin-bottom: 10px;
        overflow-x: auto;
        white-space: nowrap;
        display: block;
    }
    
    .subcategory-btn {
        display: inline-block;
        margin-right: 5px;
        margin-bottom: 5px;
    }
    
    .search-input {
        padding: 8px 12px;
        font-size: 14px;
    }
    
    /* Estilos para el modal de promedios */
    .stats-modal {
        padding: 10px;
        width: 95%;
        max-width: 350px;
        overflow: auto;
    }
    
    .stats-modal table {
        font-size: 14px;
        width: 100%;
        table-layout: fixed;
    }
    
    .stats-modal th {
        padding: 6px 4px;
    }
    
    .stats-modal td {
        padding: 6px 4px;
        text-align: center;
    }
    
    /* Estilos para mejorar la visualización en iPhone */
    @media screen and (max-width: 390px) {
        .pending-orders-section th:nth-child(3),
        .pending-orders-section td:nth-child(3) {
            width: 10%; /* Reducir aún más el ancho de la columna de tiempo */
        }
        
        .pending-orders-section th:nth-child(5),
        .pending-orders-section td.action-cell {
            position: sticky;
            right: 0;
            z-index: 2;
        }
        
        .pending-orders-section th:nth-child(5) {
            z-index: 3;
        }
        
        /* Hacer más visible el encabezado de Acción */
        .pending-orders-section th:nth-child(5) {
            background-color: var(--table-header-bg) !important;
            color: var(--table-header-text) !important;
            font-weight: bold;
            border-left: 2px solid var(--border-color);
        }
        
        .pending-orders-section td.action-cell {
            background-color: var(--container-bg);
            border-left: 2px solid var(--border-color);
        }
    }
}`;
        
        document.head.appendChild(styleElement);
    }
};

// Inicializar estilos cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que existe Avika.styles antes de inicializar
    if (Avika && Avika.styles) {
        Avika.styles.init();
    } else {
        console.error('Error: Avika.styles no está definido');
    }
});