const validateRegister = (req, res, next) => {

    if (!req.body) {
        return res.status(400).json({ message: 'Request body is missing' });
    }
    const errors = [];
    const {  email, password, name } = req.body;
    if (!name || typeof name !== 'string' || name.length < 2) {
        errors.push('Name must be at least 2 characters long.');
    }

 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Invalid email format.');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters long.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};
const validateLogin = (req, res, next) => {
     if (!req.body) {
        return res.status(400).json({ message: 'Request body is missing' });
    }
    const errors = [];
    const { user, password } = req.body;

    if (!user || typeof user !== 'string' || user.length < 3) {
        errors.push('Invalid username or email format.');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters long.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};
module.exports = {
    validateRegister,
    validateLogin
};