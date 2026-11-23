import { type ElementType, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ElementType;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        {Icon ? <Icon className="text-muted-foreground h-8 w-8" /> : null}
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="text-muted-foreground max-w-md text-sm">{description}</p>
        ) : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
