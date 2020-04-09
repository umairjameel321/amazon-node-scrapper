var fs = require('fs');
var _ = require('lodash');


let rawdata = fs.readFileSync('categories_french2.json');
let cats = JSON.parse(rawdata);

console.log(cats);

var resultString = "";
var re = new RegExp(',', 'g');
_.each(cats, function (cat) {
    if(!cat.subcats.length) {
        resultString += cat.text.replace(re, " ") + "\n";
    } else {
        _.each(cat.subcats, function (subcat) {
            if(!subcat.subsubcats.length) {
                resultString += cat.text.replace(re, " ") + "," + subcat.text.replace(re, " ") + "\n";
            } else {
                _.each(subcat.subsubcats, function (subsubcat) {
                    if(!subsubcat.subsubcats.length) {
                        resultString += cat.text.replace(re, " ") + "," + subcat.text.replace(re, " ") + "," + subsubcat.text.replace(re, " ") + "\n";
                    } else {
                        _.each(subsubcat.subsubcats, function (subsubsubcat) {                         
                            resultString += cat.text.replace(re, " ") + "," + subcat.text.replace(re, " ") + "," + subsubcat.text.replace(re, " ") + "," + subsubsubcat.text.replace(re, " ") + "\n";
                        })
                    }
                })
            }
        })
    }
})


fs.appendFile('categoryFrench.csv', resultString, function (err) {
    if (err) {
        console.log("There was an error.")
    } else {
        console.log("Categories converted successfully")
    }
});