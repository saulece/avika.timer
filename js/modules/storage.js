// storage.js - Funciones de guardado/carga de datos
const Avika = Avika || {};

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
            }
        } catch (e) {
            console.error('Error al guardar datos localmente:', e);
        }
    },

    // Función para cargar datos guardados
    cargarDatosGuardados: function() {
        try {
            var savedPending = localStorage.getItem('avika_pendingOrders');
            var savedCompleted = localStorage.getItem('avika_completedOrders');
            
            if (savedPending) {
                Avika.data.pendingOrders = JSON.parse(savedPending);
                Avika.ui.updatePendingTable();
            }
            
            if (savedCompleted) {
                Avika.data.completedOrders = JSON.parse(savedCompleted);
                Avika.ui.updateCompletedTable();
            }
            
            var lastSaved = localStorage.getItem('avika_lastSaved');
            if (lastSaved) {
                Avika.ui.showNotification('Datos cargados de ' + new Date(lastSaved).toLocaleString());
            }
            
            // Actualizar el estado guardado
            this.lastSavedState = JSON.stringify(Avika.data.pendingOrders) + JSON.stringify(Avika.data.completedOrders);
        } catch (e) {
            console.error('Error al cargar datos guardados:', e);
        }
    },
    
    // Función para limpiar historial
    limpiarHistorial: function() {
        if (confirm('¿Estás seguro de que deseas borrar todo el historial completado?')) {
            Avika.data.completedOrders = [];
            Avika.ui.updateCompletedTable();
            Avika.storage.guardarDatosLocales();
            Avika.ui.showNotification('Historial limpiado');
        }
    }
};