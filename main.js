/**
 * [
 *    {
 *      id: <int>
 *      title: <string>
 *      author: <string>
 *      year: <number>
 *      isComplete: <boolean>
 *    }
 * ]
 */
const todos = [];
const RENDER_EVENT = "render-todo";
const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

function generateId() {
  return +new Date();
}

function generateTodoObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

/**
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel {@see todos}
 */
function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeTodo(todoObject) {
  const { id, title, author, year, isComplete } = todoObject;

  const textTitle = document.createElement("h2");
  textTitle.innerText = title;

  const textauthor = document.createElement("p");
  textauthor.innerText = `Penulis: ${author}`;

  const textyear = document.createElement("p");
  textyear.innerText = `Tahun: ${year}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textauthor, textyear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${id}`);

  const checkBox = document.createElement("input");
  checkBox.setAttribute("type", "checkbox");
  checkBox.checked = isComplete;
  checkBox.addEventListener("change", function () {
    if (checkBox.checked) {
      addTaskToCompleted(id);
    } else {
      undoTaskFromCompleted(id);
    }
  });

  if (isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.innerText = "Undo"; // Teks untuk tombol undo
    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.innerText = "Hapus Buku"; // Teks untuk tombol hapus
    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.innerText = "Selesai Dibaca"; // Teks untuk tombol selesai dibaca
    checkButton.addEventListener("click", function () {
      addTaskToCompleted(id);
    });
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.innerText = "Hapus Buku"; // Teks untuk tombol hapus
    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(id);
    });
    container.append(checkButton, trashButton);
  }

  return container;
}

function addTodo() {
  const textTodo = document.getElementById("inputNama").value;
  const author = document.getElementById("inputPenulis").value;
  const year = parseInt(document.getElementById("inputTahun").value);
  const isComplete = document.getElementById("inputBaca").checked; // Menentukan status selesai atau belum selesai dibaca

  const generatedID = generateId();
  const todoObject = generateTodoObject(
    generatedID,
    textTodo,
    author,
    year,
    isComplete
  );

  if (isComplete) {
    todos.unshift(todoObject); // Menambahkan buku ke awal array untuk memastikan tampil di bagian "Selesai dibaca"
  } else {
    todos.push(todoObject);
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(todoId /* HTMLELement */) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(todoId /* HTMLELement */) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(todoId /* HTMLELement */) {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm /* HTMLFormElement */ =
    document.getElementById("formDataBuku");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addTodo();
  });
  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", searchTodo);
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function searchTodo() {
  const searchInput = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  const filteredTodos = todos.filter((todo) => {
    return todo.title.toLowerCase().includes(searchInput);
  });

  const uncompletedTODOList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedTODOList = document.getElementById("completeBookshelfList");

  uncompletedTODOList.innerHTML = "";
  completedTODOList.innerHTML = "";

  filteredTodos.forEach((todoItem) => {
    const todoElement = makeTodo(todoItem);
    if (todoItem.isComplete) {
      completedTODOList.appendChild(todoElement);
    } else {
      uncompletedTODOList.appendChild(todoElement);
    }
  });
}

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById("todos");
  const listCompleted = document.getElementById("completed-todos");

  // clearing list item
  uncompletedTODOList.innerHTML = "";
  listCompleted.innerHTML = "";

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (todoItem.isComplete) {
      listCompleted.append(todoElement);
    } else {
      uncompletedTODOList.append(todoElement);
    }
  }
});
