"use client"

import { format, subDays, startOfDay, parse, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface NavigationProps {
  selectedDate: Date | string
  onDateChange: (date: Date) => void
}

export default function Navigation({ selectedDate, onDateChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const validDate = (() => {
    if (!selectedDate) return new Date()
    if (selectedDate instanceof Date && isValid(selectedDate)) return selectedDate
    if (typeof selectedDate === "string") {
      const parsed = parse(selectedDate, "yyyy-MM-dd", new Date())
      return isValid(parsed) ? parsed : new Date()
    }
    return new Date()
  })()

  const shortcuts = [
    { label: "All", days: -1 },
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
  ]

  const handleDateShortcut = (days: number) => {
    if (days === -1) {
      onDateChange("all" as unknown as Date)
      return
    }
    if (days === 7) {
      onDateChange("last-7" as unknown as Date)
      return
    }
    if (days === 30) {
      onDateChange("last-30" as unknown as Date)
      return
    }
    if (days === 0) {
      onDateChange("today" as unknown as Date)
      return
    }
    if (days === 1) {
      onDateChange("yesterday" as unknown as Date)
      return
    }
    const newDate = subDays(startOfDay(new Date()), days)
    onDateChange(newDate)
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date)
      setIsOpen(false)
    }
  }

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-accent font-semibold drop-shadow-lg">Feed Hub</h2>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-accent/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                <span className="font-semibold text-accent">{format(validDate, "MMMM d, yyyy")}</span>
              </div>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:border-[#D4AF37]/50 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Pick Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-lg">
                  <div className="p-4">
                    <CalendarComponent
                      mode="single"
                      selected={validDate}
                      onSelect={handleCalendarSelect}
                      disabled={(date) => date > new Date()}
                      classNames={{
                        caption_label: "text-[#D4AF37] font-semibold",
                        weekday: "text-[#D4AF37] font-semibold",
                        day: "text-gray-700 hover:text-[#D4AF37]",
                        today: "bg-[#D4AF37] text-white font-bold",
                        selected: "bg-[#D4AF37] text-white font-bold",
                        outside: "text-gray-400",
                        disabled: "text-gray-300",
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
              {shortcuts.map((shortcut) => {
                let isActive = false
                // String keyword states
                if (shortcut.days === -1) {
                  isActive = selectedDate === "all"
                } else if (shortcut.days === 0) {
                  isActive = selectedDate === "today"
                } else if (shortcut.days === 1) {
                  isActive = selectedDate === "yesterday"
                } else if (shortcut.days === 7) {
                  isActive = selectedDate === "last-7"
                } else if (shortcut.days === 30) {
                  isActive = selectedDate === "last-30"
                }

                // Date instances (when user picks from calendar)
                if (!isActive && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
                  if (shortcut.days === 0) {
                    isActive = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  } else if (shortcut.days === 1) {
                    const y = new Date()
                    y.setDate(y.getDate() - 1)
                    isActive = format(selectedDate, "yyyy-MM-dd") === format(y, "yyyy-MM-dd")
                  }
                }

                return (
                  <button
                    key={shortcut.days}
                    onClick={() => handleDateShortcut(shortcut.days)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive ? "text-[#D4AF37] font-bold" : "text-foreground hover:text-[#E5C158]"
                    } backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:border-[#D4AF37]/50 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#D4AF37] after:scale-x-0 ${
                      isActive ? "after:scale-x-100" : "hover:after:scale-x-100"
                    } after:transition-transform after:duration-300 after:origin-left`}
                  >
                    {shortcut.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
