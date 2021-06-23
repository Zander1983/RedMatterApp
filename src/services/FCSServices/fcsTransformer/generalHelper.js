

module.exports.removeNulls = (array) =>  {
	return array.filter(function(val) {
		return val !== null;
	});
};

module.exports.compareTwoArrays = (array1, array2) => {
    // if the other array1 is a falsy value, return
    if (!array1 || !array2)
        return false;

    // compare lengths - can save a lot of time 
    if (array2.length != array1.length)
        return false;

    for (var i = 0, l=array2.length; i < l; i++) {
        // Check if we have nested array1s
        if (array2[i] instanceof Array && array1[i] instanceof Array) {
            // recurse into the nested array1s
            if (!array2[i].equals(array1[i]))
                return false;       
        }           
        else if (array2[i] != array1[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
};

module.exports.removeNulls = (array) => {
	return array.filter(function(val) {
		return val !== null;
	});
};

module.exports.getMaxForParam = (params) => {

	var maxArray = params.fcs.get$PnX('R');
	maxArray = this.removeNulls(maxArray);
	var maxInHeader = maxArray[params.param];

	// IF WANT TO USE MAX FROM DB, WILL NEED TO RUN A SCRIPT AS ALL THE MAXES ARE SLIGHTLY WRONG
	// SO JUST USE MAX FORM THE FILE
	// var maxInDb = fcsFileDb.paramsAnaylsis[param].max;

	// if(maxInDb > maxInHeader){
	// 	return parseFloat(maxInDb);
	// }

	return parseFloat(maxInHeader);
};