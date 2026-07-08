import type { ReviewRecommendation } from "@rpos/types";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

const RECOMMENDATION_STYLES: Record<ReviewRecommendation, string> = {
  ACCEPT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  MINOR_REVISION: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  MAJOR_REVISION: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  REJECT: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: ReviewRecommendation | null;
}) {
  if (!recommendation) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Pending
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", RECOMMENDATION_STYLES[recommendation])}
    >
      {recommendation.replaceAll("_", " ")}
    </Badge>
  );
}
