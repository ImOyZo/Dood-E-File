const { handleLoginLogs } = require('./handlers/loginLogs');

// Route to fetch login logs
app.get('/login-logs', async (req, res) => {
    await handleLoginLogs(req, res);
});
