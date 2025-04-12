// Script para optimizar la experiencia en dispositivos móviles
document.addEventListener('DOMContentLoaded', function() {
    // Detectar si es un dispositivo móvil
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
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
});
