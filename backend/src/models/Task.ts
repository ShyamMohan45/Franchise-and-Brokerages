import { Schema, model, Document, Types } from 'mongoose';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ITask extends Document {
  title: string;
  description?: string;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  relatedDeal?: Types.ObjectId;
  relatedLead?: Types.ObjectId;
  relatedBusiness?: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  completedAt?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relatedDeal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      index: true,
    },
    relatedLead: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      index: true,
    },
    relatedBusiness: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });

export const Task = model<ITask>('Task', taskSchema);
