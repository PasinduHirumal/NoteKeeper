function viewAllNotes() {
    viewNotes();
}

function saveNote() {
    const noteTitle = document.getElementById('title').value;
    const noteContent = document.getElementById('content').value;
    const timestamp = new Date().toLocaleString();

    if (noteTitle.trim() === '') {
        Swal.fire('Oops...', 'Please provide a title for the note.', 'warning');
        return;
    }

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const editIndex = parseInt(document.getElementById('editIndex').value);

    const newNote = { title: noteTitle, content: noteContent, timestamp: timestamp };

    if (editIndex !== -1) {
        notes[editIndex] = newNote;
    } else {
        notes.push(newNote);
    }

    notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    localStorage.setItem('notes', JSON.stringify(notes));
    Swal.fire('Success!', 'Your note has been saved.', 'success');
    viewNotes();
    clearNote();
}

function clearNote() {
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('content').focus();
    document.getElementById('editIndex').value = -1;
}

function deleteSelectedNotes() {
    const checkboxes = document.querySelectorAll('.note-checkbox:checked');
    if (checkboxes.length === 0) {
        Swal.fire('Oops...', 'Please select at least one note to delete.', 'warning');
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete the selected notes?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete them!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            checkboxes.forEach(function (checkbox) {
                const noteIndex = checkbox.dataset.index;
                notes.splice(noteIndex, 1);
            });
            localStorage.setItem('notes', JSON.stringify(notes));
            Swal.fire('Deleted!', 'Your selected notes have been deleted.', 'success');
            viewNotes();
        }
    });
}

function viewNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = '';
    if (notes.length > 0) {
        notes.forEach(function (note, index) {
            const noteItem = document.createElement('div');
            noteItem.classList.add('note-item');
            noteItem.innerHTML = `
                <input type="checkbox" class="note-checkbox" data-index="${index}">
                <strong>Title:</strong> ${note.title}<br>
                <strong>Content:</strong> ${note.content}<br>
                <strong>Timestamp:</strong> ${note.timestamp}<br><br>
            `;
            noteItem.onclick = function () {
                document.getElementById('title').value = note.title;
                document.getElementById('content').value = note.content;
                document.getElementById('editIndex').value = index;
            };
            noteList.appendChild(noteItem);
        });
    } else {
        Swal.fire('No Notes Found', 'No notes are available.', 'info');
    }
}

function readTitle() {
    const title = document.getElementById('title').value;
    if (title.trim() === '') {
        Swal.fire('Oops...', 'Please enter a title first.', 'warning');
        return;
    }
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = title;
    speechSynthesis.speak(utterance);
}

function readContent() {
    const content = document.getElementById('content').value;
    if (content.trim() === '') {
        Swal.fire('Oops...', 'Please enter some content first.', 'warning');
        return;
    }
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = content;
    speechSynthesis.speak(utterance);
}

function clearAllNotes() {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This will permanently delete all notes.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear all!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('notes');
            Swal.fire('Cleared!', 'All notes have been cleared.', 'success');
            document.getElementById('noteList').innerHTML = '';
        }
    });
}

function searchNotes() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchInput));
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = '';
    if (filteredNotes.length > 0) {
        filteredNotes.forEach(function (note, index) {
            const noteItem = document.createElement('div');
            noteItem.classList.add('note-item');
            noteItem.innerHTML = `
                <input type="checkbox" class="note-checkbox" data-index="${index}">
                <strong>Title:</strong> ${note.title}<br>
                <strong>Content:</strong> ${note.content}<br>
                <strong>Timestamp:</strong> ${note.timestamp}<br><br>
            `;
            noteList.appendChild(noteItem);
        });
    } else {
        Swal.fire('No Matches', 'No matching notes found.', 'info');
    }
}

function filterByDate() {
    Swal.fire({
        title: 'Filter Notes by Date',
        html: `
            <input type="date" id="startDate" class="swal2-input" placeholder="Start Date">
            <input type="date" id="endDate" class="swal2-input" placeholder="End Date">
        `,
        focusConfirm: false,
        preConfirm: () => {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            return { startDate, endDate };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { startDate, endDate } = result.value;
            if (!startDate || !endDate) {
                Swal.fire('Oops...', 'Please enter both start and end dates.', 'error');
                return;
            }

            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            const filteredNotes = notes.filter(note => {
                const noteDate = new Date(note.timestamp).getTime();
                const startDateMillis = new Date(startDate).getTime();
                const endDateMillis = new Date(endDate).getTime() + (24 * 60 * 60 * 1000);
                return noteDate >= startDateMillis && noteDate <= endDateMillis;
            });

            const noteList = document.getElementById('noteList');
            noteList.innerHTML = '';

            if (filteredNotes.length > 0) {
                filteredNotes.forEach(function (note, index) {
                    const noteItem = document.createElement('div');
                    noteItem.classList.add('note-item');
                    noteItem.innerHTML = `
                        <input type="checkbox" class="note-checkbox" data-index="${index}">
                        <strong>Title:</strong> ${note.title}<br>
                        <strong>Content:</strong> ${note.content}<br>
                        <strong>Timestamp:</strong> ${note.timestamp}<br><br>
                    `;
                    noteList.appendChild(noteItem);
                });
            } else {
                Swal.fire('No Notes Found', 'No notes found between the specified dates.', 'info');
            }
        }
    });
}

window.onload = function () {
    viewNotes();
};
