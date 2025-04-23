/**
 * Tailwind Helper - Utilidades para aplicar clases de Tailwind a elementos dinámicos
 * Este script complementa la UI de Avika con clases de Tailwind sin modificar la lógica principal
 */

const TailwindHelper = {
    // Aplica clases Tailwind a elementos generados dinámicamente
    init: function() {
        // Observar cambios en el DOM para aplicar estilos a elementos nuevos
        this.setupMutationObserver();
        
        // Aplicar estilos iniciales
        this.applyStyles();
        
        // Mejorar notificaciones
        this.enhanceNotifications();
        
        console.log('Tailwind Helper inicializado');
    },
    
    // Observa cambios en el DOM para aplicar estilos a nuevos elementos
    setupMutationObserver: function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    this.applyStyles();
                }
            });
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    },
    
    // Aplica estilos Tailwind a elementos específicos
    applyStyles: function() {
        // Mejorar filas de tablas
        this.enhanceTableRows();
        
        // Mejorar botones de acción en filas
        this.enhanceActionButtons();
        
        // Mejorar platillos en la sección de selección
        this.enhanceDishItems();
    },
    
    // Mejora las filas de las tablas con clases de Tailwind
    enhanceTableRows: function() {
        // Mejorar filas de órdenes pendientes
        const pendingRows = document.querySelectorAll('#pending-body tr');
        pendingRows.forEach(row => {
            if (!row.classList.contains('tw-enhanced')) {
                row.classList.add('hover:bg-blue-50', 'transition-colors', 'tw-enhanced');
                
                // Añadir clases a las celdas
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.classList.add('border-t', 'border-gray-200', 'p-2');
                });
            }
        });
        
        // Mejorar filas de órdenes en reparto
        const deliveryRows = document.querySelectorAll('#delivery-body tr');
        deliveryRows.forEach(row => {
            if (!row.classList.contains('tw-enhanced')) {
                row.classList.add('hover:bg-orange-50', 'transition-colors', 'tw-enhanced');
                
                // Añadir clases a las celdas
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.classList.add('border-t', 'border-gray-200', 'p-2');
                });
            }
        });
        
        // Mejorar filas de órdenes completadas
        const completedRows = document.querySelectorAll('#completed-body tr');
        completedRows.forEach(row => {
            if (!row.classList.contains('tw-enhanced')) {
                row.classList.add('hover:bg-green-50', 'transition-colors', 'tw-enhanced');
                
                // Añadir clases a las celdas
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.classList.add('border-t', 'border-gray-200', 'p-2');
                });
            }
        });
    },
    
    // Mejora los botones de acción en las filas
    enhanceActionButtons: function() {
        // Botones de completar preparación
        const completeButtons = document.querySelectorAll('.btn-complete');
        completeButtons.forEach(button => {
            if (!button.classList.contains('tw-enhanced')) {
                button.classList.add(
                    'bg-green-600', 
                    'hover:bg-green-700', 
                    'text-white', 
                    'px-3', 
                    'py-1', 
                    'rounded-md', 
                    'text-sm',
                    'tw-enhanced'
                );
            }
        });
        
        // Botones de marcar salida a reparto
        const deliveryButtons = document.querySelectorAll('.btn-delivery');
        deliveryButtons.forEach(button => {
            if (!button.classList.contains('tw-enhanced')) {
                button.classList.add(
                    'bg-orange-500', 
                    'hover:bg-orange-600', 
                    'text-white', 
                    'px-3', 
                    'py-1', 
                    'rounded-md', 
                    'text-sm',
                    'tw-enhanced'
                );
            }
        });
        
        // Botones de completar entrega
        const finishButtons = document.querySelectorAll('.btn-finish-delivery');
        finishButtons.forEach(button => {
            if (!button.classList.contains('tw-enhanced')) {
                button.classList.add(
                    'bg-green-600', 
                    'hover:bg-green-700', 
                    'text-white', 
                    'px-3', 
                    'py-1', 
                    'rounded-md', 
                    'text-sm',
                    'tw-enhanced'
                );
            }
        });
    },
    
    // Mejora los elementos de platillos en la sección de selección
    enhanceDishItems: function() {
        const dishItems = document.querySelectorAll('.dish-item');
        dishItems.forEach(item => {
            if (!item.classList.contains('tw-enhanced')) {
                item.classList.add(
                    'bg-white', 
                    'rounded-lg', 
                    'shadow-md', 
                    'p-4', 
                    'hover:shadow-lg', 
                    'transition-shadow',
                    'tw-enhanced'
                );
                
                // Mejorar el título del platillo
                const title = item.querySelector('.dish-title');
                if (title) {
                    title.classList.add('font-bold', 'text-gray-800', 'mb-2');
                }
            }
        });
    },
    
    // Mejora las notificaciones
    enhanceNotifications: function() {
        // Sobrescribir la función de mostrar notificación si existe
        if (window.showNotification) {
            const originalShowNotification = window.showNotification;
            
            window.showNotification = function(message, type = 'info') {
                // Llamar a la función original
                originalShowNotification(message, type);
                
                // Mejorar el estilo de la notificación
                const notification = document.getElementById('notification');
                if (notification) {
                    // Eliminar clases anteriores
                    notification.className = '';
                    
                    // Añadir clases base
                    notification.classList.add(
                        'fixed', 
                        'top-4', 
                        'right-4', 
                        'p-4', 
                        'rounded-md', 
                        'shadow-lg', 
                        'max-w-md', 
                        'z-50',
                        'animate-fadeIn'
                    );
                    
                    // Añadir clases según el tipo
                    switch (type) {
                        case 'success':
                            notification.classList.add('bg-green-600', 'text-white');
                            break;
                        case 'error':
                            notification.classList.add('bg-red-600', 'text-white');
                            break;
                        case 'warning':
                            notification.classList.add('bg-orange-500', 'text-white');
                            break;
                        default:
                            notification.classList.add('bg-blue-600', 'text-white');
                    }
                }
            };
        }
    },
    
    // Aplica clases de Tailwind a elementos con tiempos de preparación
    updateTimerClasses: function() {
        // Actualizar clases de tiempo en órdenes pendientes
        const timeElements = document.querySelectorAll('.time-display');
        timeElements.forEach(element => {
            const timeValue = parseInt(element.getAttribute('data-time') || '0');
            
            // Eliminar clases de color anteriores
            element.classList.remove(
                'text-green-600', 'text-yellow-600', 
                'text-orange-600', 'text-red-600'
            );
            
            // Aplicar clase según el tiempo transcurrido
            if (timeValue < 5) {
                element.classList.add('text-green-600');
            } else if (timeValue < 10) {
                element.classList.add('text-yellow-600');
            } else if (timeValue < 15) {
                element.classList.add('text-orange-600');
            } else {
                element.classList.add('text-red-600', 'font-bold');
            }
        });
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    TailwindHelper.init();
    
    // Actualizar clases de tiempo cada segundo
    setInterval(function() {
        TailwindHelper.updateTimerClasses();
    }, 1000);
});
