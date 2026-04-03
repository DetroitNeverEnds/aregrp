import { api } from '../../base/api';
import type { FeedbackCreateIn, FeedbackOut } from './types';

export const createFeedback = api.post<FeedbackCreateIn, FeedbackOut>('/feedback/');

export type * from './types';
