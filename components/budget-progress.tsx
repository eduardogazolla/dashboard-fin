import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function BudgetProgress() {
  const categories = [
    { name: "Housing", current: 1200, max: 1200, percentage: 100 },
    { name: "Food", current: 450, max: 500, percentage: 90 },
    { name: "Transportation", current: 200, max: 300, percentage: 67 },
    { name: "Entertainment", current: 180, max: 200, percentage: 90 },
    { name: "Utilities", current: 150, max: 200, percentage: 75 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Your spending against monthly budget</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  ${category.current} / ${category.max}
                </span>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

