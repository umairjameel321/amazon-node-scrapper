var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var puppeteer = require('puppeteer')

var region = require('./common').english


// creating an async function, for completing the process of scraping before it returns the data to where this function called from
module.exports.fetchMainCategories = async (url, callback) => {
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})
    const result = await page.evaluate((region) => {
        var data = {
            categories: []
        };
        let dummy_region = region
        $('.nav-search-dropdown').children().each(function() {
            let obj = {
                text: $(this).text(),
                link: dummy_region.mainCatUrlInitial + ($(this).attr("value")).replace("=", "%3D") + dummy_region.mainCatUrlLast
            }
            
            data.categories.push(obj);
        })
      
        return data; // Return our data
    }, region);

    // let's close the browser
    await page.close();
    await browser.close();
    callback(result, true)
};


// creating an async function, for completing the process of scraping before it returns the data to where this function called from
module.exports.getMainCatLinks = async (cat, callback) => {
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.goto(cat.link, {waitUntil: 'domcontentloaded'});
    await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})
    const result = await page.evaluate(({cat, region}) => {
            cat.subcats = []

            if($('#leftNav')) {
                let lists = $('#leftNav ul ul div').children();
                lists.each(function() {
                    let obj = {
                        text: $(this).find('span a').text(),
                        link: region.baseUrl + $(this).find('span a').attr("href")
                    }
                    
                    cat.subcats.push(obj);
                })
          
                return cat; // Return our data
            } else {
                return [];
            }
    }, {cat, region}).catch(function(error) {
        console.log("Error", error.message)
    });

     // let's close the browser
     await page.close();
     await browser.close();

     if(result.subcats.length) {
        getCats(result, function(response) {
            if(response) {
                result.subcats = response;
            }
            callback(result, true);
        })
     } else {
        callback(result, true)
     }
};



function getCats(mainCats, callback) {
    var subCats = mainCats.subcats;

    // array to store an instance of scrape function for each link of pagination to process scrapping
    var asyncTasks = [];

    // iterating an array to store reference of callback function to handle scrapping of each function
    subCats.forEach(function (cat, index) {
        // We don't actually execute the async action here
        // We add a function containing it to an array of "tasks"
        asyncTasks.push(function (callback) {
            // Calling my async function
            getSubMainCatLinks(cat, function (updatedCat, response) {
                // Async call is done, alert via callback
                if (response) {
                    callback(null, updatedCat);
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
        callback(result)
        
    });
}


// creating an async function, for completing the process of scraping before it returns the data to where this function called fr
getSubMainCatLinks = async (subcat, callback) => {
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.goto(subcat.link, {waitUntil: 'domcontentloaded'});
    await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})
    const result = await page.evaluate(({subcat, region}) => {
            subcat.subsubcats = []

            if($('#s-refinements')) {
                let lists = $('#s-refinements #departments ul').children().slice(2);
                lists.each(function() {
                    let obj = {
                        text: $(this).find('span a span').text(),
                        link: region.baseUrl + $(this).find('span a').attr("href")
                    }
                    
                    subcat.subsubcats.push(obj);
                })
          
                return subcat; // Return our data
            } else {
                return [];
            }
    }, {subcat, region}).catch(function(error) {
        console.log("Error", error.message)
    });

    // let's close the browser
    await page.close();
    await browser.close();

    if(result.subsubcats.length) {
        getSubCats(result, function(response) {
            if(response) {
                result.subsubcats = response;
            }
            callback(result, true);
        })
     } else {
        callback(result, true)
     }
};


function getSubCats(mainSubCats, callback) {
    var subCats = mainSubCats.subsubcats;

    // array to store an instance of scrape function for each link of pagination to process scrapping
    var asyncTasks = [];

    // iterating an array to store reference of callback function to handle scrapping of each function
    subCats.forEach(function (cat, index) {
        // We don't actually execute the async action here
        // We add a function containing it to an array of "tasks"
        asyncTasks.push(function (callback) {
            // Calling my async function
            getSubSubMainCatLinks(cat, function (updatedCat, response) {
                // Async call is done, alert via callback
                if (response) {
                    callback(null, updatedCat);
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
        callback(result)
        
    });
}



// creating an async function, for completing the process of scraping before it returns the data to where this function called fr
getSubSubMainCatLinks = async (subcat, callback) => {
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.goto(subcat.link, {waitUntil: 'domcontentloaded'});
    await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})
    const result = await page.evaluate(({subcat, region}) => {
            subcat.subsubcats = []

            if($('#s-refinements')) {
                let lists = $('#s-refinements #departments ul').children().slice(3);
                lists.each(function() {
                    let obj = {
                        text: $(this).find('span a span').text(),
                        link: region.baseUrl + $(this).find('span a').attr("href")
                    }
                    
                    subcat.subsubcats.push(obj);
                })
          
                return subcat; // Return our data
            } else {
                return [];
            }
    }, {subcat, region}).catch(function(error) {
        console.log("Error", error.message)
    });

    // let's close the browser
    await page.close();
    await browser.close();

    // if(result.subsubcats.length) {
    //     getSubCats(result, function(response) {
    //         if(response) {
    //             result.subsubcats = response;
    //         }
    //         callback(result, true);
    //     })
    //  } else {
    //     callback(result, true)
    //  }


    callback(result, true)
};


