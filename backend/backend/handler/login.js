const { fetchUserFromEmail } = require('../models/users');


const handleLogin = async (req, res,) => {
    const {email, password} = req.body;

    try {
        const user = await fetchUserFromEmail(email);
        if (!user){
            return res.status(404).json({message: 'User not Found'});
        }

        if (user.password !== password){
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.status(200).json({
            message: 'Login successful',
            userID: user.userID,
        });
    } catch(err){
        console.error('Error during login:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    handleLogin,
}