import { Router } from 'express';
import authRoutes from './authRoutes';
import businessRoutes from './businessRoutes';
import franchiseRoutes from './franchiseRoutes';
import applicationRoutes from './applicationRoutes';
import investorRoutes from './investorRoutes';
import documentRoutes from './documentRoutes';
import adminRoutes from './adminRoutes';
import meetingRoutes from './meetingRoutes';
import publicRoutes from './publicRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/franchises', franchiseRoutes);
router.use('/applications', applicationRoutes);
router.use('/investors', investorRoutes);
router.use('/documents', documentRoutes);
router.use('/admin', adminRoutes);
router.use('/meetings', meetingRoutes);
router.use('/public', publicRoutes);

export default router;
