"use client"

import { useEffect, useRef, useState } from "react"
import { getSpendingTrends } from "@/app/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TrendData = {
  date: string
  amount: number
}

export function SpendingTrends() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("6months")
  const [category, setCategory] = useState("all")

  const periods = [
    { value: "30days", label: "Últimos 30 dias" },
    { value: "3months", label: "Últimos 3 meses" },
    { value: "6months", label: "Últimos 6 meses" },
    { value: "1year", label: "Último ano" },
  ]

  const categories = [
    { value: "all", label: "Todas categorias" },
    { value: "Food", label: "Alimentação" },
    { value: "Housing", label: "Moradia" },
    { value: "Transportation", label: "Transporte" },
    { value: "Entertainment", label: "Entretenimento" },
    { value: "Utilities", label: "Serviços" },
  ]

  useEffect(() => {
    async function loadTrendData() {
      try {
        setLoading(true)
        const data = await getSpendingTrends(period, category)
        setTrendData(data)
      } catch (error) {
        console.error("Failed to load trend data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTrendData()
  }, [period, category])

  useEffect(() => {
    if (trendData.length === 0 || !canvasRef.current) return

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
    const maxValue = Math.max(...trendData.map((d) => d.amount)) * 1.1 // Add 10% padding

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#94a3b8"
    ctx.stroke()

    // Draw line
    if (trendData.length > 1) {
      ctx.beginPath()
      trendData.forEach((data, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth
        const y = height - padding - (data.amount / maxValue) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw points
      trendData.forEach((data, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth
        const y = height - padding - (data.amount / maxValue) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = "#3b82f6"
        ctx.fill()
      })
    }

    // Draw x-axis labels (dates)
    ctx.fillStyle = "#64748b"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"

    // Only show a subset of labels to avoid overcrowding
    const labelStep = Math.max(1, Math.floor(trendData.length / 6))

    trendData.forEach((data, index) => {
      if (index % labelStep === 0 || index === trendData.length - 1) {
        const x = padding + (index / (trendData.length - 1)) * chartWidth
        const date = new Date(data.date)
        const formattedDate = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        })

        ctx.fillText(formattedDate, x, height - padding + 20)
      }
    })

    // Draw y-axis labels (amounts)
    ctx.textAlign = "right"
    const yLabelCount = 5
    for (let i = 0; i <= yLabelCount; i++) {
      const value = (maxValue / yLabelCount) * i
      const y = height - padding - (value / maxValue) * chartHeight

      ctx.fillText(`$${value.toFixed(0)}`, padding - 10, y + 4)

      // Draw horizontal grid line
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.strokeStyle = "#e2e8f0"
      ctx.stroke()
    }
  }, [trendData])

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
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative h-[400px] w-full">
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-full"></canvas>
      </div>

      {trendData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível para os filtros selecionados</p>
        </div>
      )}
    </div>
  )
}

