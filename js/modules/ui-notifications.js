// ui-notifications.js - Sistema centralizado de notificaciones
window.Avika = window.Avika || {};
Avika.ui = Avika.ui || {};

// Función mejorada para mostrar notificaciones con tipos
Avika.ui.showNotification = function(message, type) {
    var notification = Avika.utils.getElement('notification');
    if (!notification) {
        Avika.utils.log.warn('Elemento de notificación no encontrado');
        return;
    }
    
    // Eliminar clases anteriores
    notification.className = '';
    notification.classList.add('notification');
    
    // Añadir clase según el tipo
    type = type || 'info'; // Tipos: 'info', 'success', 'warning', 'error'
    notification.classList.add('notification-' + type);
    
    // Establecer el mensaje
    notification.textContent = message;
    
    // Mostrar con animación
    notification.style.display = 'block';
    notification.style.opacity = '0';
    
    // Animación de entrada
    setTimeout(function() {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Reproducir sonido si está habilitado
    if (Avika.config && Avika.config.notificationSound) {
        Avika.ui.playNotificationSound(type);
    }
    
    // Usar constante definida centralmente o duración personalizada
    var timeout = Avika.utils.TIME_CONSTANTS.NOTIFICATION_TIMEOUT_MS;
    if (Avika.config && Avika.config.notificationDuration) {
        timeout = Avika.config.notificationDuration * 1000;
    }
    
    // Limpiar cualquier temporizador existente para evitar solapamientos
    if (this._notificationTimer) {
        clearTimeout(this._notificationTimer);
    }
    
    // Guardar referencia al temporizador
    this._notificationTimer = setTimeout(function() {
        // Animación de salida
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // Ocultar después de la animación
        setTimeout(function() {
            notification.style.display = 'none';
        }, 300);
    }, timeout);
};

// Función para mostrar notificación con HTML
Avika.ui.showHTMLNotification = function(htmlContent, type, duration) {
    var notification = Avika.utils.getElement('notification');
    if (!notification) {
        Avika.utils.log.warn('Elemento de notificación no encontrado');
        return;
    }
    
    // Eliminar clases anteriores
    notification.className = '';
    notification.classList.add('notification');
    
    // Añadir clase según el tipo
    type = type || 'info'; // Tipos: 'info', 'success', 'warning', 'error'
    notification.classList.add('notification-' + type);
    
    // Establecer el contenido HTML
    notification.innerHTML = htmlContent;
    
    // Mostrar con animación
    notification.style.display = 'block';
    notification.style.opacity = '0';
    
    // Animación de entrada
    setTimeout(function() {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Reproducir sonido si está habilitado
    if (Avika.config && Avika.config.notificationSound) {
        Avika.ui.playNotificationSound(type);
    }
    
    // Usar duración personalizada o constante definida centralmente
    var timeout = duration ? duration * 1000 : Avika.utils.TIME_CONSTANTS.NOTIFICATION_TIMEOUT_MS;
    if (!duration && Avika.config && Avika.config.notificationDuration) {
        timeout = Avika.config.notificationDuration * 1000;
    }
    
    // Limpiar cualquier temporizador existente para evitar solapamientos
    if (this._notificationTimer) {
        clearTimeout(this._notificationTimer);
    }
    
    // Guardar referencia al temporizador
    this._notificationTimer = setTimeout(function() {
        // Animación de salida
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // Ocultar después de la animación
        setTimeout(function() {
            notification.style.display = 'none';
        }, 300);
    }, timeout);
    
    return notification;
};

// Función para reproducir sonido de notificación
Avika.ui.playNotificationSound = function(type) {
    // Verificar si el navegador soporta Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
        return;
    }
    
    // Crear contexto de audio si no existe
    if (!this._audioContext) {
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Crear oscilador
    var oscillator = this._audioContext.createOscillator();
    var gainNode = this._audioContext.createGain();
    
    // Configurar tipo y frecuencia según el tipo de notificación
    switch (type) {
        case 'success':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, this._audioContext.currentTime); // A5
            oscillator.frequency.setValueAtTime(1318.51, this._audioContext.currentTime + 0.1); // E6
            break;
        case 'warning':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(440, this._audioContext.currentTime); // A4
            oscillator.frequency.setValueAtTime(466.16, this._audioContext.currentTime + 0.2); // A#4/Bb4
            break;
        case 'error':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(220, this._audioContext.currentTime); // A3
            oscillator.frequency.setValueAtTime(207.65, this._audioContext.currentTime + 0.2); // G#3/Ab3
            break;
        default: // info
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(659.25, this._audioContext.currentTime); // E5
            oscillator.frequency.setValueAtTime(783.99, this._audioContext.currentTime + 0.1); // G5
            break;
    }
    
    // Configurar volumen
    gainNode.gain.setValueAtTime(0.1, this._audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this._audioContext.currentTime + 0.3);
    
    // Conectar nodos
    oscillator.connect(gainNode);
    gainNode.connect(this._audioContext.destination);
    
    // Reproducir y detener
    oscillator.start();
    oscillator.stop(this._audioContext.currentTime + 0.3);
};

// Mostrar indicador de carga
Avika.ui.showLoading = function() {
    var loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
};

// Ocultar indicador de carga
Avika.ui.hideLoading = function() {
    var loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
};

// Mostrar mensaje de error
Avika.ui.showError = function(message, details) {
    var errorContent = '<div class="error-message">' +
        '<h3>Error</h3>' +
        '<p>' + message + '</p>';
    
    if (details) {
        errorContent += '<div class="error-details">' +
            '<p>Detalles técnicos:</p>' +
            '<pre>' + details + '</pre>' +
            '</div>';
    }
    
    errorContent += '<button id="error-close-btn" class="action-btn">Cerrar</button>' +
        '</div>';
    
    var notification = this.showHTMLNotification(errorContent, 'error', 0); // Sin auto-cierre
    
    // Configurar botón de cierre
    var closeBtn = document.getElementById('error-close-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(function() {
                notification.style.display = 'none';
            }, 300);
        };
    }
};

