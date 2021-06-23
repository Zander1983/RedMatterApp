## What is this?

This is a library made by mark for dealing with FCS files. It can be found on [here](https://github.com/RedMatterApplication/RedMatterFcs).

## Documentation

```
let RedMatterFcs = require("RedMatterFcs");

let filePath =
  "erica1.fcs";

RedMatterFcs.loadFile(filePath).then(function (FCS) {
  console.log("in start, fcsFile is ", FCS.dataAsNumbers.length);

  console.log("FCS.getEvents() is ", FCS.getParams());

  console.log("FCS.getParams() is ", FCS.getParams());

  console.log("getAnalysis is ", FCS.getAnalysis());

  console.log("getText() is ", FCS.getText());
});

```
