// Первый класс для создания template для последующего заполнения таблицы

class ControlTable {
  static attribute = "cell-id-data";

  constructor(
    amountOfRows = 2,
    amountOfColumn = 2,
    tablePlace = "controlTable"
  ) {
    this.tablePlace = document.getElementById(tablePlace);
    this.tableName = tablePlace;
    this.amountOfRows = amountOfRows;
    this.amountOfColumn = amountOfColumn;
    this.renderedTableData = [];
  }

  // инкапсулированный класс для создания состояния клетки (будет раширяться для подгрузок и проверок)

  #Cell = class {
    constructor(rowId, colId, tableName) {
      this.rowId = rowId;
      this.colId = colId;
      this.cellId = `${this.rowId}_${this.colId}_${tableName}`;
      this.free = true;
    }
  };

  ControlPanel = class {
    constructor() {
      this.previousActions = [];
    }

    cancelAction() {}
  };

  // функция, которая создает экземпляр данных клетки

  #addNewCell(elemRowNumber, elemColNumber, tableName) {
    return new this.#Cell(elemRowNumber, elemColNumber, tableName);
  }

  // Вызывается для создания экземпляра таблицы для последущего рендера

  #fillRenderedTableData() {
    for (let i = 0; i < this.amountOfRows; i++) {
      let row = [];
      for (let j = 0; j < this.amountOfColumn; j++) {
        row.push(this.#addNewCell(i, j, this.tableName));
      }
      this.renderedTableData.push(row);
    }
  }

  #renderTable() {
    let table = document.createElement("table");
    table.classList.add(`${this.tableName}_table`);

    this.renderedTableData.forEach((row) => {
      let tr = document.createElement("tr");
      tr.style.height = `${100 / this.renderedTableData.length}%`;
      row.forEach((elem) => {
        let td = document.createElement("td");
        td.classList.add(`${this.tableName}_cell`);
        td.style.width = `${100 / row.length}%`;
        td.innerText = "+";
        td.setAttribute(ControlTable.attribute, elem.cellId);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    this.tablePlace.appendChild(table);

    // ! почле рендера/перерендера таблицы обязательно навесить события drag-N-drop

    table.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    table.addEventListener("drop", (event) => {
      event.preventDefault();

      // в ComponentData должно содержаться размер с названием size, название компонента compName
      const componentData = event.dataTransfer
        .getData("text")
        .split("_")
        .map(Number);

      // в targetPosition мы определяем массив с координатами реальной клетки на таблице на которую мы бросили компонент с componentData
      const targetPosition = event.target
        .getAttribute(ControlTable.attribute)
        .split("_")
        .map(Number);

      console.log(targetPosition);

      if (this.#isPlacementPossible(targetPosition, componentData)) {
        this.#mergeCells(event.target, targetPosition, componentData);
      } else {
        alert("Placement is not possible");
      }
    });
  }

  #mergeCells(targetCell, startCoordinate, componentSize) {
    targetCell.setAttribute("rowspan", componentSize[0]);
    targetCell.setAttribute("colspan", componentSize[1]);
    targetCell.setAttribute("main", "true");

    console.log("gdsfsdf");

    for (
      let i = startCoordinate[0];
      i < startCoordinate[0] + componentSize[0];
      i++
    ) {
      for (
        let j = startCoordinate[1];
        j < startCoordinate[1] + componentSize[1];
        j++
      ) {
        let chekingElement = document.querySelector(
          `td[${ControlTable.attribute}="${this.renderedTableData[i][j].cellId}"]`
        );

        if (chekingElement.hasAttribute("main")) {
          chekingElement.style.width = `${
            (componentSize[1] / this.renderedTableData[0].length) * 100
          }%`;
        } else {
          chekingElement.style.display = "none";
        }
        this.renderedTableData[i][j].free = false;
      }
    }
  }

  #isPlacementPossible(startCoordinate, componentSize) {
    if (
      startCoordinate[0] + componentSize[0] > this.renderedTableData.length ||
      startCoordinate[1] + componentSize[1] > this.renderedTableData[0].length
    ) {
      console.log("not enough space");
      return false;
    }

    for (
      let i = startCoordinate[0];
      i < startCoordinate[0] + componentSize[0];
      i++
    ) {
      for (
        let j = startCoordinate[1];
        j < startCoordinate[1] + componentSize[1];
        j++
      ) {
        if (this.renderedTableData[i][j].free === false) {
          console.log("not free");
          return false;
        }
      }
    }
    return true;
  }

  createNewTable() {
    this.#fillRenderedTableData();
    this.#renderTable();
  }
}

// TODO сделать список элементы которого можно будет перетаскивать на таблицу для их отображения в них
// TODO добавить к ним размер компонента и название к которому можно будет привязать компонент вью

class DraggableList {
  constructor(listName, listPlace = "draggableList") {
    this.listName = listName;
    this.listPlace = document.getElementById(listPlace);
    this.catalogOfItems = [];
  }

  #ListItem = class {
    constructor(itemName, height, width) {
      this.itemName = itemName;
      this.height = height;
      this.width = width;
    }
  };

  addNewItem(itemName, height, width) {
    this.catalogOfItems.push(new this.#ListItem(itemName, height, width));

    let listItem = document.createElement("div");
    listItem.draggable = true;
    listItem.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text", `${height}_${width}`);
      console.log(event.dataTransfer.getData("text"));
    });
    listItem.innerText = `${itemName}, ${height}, ${width}`;
    listItem.classList.add("itemStyle");

    this.listPlace.appendChild(listItem);
  }

  addNewItems(arr) {
    arr.forEach((elem) => {
      this.addNewItem(...elem);
    });
  }
}

const controlTable = new ControlTable(5, 7);
controlTable.createNewTable();

const newList = new DraggableList("first list");
newList.addNewItem("1", 2, 2);

const arr = [
  ["q", 2, 4],
  ["w", 3, 1],
  ["t", 1, 4],
];
newList.addNewItems(arr);
