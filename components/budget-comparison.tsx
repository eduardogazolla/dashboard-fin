"use client"

import { useEffect, useRef, useState } from "react"
import { getBudgetComparison } from "@/app/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BudgetData = {
  category: string
  budget: number
  actual: number
}

export function BudgetComparison() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [budgetData, setBudgetData] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth().toString())
  const [year, setYear] = useState(new Date().getFullYear().toString())

  const months = [
    { value: "0", label: "Janeiro" },
    { value: "1", label: "Fevereiro" },
    { value: "2", label: "Março" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Maio" },
    { value: "5", label: "Junho" },
    { value: "6", label: "Julho" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Setembro" },
    { value: "9", label: "Outubro" },
    { value: "10", label: "Novembro" },
    { value: "11", label: "Dezembro" },
  ]

  const years = [new Date().getFullYear().toString(), (new Date().getFullYear() - 1).toString()]

  useEffect(() => {
    async function loadBudgetData() {
      try {
        setLoading(true)
        const data = await getBudgetComparison(Number.parseInt(month), Number.parseInt(year))
        setBudgetData(data)
      } catch (error) {
        console.error("Failed to load budget data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBudgetData()
  }, [month, year])

  useEffect(() => {
    if (budgetData.length === 0 || !canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Chart dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 60
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding

    // Find max value for scaling
    const maxValue = Math.max(...budgetData.flatMap((d) => [d.budget, d.actual])) * 1.1 // Add 10% padding

    // Bar width
    const barCount = budgetData.length * 2 // Budget and actual for each category
    const barWidth = (chartWidth / barCount) * 0.8
    const groupWidth = chartWidth / budgetData.length

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#94a3b8"
    ctx.stroke()

    // Draw bars
    budgetData.forEach((data, index) => {
      const x = padding + index * groupWidth + groupWidth / 2

      // Budget bar
      const budgetHeight = (data.budget / maxValue) * chartHeight
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(x - barWidth - 2, height - padding - budgetHeight, barWidth, budgetHeight)

      // Actual bar
      const actualHeight = (data.actual / maxValue) * chartHeight
      ctx.fillStyle = data.actual > data.budget ? "#ef4444" : "#22c55e"
      ctx.fillRect(x + 2, height - padding - actualHeight, barWidth, actualHeight)

      // Category label
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.save()
      ctx.translate(x, height - padding + 10)
      ctx.rotate(-Math.PI / 4)
      ctx.fillText(data.category, 0, 0)
      ctx.restore()
    })

    // Draw legend
    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(width - padding - 100, padding, 12, 12)
    ctx.fillStyle = "#22c55e"
    ctx.fillRect(width - padding - 100, padding + 20, 12, 12)
    ctx.fillStyle = "#ef4444"
    ctx.fillRect(width - padding - 100, padding + 40, 12, 12)

    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Orçamento", width - padding - 80, padding + 10)
    ctx.fillText("Abaixo do orçamento", width - padding - 80, padding + 30)
    ctx.fillText("Acima do orçamento", width - padding - 80, padding + 50)
  }, [budgetData])

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <div className="h-[400px] w-full bg-muted rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-end gap-4 mb-4">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]">
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

      {budgetData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado de orçamento disponível para o período selecionado</p>
        </div>
      )}
    </div>
  )
}

