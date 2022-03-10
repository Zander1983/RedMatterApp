var fs = require("fs");
const crypto = require("crypto");

function readModuleFile(path, callback) {
  try {
    var filename = require.resolve(path);
    fs.readFile(filename, "utf8", callback);
  } catch (e) {
    callback(e);
  }
}

var myArgs = process.argv.slice(2);

let finalFile = [];

readModuleFile("./Files.json", function (err, files) {
  var filesParsed = JSON.parse(files);
  // console.log(" is ", files);

  console.log("filesParsed.length is ", filesParsed.length);

  let count = 0;
  for (var x = 0; x < 7; x++) {
    for (var i = 0; i < filesParsed.length; i++) {
      count++;
      let nextEntry = JSON.parse(JSON.stringify(filesParsed[i]));
      let id = crypto.randomUUID();

      if (x == 0 && i == 0) {
        nextEntry["_id"] = "file_key_1_control";
        nextEntry["id"] = "file_key_1_control";
      } else {
        nextEntry["_id"] = id;
        nextEntry["id"] = id;
      }

      nextEntry["title"] = "ERICA_BM_Tube_00" + count + "_00" + count + ".fcs";
      nextEntry["label"] = "ERICA_BM_Tube_00" + count + "_00" + count + ".fcs";

      for (
        var eventIndex = 0;
        eventIndex < nextEntry["events"].length;
        eventIndex++
      ) {
        for (
          var channelIndex = 0;
          channelIndex < nextEntry["events"][0].length;
          channelIndex++
        ) {
          nextEntry["events"][eventIndex][channelIndex] = Math.round(
            nextEntry["events"][eventIndex][channelIndex]
          );
          if (x > 2) {
            nextEntry["events"][eventIndex][channelIndex] =
              nextEntry["events"][eventIndex][channelIndex] +
              Math.round(Math.random() * (30000 - 0)) +
              0;
          }
        }
      }

      //"title": "ERICA_BM_Tube_003_003.fcs"
      //"title": "ERICA_BM_Tube_003_003.fcs"
      //console.log("nextEntry[_id] is ", nextEntry["_id"]);
      finalFile.push(nextEntry);
    }
  }

  fs.writeFile(
    "./Files" + count + ".json",
    JSON.stringify(finalFile),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }

      readModuleFile("./Files" + count + ".json", function (err, files) {
        var filesParsed = JSON.parse(files);
        for (var i = 0; i < filesParsed.length; i++) {
          console.log("filesParsed[title] is ", filesParsed[i]["title"]);
        }
      });
    }
  );
});
