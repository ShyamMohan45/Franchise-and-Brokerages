import { Router } from 'express';
import { submitContactEnquiry, getBlogPosts, getBlogPostBySlug, getPublicStats } from '../controllers/publicController';

const router = Router();

router.post('/contact', submitContactEnquiry);
router.get('/blog', getBlogPosts);
router.get('/blog/:slug', getBlogPostBySlug);
router.get('/stats', getPublicStats);

export default router;
