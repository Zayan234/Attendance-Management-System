import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AttendanceStatsProps {
  title: string
  value: string
  description: string
  trend: "increase" | "decrease" | "neutral"
  className?: string
}

export function AttendanceStats({ title, value, description, trend, className }: AttendanceStatsProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend === "increase" && <ArrowUpIcon className="h-4 w-4 text-green-500" />}
        {trend === "decrease" && <ArrowDownIcon className="h-4 w-4 text-red-500" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
