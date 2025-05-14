/*
 * INSTRUCCIONES DE IMPLEMENTACIÓN:
 * 
 * 1. Abre el archivo ui-controller.js
 * 2. Busca la función createDeliveryRow
 * 3. Localiza la sección donde se muestran las notas en la columna de detalles (alrededor de la línea 1240)
 * 4. Después del bloque de código que muestra las notas normales, agrega el siguiente código:
 */

// Notas del ticket en la columna de detalles
if (order.ticketNotes && order.ticketNotes.trim() !== '') {
    var ticketNotesDiv = document.createElement('div');
    ticketNotesDiv.className = 'ticket-notes';
    ticketNotesDiv.textContent = 'Ticket: ' + order.ticketNotes;
    detailsCell.appendChild(ticketNotesDiv);
}

/*
 * 5. Guarda el archivo
 * 6. Recarga la aplicación para ver los cambios
 */
