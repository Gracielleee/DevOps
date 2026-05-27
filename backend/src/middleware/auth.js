//auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user-profile.js';
import LearningMaterial from '../models/learning-material.js';
import logger from '../logger.js';

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

const optionalAuthentication = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
       authenticate(req, res, next);
    } else {
        next();
    }
};

//Ownership Middleware
const isMaterialOwner = async (req, res, next) => {
    try {
        const material = await LearningMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        // Validate Ownership
        logger.debug(`Checking ownership for user ${req.user.id} on material ${material._id} owned by ${material.owner}`, { file: 'auth.js' });
        if (material.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // 💡 CRITICAL STEP: Attach the document to the request object 
        // so the subsequent controller doesn't have to query the DB again!
        req.material = material;
        next();
    } catch (error) {
        next(error);
    }
};

export { authenticate, optionalAuthentication, isMaterialOwner };