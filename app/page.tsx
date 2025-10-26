"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FeedSection from "@/components/feed-section"
import AllPostsSection from "@/components/all-posts-section"
import Navigation from "@/components/navigation"
import SearchBar from "@/components/search-bar"
import { Send } from "lucide-react"

type Platform = "chamet" | "tango" | "viral" | "other"

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const platforms: { id: Platform; label: string; color: string }[] = [
    { id: "chamet", label: "Chamet", color: "bg-blue-500" },
    { id: "tango", label: "Tango", color: "bg-purple-500" },
    { id: "viral", label: "Viral", color: "bg-red-500" },
    { id: "other", label: "Other", color: "bg-gray-500" },
  ]

  const telegramLink = "https://t.me/your_channel_here"

  const handleHeaderClick = () => {
    window.open(telegramLink, "_blank")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <div
        onClick={handleHeaderClick}
        className="backdrop-blur-md bg-white/15 dark:bg-white/10 border border-white/30 dark:border-white/20 border-b sticky top-0 z-50 cursor-pointer hover:bg-white/20 dark:hover:bg-white/12 transition-all duration-300 shadow-lg"
      >
        <div className="w-full px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-accent font-semibold truncate drop-shadow-md">
                leakurge
              </h1>
              <p className="text-muted-foreground/80 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate font-medium">
                Join Premium Group
              </p>
            </div>
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg backdrop-blur-md bg-accent/10 dark:bg-accent/10 border border-accent/30 dark:border-accent/30 hover:bg-accent/20 dark:hover:bg-accent/20 transition-colors text-accent font-bold text-xs sm:text-sm whitespace-nowrap flex-shrink-0 shadow-md hover:shadow-lg"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Join Premium</span>
            </a>
          </div>
        </div>
      </div>

      <Navigation selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="w-full py-3 sm:py-4 md:py-8 px-3 sm:px-4">
        <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-3 sm:mb-4 md:mb-6 backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-xs sm:text-sm h-auto p-1">
            <TabsTrigger
              value="all"
              className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:text-[#D4AF37] data-[state=active]:font-bold hover:text-[#E5C158] transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D4AF37] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
            >
              All
            </TabsTrigger>
            {platforms.map((platform) => (
              <TabsTrigger
                key={platform.id}
                value={platform.id}
                className="text-xs sm:text-sm py-1.5 sm:py-2 data-[state=active]:text-[#D4AF37] data-[state=active]:font-bold hover:text-[#E5C158] transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D4AF37] after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {platform.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <AllPostsSection
              selectedDate={selectedDate}
              searchQuery={searchQuery}
            />
          </TabsContent>
          {platforms.map((platform) => (
            <TabsContent key={platform.id} value={platform.id}>
              <FeedSection
                platform={platform.id}
                selectedDate={selectedDate}
                searchQuery={searchQuery}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  )
}
