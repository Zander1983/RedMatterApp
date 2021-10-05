export const filterArrayAsPerInput = (arr: any[], inputText: String) => {
  let allSubStringArr: String[] = createAllSubString(inputText.toLowerCase());
  let joinedNeedles = allSubStringArr.join("[A-Z|a-z|0-9]*|[A-Z|a-z|0-9]*");
  joinedNeedles = `[A-Z|a-z|0-9]*${joinedNeedles}[A-Z|a-z|0-9]*`;
  let regex = new RegExp(joinedNeedles, "g");
  let finalArr: any[] = [];
  for (let i = 0; i < Object.keys(arr).length; i++) {
    let matches = doRegexMatching(arr[i].value.toLowerCase(), regex);
    if (matches.length > 0) {
      finalArr.push(arr[i]);
    }
  }
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
