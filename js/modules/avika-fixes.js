// avika-fixes.js
(function() {
    console.log("Aplicando correcciones a Avika...");
    
    // Esperar a que el DOM esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
        // 1. Corregir botones de categoría
        var categoryButtons = document.querySelectorAll('.category-btn[data-category]');
        console.log("Encontrados " + categoryButtons.length + " botones de categoría");
        
        categoryButtons.forEach(function(btn) {
            // Eliminar eventos anteriores
            var btnClone = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(btnClone, btn);
            }
            
            // Asignar nuevo evento
            var category = btnClone.getAttribute('data-category');
            btnClone.addEventListener('click', function() {
                console.log("Clic en categoría:", category);
                // Llamar directamente a selectCategory
                Avika.ui.selectCategory(category);
            });
        });
        
        // 2. Corregir botón de nuevo ticket
        var newTicketBtn = document.getElementById('btn-new-ticket');
        if (newTicketBtn) {
            console.log("Encontrado botón Nuevo Ticket");
            // Eliminar eventos anteriores
            var newTicketBtnClone = newTicketBtn.cloneNode(true);
            if (newTicketBtn.parentNode) {
                newTicketBtn.parentNode.replaceChild(newTicketBtnClone, newTicketBtn);
            }
            
            // Asignar nuevo evento
            newTicketBtnClone.addEventListener('click', function() {
                console.log("Clic en botón Nuevo Ticket");
                Avika.ui.enableTicketMode();
            });
        } else {
            console.error("No se encontró el botón btn-new-ticket");
        }
        
        console.log("Correcciones aplicadas correctamente");
    });
})();