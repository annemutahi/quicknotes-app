const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");

const storageKey = "quick-notes";
const categories = new Set(["personal", "work", "ideas"]);
let notes = loadNotes();

function isValidNote(note) {
  return (
    note !== null &&
    typeof note === "object" &&
    typeof note.id === "string" &&
    typeof note.text === "string" &&
    categories.has(note.category) &&
    typeof note.createdAt === "string"
  );
}

function loadNotes() {
  try {
    const savedNotes = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(savedNotes) ? savedNotes.filter(isValidNote) : [];
  } catch {
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  } catch {
    errorMessage.textContent = "Notes could not be saved in this browser.";
  }
}

function createNoteId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function render() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const visibleNotes = notes.filter((note) =>
    note.text.toLocaleLowerCase().includes(searchTerm)
  );

  notesList.replaceChildren();

  visibleNotes.forEach((note) => {
    const noteElement = document.createElement("li");
    noteElement.classList.add("note-card", `category-${note.category}`);

    const noteText = document.createElement("p");
    noteText.textContent = note.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.dataset.noteId = note.id;
    deleteButton.textContent = "Delete";

    noteElement.append(noteText, deleteButton);
    notesList.append(noteElement);
  });

  if (notes.length === 0) {
    noteCount.textContent = "No notes yet";
  } else if (notes.length === 1) {
    noteCount.textContent = "1 note";
  } else {
    noteCount.textContent = `${notes.length} notes`;
  }
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = noteInput.value.trim();
  if (text.length === 0) {
    errorMessage.textContent = "Please enter a note.";
    noteInput.focus();
    return;
  }

  if ([...text].length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    noteInput.focus();
    return;
  }

  errorMessage.textContent = "";
  notes.push({
    id: createNoteId(),
    text,
    category: noteCategory.value,
    createdAt: new Date().toISOString(),
  });

  saveNotes();
  noteForm.reset();
  render();
});

searchInput.addEventListener("input", render);

notesList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const deleteButton = event.target.closest("button[data-note-id]");
  if (!deleteButton || !notesList.contains(deleteButton)) {
    return;
  }

  notes = notes.filter((note) => note.id !== deleteButton.dataset.noteId);
  saveNotes();
  render();
});

render();
