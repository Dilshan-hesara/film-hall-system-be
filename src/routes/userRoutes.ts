import express from 'express';
import { updateProfile, changePassword ,getAllUsers , updateUserRole ,deleteUser, createAdmin, getAllAdmins, adminResetPassword ,toggleWishlist,getWishlist } from '../controllers/userController';
import { chatWithAI } from '../controllers/chatController';

const router = express.Router();

router.put('/profile', updateProfile); 
router.put('/password', changePassword);


router.get('/all', getAllUsers);
router.put('/role/:id', updateUserRole);
router.delete('/:id', deleteUser);

router.post('/admin/create', createAdmin);
router.put('/admin/reset-password/:id', adminResetPassword);
router.get('/admin/all', getAllAdmins);

router.post('/chat', chatWithAI);


router.put('/wishlist/toggle', toggleWishlist); 
router.get('/wishlist/:id', getWishlist);      


export default router;