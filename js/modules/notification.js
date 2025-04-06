// js/modules/notification.js - Gestión centralizada de notificaciones
(function() {
    // Crear el espacio de nombres si no existe
    window.Avika = window.Avika || {};
    if (!Avika.ui) Avika.ui = {};
    
    // Función unificada de notificación
    Avika.ui.showNotification = function(message, duration) {
        try {
            console.log("Notificación:", message);
            
            var notification = document.getElementById('notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'notification';
                notification.style.position = 'fixed';
                notification.style.bottom = '20px';
                notification.style.right = '20px';
                notification.style.backgroundColor = '#2ecc71';
                notification.style.color = 'white';
                notification.style.padding = '12px 20px';
                notification.style.borderRadius = '4px';
                notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                notification.style.zIndex = '9999';
                notification.style.transition = 'opacity 0.3s ease';
                document.body.appendChild(notification);
            }
            
            notification.textContent = message;
            notification.style.display = 'block';
            notification.style.opacity = '1';
            
            if (Avika.ui.notificationTimeout) {
                clearTimeout(Avika.ui.notificationTimeout);
            }
            
            Avika.ui.notificationTimeout = setTimeout(function() {
                notification.style.opacity = '0';
                setTimeout(function() {
                    notification.style.display = 'none';
                }, 300);
            }, duration || 3000);
        } catch (e) {
            console.error("Error al mostrar notificación:", e);
        }
    };
    
    // Función unificada de error
    Avika.ui.showErrorMessage = function(message) {
        try {
            console.error("Error:", message);
            
            var errorContainer = document.getElementById('error-message');
            if (!errorContainer) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'error-message';
                errorContainer.style.position = 'fixed';
                errorContainer.style.top = '50%';
                errorContainer.style.left = '50%';
                errorContainer.style.transform = 'translate(-50%, -50%)';
                errorContainer.style.backgroundColor = '#e74c3c';
                errorContainer.style.color = 'white';
                errorContainer.style.padding = '15px 20px';
                errorContainer.style.borderRadius = '5px';
                errorContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                errorContainer.style.zIndex = '9999';
                errorContainer.style.maxWidth = '80%';
                errorContainer.style.textAlign = 'center';
                document.body.appendChild(errorContainer);
            }
            
            errorContainer.innerHTML = '<span id="close-error" style="position:absolute;right:10px;top:10px;cursor:pointer;font-weight:bold;">&times;</span>' +
                                   '<p style="margin:0;">' + message + '</p>';
            
            errorContainer.style.display = 'block';
            
            var closeBtn = document.getElementById('close-error');
            if (closeBtn) {
                closeBtn.onclick = function() {
                    errorContainer.style.display = 'none';
                };
            }
            
            setTimeout(function() {
                if (errorContainer.style.display !== 'none') {
                    errorContainer.style.display = 'none';
                }
            }, 10000);
        } catch (e) {
            console.error("Error al mostrar mensaje de error:", e);
            alert("Error: " + message);
        }
    };
    
    // Registrar este módulo
    if (typeof Avika.registerModule === 'function') {
        Avika.registerModule('notification');
    }
    
    console.log("Módulo de notificaciones inicializado");
})();
