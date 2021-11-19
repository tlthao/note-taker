let title;
let textNote;
let noteBtn;
let newBtn;
let list;

if (window.location.pathname === '/notes') {
  title = document.querySelector('.note-title');
 textNote = document.querySelector('.note-textarea');
  noteBtn = document.querySelector('.save-note');
  newBtn = document.querySelector('.new-note');
  list = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const renderActiveNote = () => {
  hide(noteBtn);

  if (activeNote.id) {
    title.setAttribute('readonly', true);
   textNote.setAttribute('readonly', true);
    title.value = activeNote.title;
   textNote.value = activeNote.text;
  } else {
    title.removeAttribute('readonly');
   textNote.removeAttribute('readonly');
    title.value = '';
   textNote.value = '';
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: title.value,
    text: textNote.value,
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

const handleRenderSaveBtn = () => {
  if (!title.value.trim() ||  textNote.value.trim()) {
    hide(noteBtn);
  } else {
    show(noteBtn);
  }
};

// Render the list of note titles
const renderlist = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    list.forEach((el) => (el.innerHTML = ''));
  }

  let listItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    listItems.push(createLi('No saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);

    listItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    listItems.forEach((note) => list[0].append(note));
  }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderlist);

if (window.location.pathname === '/notes') {
  noteBtn.addEventListener('click', handleNoteSave);
  newBtn.addEventListener('click', handleNewNoteView);
  title.addEventListener('keyup', handleRenderSaveBtn);
 textNote.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderNotes();