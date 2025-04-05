// storage.js - Funciones de guardado/carga de datos
window.Avika = window.Avika || {};
Avika.storage = {
    lastSavedState: '',
    
    // Función para guardar datos automáticamente en el almacenamiento local
    guardarDatosLocales: function() {
        try {
            // Verificar si hay cambios antes de guardar
            var currentState = JSON.stringify(Avika.data.pendingOrders) + JSON.stringify(Avika.data.completedOrders);
            if (currentState !== this.lastSavedState) {
                localStorage.setItem('avika_pendingOrders', JSON.stringify(Avika.data.pendingOrders));
                localStorage.setItem('avika_completedOrders', JSON.stringify(Avika.data.completedOrders));
                localStorage.setItem('avika_lastSaved', new Date().toString());
                this.lastSavedState = currentState;
                console.log('Datos guardados localmente:', new Date().toLocaleTimeString());
            }
        } catch (e) {
            console.error('Error al guardar datos localmente:', e);
        }
    },
    
    // Función para cargar datos guardados desde el almacenamiento local
    cargarDatosGuardados: function() {
        try {
            var pendingOrders = localStorage.getItem('avika_pendingOrders');
            var completedOrders = localStorage.getItem('avika_completedOrders');
            var lastSaved = localStorage.getItem('avika_lastSaved');
            
            if (pendingOrders) {
                Avika.data.pendingOrders = JSON.parse(pendingOrders);
                console.log('Órdenes pendientes cargadas');
            }
            
            if (completedOrders) {
                Avika.data.completedOrders = JSON.parse(completedOrders);
                console.log('Órdenes completadas cargadas');
            }
            
            if (lastSaved) {
                console.log('Última vez guardado:', lastSaved);
            }
            
            // Actualizar el estado guardado para evitar guardar inmediatamente después de cargar
            this.lastSavedState = JSON.stringify(Avika.data.pendingOrders) + JSON.stringify(Avika.data.completedOrders);
            
            return true;
        } catch (e) {
            console.error('Error al cargar datos guardados:', e);
            return false;
        }
    },
    
    // Función para limpiar el historial de pedidos completados
    limpiarHistorial: function() {
        if (confirm('¿Estás seguro de que deseas eliminar todo el historial de pedidos completados?')) {
            Avika.data.completedOrders = [];
            localStorage.removeItem('avika_completedOrders');
            Avika.ui.updateCompletedTable(false);
            this.guardarDatosLocales();
            console.log('Historial limpiado correctamente');
        }
    }
};