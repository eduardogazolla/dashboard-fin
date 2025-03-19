"use client"

import { useEffect, useRef, useState } from "react"
import { getMonthlyData } from "@/app/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type MonthlyData = {
  month: string
  income: number
  expenses: number
}

export function MonthlyComparison() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear().toString())

  const years = [
    new Date().getFullYear().toString(),
    (new Date().getFullYear() - 1).toString(),
    (new Date().getFullYear() - 2).toString(),
  ]

  useEffect(() => {
    async function loadMonthlyData() {
      try {
        setLoading(true)
        const data = await getMonthlyData(Number.parseInt(year))
        setMonthlyData(data)
      } catch (error) {
        console.error("Failed to load monthly data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMonthlyData()
  }, [year])

  useEffect(() => {
    if (monthlyData.length === 0 || !canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Chart dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Find max value for scaling
    const maxValue = Math.max(...monthlyData.map((d) => Math.max(d.income, d.expenses))) * 1.1 // Add 10% padding

    // Bar width
    const barCount = monthlyData.length * 2 // Income and expense for each month
    const barWidth = (chartWidth / barCount) * 0.8
    const groupWidth = chartWidth / monthlyData.length

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#94a3b8"
    ctx.stroke()

    // Draw bars
    monthlyData.forEach((data, index) => {
      const x = padding + index * groupWidth + groupWidth / 2

      // Income bar
      const incomeHeight = (data.income / maxValue) * chartHeight
      ctx.fillStyle = "#22c55e"
      ctx.fillRect(x - barWidth - 2, height - padding - incomeHeight, barWidth, incomeHeight)

      // Expense bar
      const expenseHeight = (data.expenses / maxValue) * chartHeight
      ctx.fillStyle = "#ef4444"
      ctx.fillRect(x + 2, height - padding - expenseHeight, barWidth, expenseHeight)

      // Month label
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(data.month.substring(0, 3), x, height - padding + 20)
    })

    // Draw legend
    ctx.fillStyle = "#22c55e"
    ctx.fillRect(width - padding - 100, padding, 12, 12)
    ctx.fillStyle = "#ef4444"
    ctx.fillRect(width - padding - 100, padding + 20, 12, 12)

    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Receita", width - padding - 80, padding + 10)
    ctx.fillText("Despesa", width - padding - 80, padding + 30)
  }, [monthlyData])

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <div className="h-[400px] w-full bg-muted rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-end mb-4">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative h-[400px] w-full">
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-full"></canvas>
      </div>

      {monthlyData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível para o ano selecionado</p>
        </div>
      )}
    </div>
  )
}

