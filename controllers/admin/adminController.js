const AdminUser = require('../../models/AdminUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailService = require('../../services/mailer');
const { getLocalIPInfo } = require('../../utils/ipinfo');
const generateUsername = require('../../utils/generateUsername');

const register = async (req, res) => {
    const {name, email, password } = req.body;

    try {
        const existingUser = await AdminUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const username = generateUsername();
        const user = new AdminUser({
            username: username,
            name,
            email,
            password: hashedPassword
        });

        await user.save();
        await mailService.sendWelcomeEmail(email, name);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

const login = async (req, res) => {
   
    const { user, password } = req.body;

    try {
        const userExist = await AdminUser.findOne({$or: [ { email:user},{username:user}]});
        if (!userExist) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
           const payload = {
            user: {
                id: userExist.id,
                role: userExist.role
            }
        };

    
     

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
       // await mailService.sendLoginAlertEmail(userExist.email, userExist.name, new Date());
       
        await getLocalIPInfo();
        res.json({ status: 'success', message: 'Login successful' , token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await AdminUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        await mailService.sendPasswordResetEmail(email, user.name, resetLink);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
}
const resetPassword = async (req, res) => {
    const { newPassword } = req.body;

    try {
        const user = await AdminUser.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
          await mailService.sendResetConfirmationEmail(user.email, user.name);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
}

module.exports = {
     register,
    login,
    forgotPassword,
    resetPassword
};