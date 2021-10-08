export const filterArrayAsPerInput = (
  arr: any[],
  inputText: String,
  valueProperty: String = ""
) => {
  let finalArr: any[] = [];
  if (inputText) {
    inputText = inputText.toLowerCase();
    let allSubStringArr: String[] = inputText.split(" ");
    allSubStringArr = allSubStringArr.filter((x) => x);

    let joinedNeedles = allSubStringArr.join("[A-Z|a-z|0-9]*|[A-Z|a-z|0-9]*");
    joinedNeedles = `[A-Z|a-z|0-9]*${joinedNeedles}[A-Z|a-z|0-9]*`;
    let regex = new RegExp(joinedNeedles, "g");

    let matchesObj: any = [];
    for (let i = 0; i < Object.keys(arr).length; i++) {
      let item = arr[i];
      let value = "";
      if (valueProperty) {
        debugger;
        value = item[`${valueProperty}`];
      } else value = item;
      value = value.toLowerCase().trim();
      let matches = doRegexMatching(value, regex);
      if (matches.length > 0) {
        let characterLength = 0;
        for (let j = 0; j < matches.length; j++) {
          characterLength = characterLength + matches[j][0].length;
        }
        if (characterLength > 0)
          matchesObj.push({ item: arr[i], charLength: characterLength });
      }
    }

    if (matchesObj.length > 0) {
      matchesObj.sort((a: any, b: any) => {
        return b.charLength - a.charLength;
      });
      finalArr = matchesObj.map((x: any) => x.item);
    }
  } else finalArr = arr;

  return finalArr;
};

export const createAllSubString = (inputText: String): String[] => {
  let i,
    j,
    result = [];

  for (i = 0; i < inputText.length; i++) {
    for (j = i + 1; j < inputText.length + 1; j++) {
      result.push(inputText.slice(i, j));
    }
  }
  return result;
};

export const doRegexMatching = (valueMatch: String, regex: RegExp) => {
  return Array.from(valueMatch.matchAll(regex));
};
