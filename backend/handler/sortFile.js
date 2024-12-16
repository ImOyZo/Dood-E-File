// Not Tested
const { getFiles } = require('../models/files'); 

// Handler sorting
async function handleFileList(req, res) {
    try {
        const sortBy = req.query.sortBy || 'name'; 
        const sortOrder = req.query.sortOrder || 'ASC'; // Default 

        const userID = req.headers['user-id'];
        const files = await getFiles({ userID, sortBy, sortOrder });

        // fetching response
        res.status(200).json({
            success: true,
            message: 'File list fetched successfully',
            data: files,
        });
    } catch (error) {
        console.error('Error in handleFileList:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch file list',
        });
    }
}

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
    handleFileList,
    sort_by_name,
    sort_by_date,
    sort_by_size,
};