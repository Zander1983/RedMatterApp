// Switch-Case
const fruit = "Mango";
switch (fruit) {
  case "Mango":
    console.log("Some information about Mango");
    break;
  case "Banana":
    console.log("Some information about Banana");
    break;
  case "Apple":
    console.log("Some information about Apple");
    break;
  default:
    console.log("No informations");
}

// Better approach
const basket = {
  Mango: "Some information about Mango",
  Banana: "Some information about Banana",
  Apple: "Some information about Apple",
};
const fruitInformation = basket[fruit] || "No informations";
console.log(fruitInformation); // Some information about Mango
