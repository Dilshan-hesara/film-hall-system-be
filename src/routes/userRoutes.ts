import express from 'express';
import { updateProfile, changePassword ,getAllUsers , updateUserRole ,deleteUser, createAdmin, getAllAdmins, adminResetPassword ,toggleWishlist,getWishlist } from '../controllers/userController';

const router = express.Router();

router.put('/profile', updateProfile); // PUT: /api/v1/users/profile
router.put('/password', changePassword); // PUT: /api/v1/users/password


router.get('/all', getAllUsers);
router.put('/role/:id', updateUserRole);
router.delete('/:id', deleteUser);

router.post('/admin/create', createAdmin);
router.put('/admin/reset-password/:id', adminResetPassword);
router.get('/admin/all', getAllAdmins);



// ...
router.put('/wishlist/toggle', toggleWishlist); // PUT Request
router.get('/wishlist/:id', getWishlist);       // GET Request



export default router;