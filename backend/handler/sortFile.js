// Not Tested
const { getFiles } = require('../models/files'); 

// Sort by file name
async function sort_by_name(arr) {
    arr.sort((a, b) => {
        if (a.name < b.name) return -1;
        else if (a.name > b.name) return 1;
    });
}


// Sort by file last modified date
async function sort_by_date(arr) {
    arr.sort((a, b) => {
        if (a.date < b.date) return -1;
        else if (a.date > b.date) return 1;

        else if (a.name < b.name) return -1;
        else if (a.name > b.name) return 1;
    });
}

// Sort by file size
async function sort_by_size(arr) {
    arr.sort((a, b) => {
        if (a.size < b.size) return -1;
        if (a.size > b.size) return 1;

        else if (a.name < b.name) return -1;
        else if (a.name > b.name) return 1;
    });
}


module.exports = { 
    sort_by_name,
    sort_by_date,
    sort_by_size,
};