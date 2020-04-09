var async = require('async');
var _ = require('lodash');
var fs = require('fs');
var utilityFile = require('./utilityFile');

const region = require('./common').english
console.log(region.baseUrl)
console.log("Fetching main categories ...... ");
utilityFile.fetchMainCategories(region.baseUrl, function(data, response) {
    if (response) {     
        console.log("AAAAAA", data); 
        data.categories.shift()
        // array to store an instance of scrape function for each link of pagination to process scrapping
        var asyncTasks = [];

        var arr = [];
        arr.push(data.categories[5]);
        // arr.push(data.categories[3]);
        // array to store the links of each page
        // iterating an array to store reference of callback function to handle scrapping of each function
        data.categories.forEach(function (category, index) {
            // We don't actually execute the async action here
            // We add a function containing it to an array of "tasks"
            asyncTasks.push(function (callback) {
                // Calling my async function
                utilityFile.getMainCatLinks(category, function (option, response) {
                    // Async call is done, alert via callback
                    if (response) {
                        console.log(option)
                        callback(null, option);
                    } else {
                        callback("error", null);
                    }
                });
            });
        });

        // Now we have an array of functions doing async tasks
        // Execute all async tasks in the asyncTasks array
        async.parallelLimit(asyncTasks, 1, function (err, result) {
            if (err) {
                console.log("Error in opening link(s).");
                return;
            }           
            // console.log(result)
            console.log("Links are fetched.")
             // using fs module for file handling, this is where I am writing the data in utf8 format and after converting it into stringify
            // if we don't convert it, it will saved at [Object, Object] in eventData.json file
            fs.writeFile('categories_french2.json', JSON.stringify(result), 'utf8', function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
        
        });
    } else {
        console.log("Error in Fetching Main Categories links");
    }
});

