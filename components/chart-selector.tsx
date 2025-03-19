"use client"

import { useState } from "react"
import { BarChart, LineChart, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseBreakdown } from "./expense-breakdown"
import { MonthlyComparison } from "./monthly-comparison"
import { SpendingTrends } from "./spending-trends"
import { BudgetComparison } from "./budget-comparison"

export function ChartSelector() {
  const [activeChart, setActiveChart] = useState("category")

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Análise Financeira</CardTitle>
            <CardDescription>Visualize seus dados financeiros de diferentes maneiras</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="category" value={activeChart} onValueChange={setActiveChart} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger value="category" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Por Categoria</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Mensal</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Tendências</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Orçamento</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="space-y-4">
            <ExpenseBreakdown />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <MonthlyComparison />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <SpendingTrends />
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <BudgetComparison />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

