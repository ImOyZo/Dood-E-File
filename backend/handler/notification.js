const { fetchLogs } = require('../models/activityLog');

const handleNotification = async (req, res, id) => {
    try {
        const logs = await fetchLogs(id); // Fetch logs
        const logsSend = logs.map((log) => ({
            action: log.actionType,
            date: log.actionDate,
        }));
        res.status(200).json(logsSend); // Send the logs back to the client
    } catch (err) {
        console.error('Error fetching logs:', err.message);
        res.status(500).send('Failed to fetch logs.');
    }
};



module.exports = {
    handleNotification,
}