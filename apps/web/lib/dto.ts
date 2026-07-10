import type { ReviewRecommendation, SubmissionStatus } from "@rpos/types";

export interface SubmissionDto {
  id: string;
  journalId: string;
  authorId: string;
  title: string;
  abstract: string;
  keywords: string[];
  status: SubmissionStatus;
  manuscriptUrl: string | null;
  doi: string | null;
  submittedAt: string | null;
  createdAt: string;
}

export interface ReviewDto {
  id: string;
  submissionId: string;
  reviewerId: string;
  recommendation: ReviewRecommendation | null;
  comments: string | null;
  dueAt: string | null;
  submittedAt: string | null;
  createdAt: string;
}
