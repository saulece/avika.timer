// avika-init.js - Script de inicialización para la aplicación Avika
// Este script debe cargarse después de todos los demás scripts de Avika

// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando Avika...");
    
    // Verifica que los objetos Avika existen
    if (!window.Avika) {
        console.error("Error crítico: Objeto Avika no encontrado");
        return;
    }
    
    console.log("Estado de Avika:", {
        ui: !!Avika.ui,
        data: !!Avika.data,
        config: !!Avika.config,
        orders: !!Avika.orders
    });
    
    // Inicializar manualmente botones de categoría
    function initCategoryButtons() {
        console.log("Inicializando botones de categoría...");
        var categoryButtons = document.querySelectorAll('.category-btn');
        console.log("Botones de categoría encontrados:", categoryButtons.length);
        
        if (categoryButtons.length > 0) {
            categoryButtons.forEach(function(button) {
                var category = button.getAttribute('data-category');
                if (category) {
                    console.log("Configurando botón para categoría:", category);
                    // Eliminamos eventos previos para evitar duplicados
                    button.replaceWith(button.cloneNode(true));
                    var newButton = document.querySelector('.category-btn[data-category="' + category + '"]');
                    
                    newButton.addEventListener('click', function(event) {
                        event.preventDefault();
                        console.log("Click en categoría:", category);
                        try {
                            if (Avika.ui && typeof Avika.ui.selectCategory === 'function') {
                                Avika.ui.selectCategory(category);
                            } else {
                                console.error("Función selectCategory no encontrada");
                            }
                        } catch (e) {
                            console.error("Error al seleccionar categoría:", e);
                        }
                    });
                }
            });
        } else {
            console.warn("No se encontraron botones de categoría");
        }
    }
    
    // Inicializar botones de servicio
    function initServiceButtons() {
        console.log("Inicializando botones de servicio...");
        var serviceButtons = [
            { id: 'btn-comedor', service: 'comedor' },
            { id: 'btn-domicilio', service: 'domicilio' },
            { id: 'btn-para-llevar', service: 'para-llevar' }
        ];
        
        serviceButtons.forEach(function(item) {
            var button = document.getElementById(item.id);
            if (button) {
                console.log("Configurando botón para servicio:", item.service);
                button.replaceWith(button.cloneNode(true));
                var newButton = document.getElementById(item.id);
                
                newButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    console.log("Click en servicio:", item.service);
                    try {
                        if (Avika.ui && typeof Avika.ui.selectService === 'function') {
                            Avika.ui.selectService(this, item.service);
                        } else {
                            console.error("Función selectService no encontrada");
                        }
                    } catch (e) {
                        console.error("Error al seleccionar servicio:", e);
                    }
                });
            } else {
                console.warn("Botón de servicio no encontrado:", item.id);
            }
        });
    }
    
    // Inicializar botones de cantidad
    function initQuantityButtons() {
        console.log("Inicializando botones de cantidad...");
        var decreaseBtn = document.getElementById('decrease-quantity');
        var increaseBtn = document.getElementById('increase-quantity');
        
        if (decreaseBtn) {
            decreaseBtn.replaceWith(decreaseBtn.cloneNode(true));
            var newDecreaseBtn = document.getElementById('decrease-quantity');
            
            newDecreaseBtn.addEventListener('click', function(event) {
                event.preventDefault();
                console.log("Disminuyendo cantidad");
                try {
                    if (Avika.ui && typeof Avika.ui.changeQuantity === 'function') {
                        Avika.ui.changeQuantity(-1);
                    } else {
                        console.error("Función changeQuantity no encontrada");
                    }
                } catch (e) {
                    console.error("Error al cambiar cantidad:", e);
                }
            });
        } else {
            console.warn("Botón de disminuir cantidad no encontrado");
        }
        
        if (increaseBtn) {
            increaseBtn.replaceWith(increaseBtn.cloneNode(true));
            var newIncreaseBtn = document.getElementById('increase-quantity');
            
            newIncreaseBtn.addEventListener('click', function(event) {
                event.preventDefault();
                console.log("Aumentando cantidad");
                try {
                    if (Avika.ui && typeof Avika.ui.changeQuantity === 'function') {
                        Avika.ui.changeQuantity(1);
                    } else {
                        console.error("Función changeQuantity no encontrada");
                    }
                } catch (e) {
                    console.error("Error al cambiar cantidad:", e);
                }
            });
        } else {
            console.warn("Botón de aumentar cantidad no encontrado");
        }
    }
    
    // Inicializar botón de enviar pedido
    function initSubmitOrderButton() {
        console.log("Inicializando botón de enviar pedido...");
        var submitButton = document.getElementById('submit-order');
        
        if (submitButton) {
            submitButton.replaceWith(submitButton.cloneNode(true));
            var newSubmitButton = document.getElementById('submit-order');
            
            newSubmitButton.addEventListener('click', function(event) {
                event.preventDefault();
                console.log("Enviando pedido");
                try {
                    // Verificar si la función existe antes de llamarla
                    if (Avika.orders && typeof Avika.orders.submitOrder === 'function') {
                        Avika.orders.submitOrder();
                    } else {
                        console.error("Función submitOrder no encontrada");
                    }
                } catch (e) {
                    console.error("Error al enviar pedido:", e);
                }
            });
        } else {
            console.warn("Botón de enviar pedido no encontrado");
        }
    }
    
    // Inicialización de la aplicación
    function initApp() {
        console.log("Inicializando aplicación...");
        
        // Verificar elementos críticos del DOM
        var criticalElements = [
            'categories-section',
            'dishes-section', 
            'preparation-section',
            'pending-body',
            'completed-body'
        ];
        
        var missingElements = criticalElements.filter(function(id) {
            return !document.getElementById(id);
        });
        
        if (missingElements.length > 0) {
            console.error("Elementos críticos no encontrados:", missingElements);
        } else {
            console.log("Todos los elementos críticos encontrados");
        }
        
        // Inicializar componentes de UI
        initCategoryButtons();
        initServiceButtons();
        initQuantityButtons();
        initSubmitOrderButton();
        
        // Configurar actualizaciones periódicas
        if (Avika.ui && typeof Avika.ui.updateAllTimers === 'function') {
            console.log("Configurando actualizador de temporizadores");
            setInterval(function() {
                try {
                    Avika.ui.updateAllTimers();
                } catch (e) {
                    console.error("Error al actualizar temporizadores:", e);
                }
            }, 1000);
        } else {
            console.warn("Función updateAllTimers no encontrada, no se actualizarán los temporizadores");
        }
        
        console.log("Inicialización completa");
    }
    
    // Iniciar la aplicación
    try {
        initApp();
    } catch (e) {
        console.error("Error fatal durante la inicialización:", e);
    }
});