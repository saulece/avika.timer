// Script para optimizar la experiencia en dispositivos móviles
window.Avika = window.Avika || {};
Avika.mobile = {
    initializeMobileOptimizations: function() {
        // Detectar si es un dispositivo móvil
        const isMobile = window.innerWidth <= 768;
        
        // Función para asegurar contraste de texto
        function ensureTextContrast() {
            // Asegurar contraste en encabezados de tabla
            document.querySelectorAll('th').forEach(function(th) {
                th.style.backgroundColor = '#2980b9';
                th.style.color = '#ffffff';
                th.style.fontWeight = 'bold';
                th.style.textShadow = '0px 1px 1px rgba(0,0,0,0.3)';
            });
            
            // Asegurar contraste en celdas
            document.querySelectorAll('td').forEach(function(td) {
                td.style.color = '#333333';
            });
            
            // Asegurar contraste en nombres de platillos
            document.querySelectorAll('.dish-name').forEach(function(el) {
                el.style.color = '#222222';
            });
            
            // Asegurar contraste en IDs de tickets
            document.querySelectorAll('.ticket-id').forEach(function(el) {
                el.style.color = '#2980b9';
            });
            
            // Asegurar contraste en botones
            document.querySelectorAll('.action-btn').forEach(function(btn) {
                btn.style.color = '#ffffff';
                btn.style.fontWeight = '600';
                btn.style.textShadow = '0px 1px 1px rgba(0,0,0,0.2)';
            });
            
            // Asegurar contraste en botones de filtro
            document.querySelectorAll('.filter-btn').forEach(function(btn) {
                btn.style.color = '#333333';
                btn.style.backgroundColor = '#f0f0f0';
                btn.style.border = '1px solid #cccccc';
            });
        }
        
        if (isMobile) {
            // Aplicar mejoras de contraste
            ensureTextContrast();
            
            // Volver a aplicar después de cargar completamente
            window.addEventListener('load', ensureTextContrast);
            
            // Volver a aplicar cuando se actualice el DOM (para elementos dinámicos)
            const observer = new MutationObserver(function(mutations) {
                ensureTextContrast();
            });
            
            observer.observe(document.body, { childList: true, subtree: true });
            
            // Añadir clase para identificar que estamos en móvil
            document.body.classList.add('mobile-device');
            
            // Optimizar para iOS (iPhone/iPad)
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                document.body.classList.add('ios-device');
                
                // Prevenir zoom al tocar inputs en iOS
                document.addEventListener('touchstart', function(e) {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                        e.target.style.fontSize = '16px';
                    }
                }, false);
                
                // Mejorar la experiencia de desplazamiento
                document.querySelectorAll('table').forEach(function(table) {
                    table.style.webkitOverflowScrolling = 'touch';
                });
            }
            
            // Mejorar la visualización de las tablas en móviles
            const tables = document.querySelectorAll('table');
            tables.forEach(function(table) {
                // Añadir clase para optimización móvil si no la tiene
                if (!table.classList.contains('mobile-optimized-table')) {
                    table.classList.add('mobile-optimized-table');
                }
                
                // Añadir clase mobile-hide-sm a columnas que deben ocultarse en móviles
                const headerCells = table.querySelectorAll('thead th');
                if (headerCells.length > 3) {
                    // Ocultar columnas menos importantes en móviles muy pequeños
                    if (window.innerWidth <= 480) {
                        // Mantener visible: Platillo, Tiempo y Acción
                        for (let i = 0; i < headerCells.length; i++) {
                            // Si no es la primera (platillo), tercera (tiempo) o última (acción) columna
                            if (i !== 0 && i !== 2 && i !== headerCells.length - 1) {
                                if (!headerCells[i].classList.contains('mobile-hide-sm')) {
                                    headerCells[i].classList.add('mobile-hide-sm');
                                }
                            }
                        }
                    }
                }
            });
            
            // Mejorar la experiencia de los botones en móviles
            document.querySelectorAll('.action-btn').forEach(function(btn) {
                btn.addEventListener('touchstart', function() {
                    this.style.transform = 'scale(0.98)';
                });
                
                btn.addEventListener('touchend', function() {
                    this.style.transform = 'scale(1)';
                });
            });
        }
    }
};
