export const COMMON_SERVICE = {
    downloadCsvFile(datas: Array<any>, headerArray: Array<any>) {
        let csv = '';

        let headerValues = this.convertArrayToCSV(headerArray);
        csv += headerValues;

        let keys = Object.keys(datas[0]);

        for(let i=0; i<datas.length; i++)
        {
            let data = datas[i];
            let valueArray = [];

            for(let j=0; j<keys.length; j++)
            {
                valueArray.push(data[keys[j]]);
            }

            let value = this.convertArrayToCSV(valueArray);

            csv += value;
        }
        debugger
        return csv;
    },
    convertArrayToCSV(values: Array<any>){
        return values.join(",") + "\n";
    }
}