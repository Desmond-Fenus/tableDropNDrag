// ============================
// DEFINITION OF CLASSES
// ============================

// Класс, описывающий отдельную ячейку таблицы.
class Cell {
  constructor(row = null, column = null) {
    this.id = `${row}_${column}`;
    this.free = true;
    this.insertedComponent = null;
    this.column = column;
    this.row = row;
    this.template = `<td data-cell-id="${this.id}"></td>`;
  }

  // Добавление компонента в ячейку (если она свободна).
  addComponent(comp) {
    if (this.free === true) {
      this.insertedComponent = comp;
      this.free = false;
    } else {
      console.error(`клетка занята компоннетом ${this.insertedComponent}`);
      return;
    }
  }
}

class DraggableComponent {
  constructor(width, height, compName = "mycomponent") {
    this.data = [width, height];
    this.compName = compName;
  }
}

// ============================
// TABLE CREATION AND RENDERING
// ============================

// Массив для хранения созданных ячеек.
let createdTable = [];

// Генерация таблицы на основе указанных строк и столбцов.
const createTable = () => {
  // Очищаем текущую таблицу перед созданием новой.
  createdTable = [];
  const rowValue = document.getElementById("row").value;
  const colValue = document.getElementById("col").value;
  const tablePlace = document.getElementById("tablePlace");

  for (let i = 0; i < rowValue; i++) {
    let row = [];
    for (let j = 0; j < colValue; j++) {
      row.push(new Cell(i, j));
    }
    createdTable.push(row);
  }

  renderTable(tablePlace, createdTable);
  allowDrop();
  localStorage.setItem("createdTable", JSON.stringify(createdTable));
};

// ============================
// EVENT HANDLERS
// ============================

// Проверка, какая ячейка была нажата.
const allowDrop = () => {
  const table = document.getElementById("myTable");

  table.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  table.addEventListener("drop", (event) => {
    event.preventDefault();

    console.log(event.target.getAttribute("data-cell-id"));
    let dropPosition = event.target.getAttribute("data-cell-id").split("_");
    let componentData = JSON.parse(event.dataTransfer.getData("text"));
    console.log(dropPosition, componentData.data);
    placeComponent(dropPosition, componentData.data);
  });
};

// ============================
// DRAGGABLE LOGIC
// ============================

const myDraggable = new DraggableComponent(1, 2);

document.getElementById("draggable").addEventListener("dragstart", (event) => {
  event.dataTransfer.setData("text", JSON.stringify(myDraggable));
  console.log(event.dataTransfer.getData("text"));
});

// ============================
// DROPPED LOGIC
// ============================

let placeComponent = (position, componentData) => {
  if (checkCellstoPlaceComponent(position, componentData)) {
    for (let i = +position[0]; i < +position[0] + +componentData[0]; i++) {
      for (let j = +position[1]; j < +position[1] + +componentData[1]; j++) {
        createdTable[i][j].free = false;
      }
    }
  } else {
    return alert("не подходящее место для компонента");
  }

  console.log(createdTable);
};

// ============================
// PAGE LOAD
// ============================

// Когда страница загружается, восстанавливаем таблицу из localStorage и устанавливаем обработчики событий.
document.addEventListener("DOMContentLoaded", () => {
  let tablePlace = document.getElementById("tablePlace");
  createdTable = JSON.parse(localStorage.getItem("createdTable"));
  renderTable(tablePlace, createdTable);
  allowDrop();
});

// ============================
// CHECKS FUNCTIONS
// ============================

let checkCellstoPlaceComponent = (position, componentData) => {
  if (
    +position[0] + +componentData[0] > createdTable.length ||
    +position[1] + +componentData[1] > createdTable[0].length
  ) {
    return false;
  }

  for (let i = +position[0]; i < +position[0] + +componentData[0]; i++) {
    for (let j = +position[1]; j < +position[1] + +componentData[1]; j++) {
      if (createdTable[i][j].free === false) {
        return false;
      }
    }
  }
  return true;
};

// ============================
// RENDER FUNCTIONS
// ============================

const renderTable = (tablePlace, tableData) => {
  let tbody = document.createElement("table");
  tableData.forEach((row) => {
    let tr = document.createElement("tr");
    row.forEach((elem) => {
      let cell = document.createElement("td");
      cell.innerText = elem.free;
      tr.appendChild(cell);
    });
    tbody.appendChild(tr);
  });

  tablePlace.appendChild(tbody);
};
