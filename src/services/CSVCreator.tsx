export interface CSVObject {
  headers: Array<string>;
  body: Array<any>;
}

export class CSVCreator {

  csvString : string = '';
  tableNames: Array<string> = [];
  constructor(tableNames : Array<string> = []) {
    this.tableNames = tableNames;
  }

  createCSV(datas: Array<any>, headerArray: Array<any>) {
    let csv = "";

    let headerValues = this.convertArrayToCSV(headerArray);
    csv += headerValues;

    if (datas && datas.length > 0) {
      let keys = Object.keys(datas[0]);

      for (let i = 0; i < datas.length; i++) {
        let data = datas[i];
        let valueArray = [];

        for (let j = 0; j < keys.length; j++) {
          valueArray.push(data[keys[j]]);
        }

        let value = this.convertArrayToCSV(valueArray);

        csv += value;
      }
    }
    return csv + "\n \n";
  }

  convertArrayToCSV(values: Array<any>) {
    return values.join(",") + "\n";
  }

  addRow(text: string)
  {
    this.csvString += text + " \n";
  }

  exportToCSV(tables: Array<CSVObject>) {
    for (let i = 0; i < tables.length; i++) {
      if(this.tableNames && i in this.tableNames)
      {
        this.addRow(this.tableNames[i]);
      }
      const headers = tables[i].headers;
      const body = tables[i].body;
      this.csvString += this.createCSV(body, headers);
    }

    const blob = new Blob([this.csvString]);
    var link = document.createElement("A");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "data.csv");
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.csvString = '';
  }
}
