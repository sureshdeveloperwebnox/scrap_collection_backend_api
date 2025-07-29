import { NotificationType } from './enum';

export interface INotification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
} 