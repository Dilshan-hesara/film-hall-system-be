import express from 'express';
import { updateProfile, changePassword ,getAllUsers , updateUserRole ,deleteUser } from '../controllers/userController';

const router = express.Router();

router.put('/profile', updateProfile); // PUT: /api/v1/users/profile
router.put('/password', changePassword); // PUT: /api/v1/users/password


router.get('/all', getAllUsers);
router.put('/role/:id', updateUserRole);
router.delete('/:id', deleteUser);

export default router;