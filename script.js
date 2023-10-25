// ============================
// DEFINITION OF CLASSES
// ============================

// Класс, описывающий отдельную ячейку таблицы.
class Cell {
  static attribute = "cell-data-id";

  constructor(row = null, column = null) {
    this.id = `${row}_${column}`;
    this.free = true;
    this.insertedComponent = null;
    this.column = column;
    this.row = row;
    this.visible = true;
    this.depended = null;
  }

  // Добавление компонента в ячейку (если она свободна).
}

class DraggableComponent {
  constructor(width, height, compName = "mycomponent") {
    this.size = [width, height];
    this.compName = compName;
  }
}

// ============================
// TABLE CREATION AND RENDERING
// ============================

// Массив для хранения созданных ячеек.
let createdTable = [];
let draggableComponents = [];

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

  console.log(createdTable);

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

    const componentData = JSON.parse(event.dataTransfer.getData("text"));
    const targetPosition = event.target.getAttribute(Cell.attribute).split("_");

    console.log(componentData);

    if (checkCellstoPlaceComponent(targetPosition, componentData.size)) {
      placeComponent(
        targetPosition,
        componentData.size,
        componentData.compName
      );
      mergeСells(targetPosition, componentData.size);
    } else {
      return alert("не подходящее место для компонента");
    }
  });
};

// ============================
// DRAGGABLE LOGIC
// ============================

const draggable1 = new DraggableComponent(1, 2, "draggable1");
const draggable2 = new DraggableComponent(2, 2, "draggable2");
const draggable3 = new DraggableComponent(2, 3, "draggable3");
const draggable4 = new DraggableComponent(2, 4, "draggable4");
const draggable5 = new DraggableComponent(3, 1, "draggable5");
const draggable6 = new DraggableComponent(4, 1, "draggable6");

draggableComponents.push(
  draggable1,
  draggable2,
  draggable3,
  draggable4,
  draggable5,
  draggable6
);

console.log(draggableComponents);

const draggableElements = Array.from(
  document.getElementsByClassName("draggable")
);

draggableComponents.forEach((elem) => {
  const currentElem = document.getElementById(elem.compName);
  currentElem.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text", JSON.stringify(elem));
  });
  currentElem.innerHTML = `высота: ${elem.size[0]}<br>ширина: ${elem.size[1]}`;
});

// ============================
// DROPPED LOGIC
// ============================

const placeComponent = (position, componentData, componentName) => {
  for (let i = +position[0]; i < +position[0] + +componentData[0]; i++) {
    for (let j = +position[1]; j < +position[1] + +componentData[1]; j++) {
      createdTable[i][j].free = false;
      createdTable[i][j].insertedComponent = componentName;
    }
  }

  console.log(createdTable);
};

// ============================
// PAGE LOAD
// ============================

// Когда страница загружается, восстанавливаем таблицу из localStorage и устанавливаем обработчики событий.
document.addEventListener("DOMContentLoaded", () => {
  const tablePlace = document.getElementById("tablePlace");
  createdTable = JSON.parse(localStorage.getItem("createdTable"));
  renderTable(tablePlace, createdTable);
  allowDrop();
});

// ============================
// CHECKS FUNCTIONS
// ============================

const checkCellstoPlaceComponent = (targetPosition, componentData) => {
  if (
    +targetPosition[0] + +componentData[0] > createdTable.length ||
    +targetPosition[1] + +componentData[1] > createdTable[0].length
  ) {
    return false;
  }

  for (
    let i = +targetPosition[0];
    i < +targetPosition[0] + +componentData[0];
    i++
  ) {
    for (
      let j = +targetPosition[1];
      j < +targetPosition[1] + +componentData[1];
      j++
    ) {
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

const renderTable = (tablePlace, tableData, tableId) => {
  tablePlace.innerHTML = "";

  let table = document.createElement("table");

  tableId ? (table.id = tableId) : (table.id = "myTable");

  tableData.forEach((row) => {
    let tr = document.createElement("tr");
    tr.style.height = `${100 / tableData.length}%`;
    row.forEach((elem) => {
      let cell = document.createElement("td");
      cell.style.width = `${100 / row.length}%`;
      cell.setAttribute(Cell.attribute, elem.id);
      tr.appendChild(cell);
    });
    table.appendChild(tr);
  });

  tablePlace.appendChild(table);
};

// mainCell - id главной клетки, которая расширяется, componentData - [], в котором размеры объединяемых клеток

const mergeСells = (mainCell, componentData) => {
  const target = document.querySelector(
    `td[${Cell.attribute}="${mainCell[0]}_${mainCell[1]}"]`
  );

  target.setAttribute("rowspan", componentData[0]);
  target.setAttribute("colspan", componentData[1]);
  target.setAttribute("main", "true");

  for (let i = +mainCell[0]; i < +mainCell[0] + +componentData[0]; i++) {
    for (let j = +mainCell[1]; j < +mainCell[1] + +componentData[1]; j++) {
      let chekingElement = document.querySelector(
        `td[${Cell.attribute}="${i}_${j}"]`
      );

      if (chekingElement.hasAttribute("main")) {
        chekingElement.style.width = `${
          (+componentData[1] / createdTable[0].length) * 100
        }%`;
      } else {
        chekingElement.style.display = "none";
      }
    }
  }

  console.log(target);
};
