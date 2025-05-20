        // Notas
        if (order.notes && order.notes.trim() !== '') {
            var notesDiv = document.createElement('div');
            notesDiv.className = 'order-notes';
            notesDiv.textContent = order.notes;
            detailsCell.appendChild(notesDiv);
        }
        
        // Notas del ticket en la columna de detalles
        if (order.ticketNotes && order.ticketNotes.trim() !== '') {
            var ticketNotesDiv = document.createElement('div');
            ticketNotesDiv.className = 'ticket-notes';
            ticketNotesDiv.textContent = 'Ticket: ' + order.ticketNotes;
            detailsCell.appendChild(ticketNotesDiv);
        }
        
        row.appendChild(detailsCell);
