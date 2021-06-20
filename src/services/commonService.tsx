export const COMMON_SERVICE = {
  downloadCsvFile(datas: Array<any>, headerArray: Array<any>) {
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
  },
  convertArrayToCSV(values: Array<any>) {
    return values.join(",") + "\n";
  }
};
