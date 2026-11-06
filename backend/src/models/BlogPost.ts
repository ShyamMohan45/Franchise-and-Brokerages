import { Schema, model, Document, Types } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  coverImageUrl?: string;
  readTimeMinutes: number;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorRole: {
      type: String,
      default: 'Franchise Strategist',
    },
    coverImageUrl: {
      type: String,
    },
    readTimeMinutes: {
      type: Number,
      default: 5,
    },
    tags: [{ type: String }],
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BlogPost = model<IBlogPost>('BlogPost', blogPostSchema);