// Mostrar mensaje de confirmación
Avika.ui.showConfirmation = function(message, callback) {
    var confirmContent = '<div class="confirmation-message">' +
        '<p>' + message + '</p>' +
        '<div class="confirmation-buttons">' +
        '<button id="confirm-yes-btn" class="action-btn">Sí</button>' +
        '<button id="confirm-no-btn" class="action-btn cancel-btn">No</button>' +
        '</div>' +
        '</div>';
    
    var notification = this.showHTMLNotification(confirmContent, 'info', 0); // Sin auto-cierre
    
    // Configurar botones
    var yesBtn = document.getElementById('confirm-yes-btn');
    var noBtn = document.getElementById('confirm-no-btn');
    
    if (yesBtn) {
        yesBtn.onclick = function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(function() {
                notification.style.display = 'none';
                if (typeof callback === 'function') {
                    callback(true);
                }
            }, 300);
        };
    }
    
    if (noBtn) {
        noBtn.onclick = function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(function() {
                notification.style.display = 'none';
                if (typeof callback === 'function') {
                    callback(false);
                }
            }, 300);
        };
    }
};

// Mostrar mensaje de información
Avika.ui.showInfo = function(title, message, duration) {
    var infoContent = '<div class="info-message">' +
        '<h3>' + title + '</h3>' +
        '<p>' + message + '</p>' +
        '<button id="info-close-btn" class="action-btn">Cerrar</button>' +
        '</div>';
    
    var notification = this.showHTMLNotification(infoContent, 'info', duration || 10); // 10 segundos por defecto
    
    // Configurar botón de cierre
    var closeBtn = document.getElementById('info-close-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(function() {
                notification.style.display = 'none';
            }, 300);
        };
    }
};

// Mostrar mensaje de éxito con acción
Avika.ui.showSuccessWithAction = function(message, actionText, actionCallback) {
    var successContent = '<div class="success-message">' +
        '<p>' + message + '</p>';
    
    if (actionText && typeof actionCallback === 'function') {
        successContent += '<button id="success-action-btn" class="action-btn">' + actionText + '</button>';
    }
    
    successContent += '<button id="success-close-btn" class="action-btn">Cerrar</button>' +
        '</div>';
    
    var notification = this.showHTMLNotification(successContent, 'success', 8); // 8 segundos
    
    // Configurar botón de acción
    if (actionText && typeof actionCallback === 'function') {
        var actionBtn = document.getElementById('success-action-btn');
        if (actionBtn) {
            actionBtn.onclick = function() {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(20px)';
                
                setTimeout(function() {
                    notification.style.display = 'none';
                    actionCallback();
                }, 300);
            };
        }
    }
    
    // Configurar botón de cierre
    var closeBtn = document.getElementById('success-close-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(function() {
                notification.style.display = 'none';
            }, 300);
        };
    }
};
