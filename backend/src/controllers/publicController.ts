import { Request, Response } from 'express';
import { ContactEnquiry } from '../models/ContactEnquiry';
import { BlogPost } from '../models/BlogPost';
import { PlatformSettings } from '../models/PlatformSettings';
import { FranchiseListing } from '../models/FranchiseListing';
import { sendSuccess, sendError } from '../utils/response';

export async function submitContactEnquiry(req: Request, res: Response): Promise<any> {
  const enquiry = await ContactEnquiry.create(req.body);
  return sendSuccess(res, enquiry, 'Thank you! Your enquiry has been received. Our brokerage team will contact you shortly.', 201);
}

export async function getBlogPosts(req: Request, res: Response): Promise<any> {
  const category = req.query.category as string;
  const filter: any = { isPublished: true };
  if (category && category !== 'All') filter.category = category;

  const posts = await BlogPost.find(filter).sort({ publishedAt: -1 });
  return sendSuccess(res, posts);
}

export async function getBlogPostBySlug(req: Request, res: Response): Promise<any> {
  const { slug } = req.params;
  const post = await BlogPost.findOne({ slug, isPublished: true });
  if (!post) {
    return sendError(res, 'Article not found', 404);
  }
  return sendSuccess(res, post);
}

export async function getPublicStats(req: Request, res: Response): Promise<any> {
  const [totalListings, categoriesCount] = await Promise.all([
    FranchiseListing.countDocuments({ status: 'published' }),
    FranchiseListing.distinct('industry', { status: 'published' }),
  ]);

  return sendSuccess(res, {
    totalFranchises: totalListings,
    totalIndustries: categoriesCount.length,
    activeExpansionCities: 45,
    averageDealSuccessRate: '92%',
  });
}
