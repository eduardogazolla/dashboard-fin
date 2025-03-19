"use client"

import { useEffect, useRef, useState } from "react"
import { getExpenseBreakdown } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ExpenseCategory = {
  label: string
  value: number
  color: string
}

// Color palette for the chart
const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b", "#06b6d4", "#84cc16"]

export function ExpenseBreakdown() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadExpenseData() {
      try {
        const data = await getExpenseBreakdown()

        // Assign colors to categories
        const categoriesWithColors = data.map((item, index) => ({
          ...item,
          color: colors[index % colors.length],
        }))

        setCategories(categoriesWithColors)
      } catch (error) {
        console.error("Failed to load expense breakdown:", error)
      } finally {
        setLoading(false)
      }
    }

    loadExpenseData()
  }, [])

  useEffect(() => {
    if (categories.length === 0 || !canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Calculate total
    const total = categories.reduce((sum, item) => sum + item.value, 0)

    // Draw the pie chart
    let startAngle = 0
    const centerX = canvasRef.current.width / 2
    const centerY = canvasRef.current.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    categories.forEach((item) => {
      const sliceAngle = (2 * Math.PI * item.value) / total

      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      startAngle += sliceAngle
    })

    // Draw a white circle in the middle for a donut chart
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI)
    ctx.fill()
  }, [categories])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Your spending by category this month</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="h-60 w-60 bg-muted rounded-full animate-pulse"></div>
          <div className="mt-4 grid grid-cols-2 gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no data, show a message
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Your spending by category this month</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-60">
          <p className="text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate total for percentages
  const total = categories.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Your spending by category this month</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-60 w-60">
          <canvas ref={canvasRef} width={240} height={240}></canvas>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <div key={category.label} className="flex items-center">
              <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
              <span className="text-sm">
                {category.label} ({Math.round((category.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

