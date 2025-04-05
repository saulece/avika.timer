// fix.js - Arreglo rápido para errores
document.addEventListener('DOMContentLoaded', function() {
    // Asegurarnos que objetos base existan
    if (!window.Avika) window.Avika = {};
    if (!Avika.ui) Avika.ui = {};
    if (!Avika.data) Avika.data = { pendingOrders: [], completedOrders: [] };
    
    // Funciones básicas de formato
    Avika.ui.padZero = function(num) {
        return (num < 10 ? '0' : '') + num;
    };
    
    Avika.ui.formatTime = function(date) {
        if (!date) return '--:--:--';
        try {
            var d = new Date(date);
            return Avika.ui.padZero(d.getHours()) + ':' + 
                   Avika.ui.padZero(d.getMinutes()) + ':' + 
                   Avika.ui.padZero(d.getSeconds());
        } catch (e) {
            return '--:--:--';
        }
    };
    
    Avika.ui.calculateElapsedTime = function(startTime) {
        try {
            var start = new Date(startTime);
            var now = new Date();
            var elapsed = Math.floor((now - start) / 1000);
            
            var minutes = Math.floor(elapsed / 60);
            var seconds = elapsed % 60;
            
            return Avika.ui.padZero(minutes) + ':' + Avika.ui.padZero(seconds);
        } catch (e) {
            return '--:--';
        }
    };
    
    // Arreglar botones de categoría
    document.querySelectorAll('.category-btn').forEach(function(btn) {
        btn.onclick = function() {
            var category = this.getAttribute('data-category');
            console.log("Categoría:", category);
            alert("Categoría seleccionada: " + category);
        };
    });
});