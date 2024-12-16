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

module.exports = { handleFileList };
