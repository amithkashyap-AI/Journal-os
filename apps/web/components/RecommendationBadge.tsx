import type { ReviewRecommendation } from "@rpos/types";
import { RecommendationBadge as UiRecommendationBadge } from "@rpos/ui";

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: ReviewRecommendation | null;
}) {
  return <UiRecommendationBadge recommendation={recommendation} size="sm" />;
}
