"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

interface DateFilterBarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onShortcut: (days: number) => void
}

export default function DateFilterBar({ selectedDate, onDateChange, onShortcut }: DateFilterBarProps) {
  const shortcuts = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
  ]

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">{format(selectedDate, "MMMM d, yyyy")}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {shortcuts.map((shortcut) => (
            <Button
              key={shortcut.days}
              variant={
                shortcut.days === 0 && format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => onShortcut(shortcut.days)}
            >
              {shortcut.label}
            </Button>
          ))}
        </div>

        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
        />
      </div>
    </Card>
  )
}
