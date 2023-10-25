class ControlTable {
  static attribute = "cell-id-data";

  constructor(
    amountOfRows = 2,
    amountOfColumn = 2,
    tablePlace = document.getElementById("controlTable")
  ) {
    this.tablePlace = tablePlace;
    this.amountOfRows = amountOfRows;
    this.amountOfColumn = amountOfColumn;
    this.renderedTableData = [];
  }

  // инкапсулированный класс для создания состояния клетки (будет раширяться для подгрузок и проверок)

  #Cell = class {
    constructor(rowId, colId) {
      this.rowId = rowId;
      this.colId = colId;
      this.cellId = `${this.rowId}_${this.colId}`;
      this.free = true;
    }
  };

  // функция, которая создает экземпляр данных клетки

  #addNewCell(elemRowNumber, elemColNumber) {
    return new this.#Cell(elemRowNumber, elemColNumber);
  }

  // Вызывается для создания экземпляра таблицы для последущего рендера

  #fillRenderedTableData() {
    for (let i = 0; i < this.amountOfRows; i++) {
      let row = [];
      for (let j = 0; j < this.amountOfColumn; j++) {
        row.push(this.#addNewCell(i, j));
      }
      this.renderedTableData.push(row);
    }
  }

  #renderTable() {
    let table = document.createElement("table");

    this.renderedTableData.forEach((row) => {
      let tr = document.createElement("tr");
      tr.style.height = `${100 / this.renderedTableData.length}%`;
      row.forEach((elem) => {
        let td = document.createElement("td");
        td.style.width = `${100 / row.length}%`;
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
      // TODO поменять после добавления класса драгблКомп следующую строчку: JSON.parse(event.dataTransfer.getData("text"))

      const componentData = [2, 2];

      // в targetPosition мы определяем массив с координатами реальной клетки на таблице на которую мы бросили компонент с componentData
      const targetPosition = event.target
        .getAttribute(ControlTable.attribute)
        .split("_")
        .map(Number);

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

    for (
      let i = +startCoordinate[0];
      i < +startCoordinate[0] + +componentSize[0];
      i++
    ) {
      for (
        let j = +startCoordinate[1];
        j < +startCoordinate[1] + +componentSize[1];
        j++
      ) {
        let chekingElement = document.querySelector(
          `td[${ControlTable.attribute}="${i}_${j}"]`
        );

        if (chekingElement.hasAttribute("main")) {
          chekingElement.style.width = `${
            (+componentSize[1] / this.renderedTableData[0].length) * 100
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

const controlTable = new ControlTable(5, 7);

controlTable.createNewTable();
console.log(controlTable.renderedTableData);
