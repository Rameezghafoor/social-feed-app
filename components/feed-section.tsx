"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Calendar, ImageIcon } from "lucide-react"
import LightboxAlbum from "@/components/lightbox-album"

interface Post {
  id: string
  title: string
  content: string
  platform: "chamet" | "tango" | "viral" | "other"
  author: string
  timestamp: string
  likes: number
  comments: number
  views: number
  images?: string[]
  caption?: string
  isAlbum?: boolean
}

interface FeedSectionProps {
  platform: "chamet" | "tango" | "viral" | "other"
  selectedDate: Date | string
  searchQuery: string
}

const platformColors: Record<string, { bg: string; text: string; heading: string }> = {
  chamet: { bg: "bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", heading: "text-accent" },
  tango: { bg: "bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", heading: "text-accent" },
  viral: { bg: "bg-red-500/20", text: "text-red-600 dark:text-red-400", heading: "text-accent" },
  other: { bg: "bg-gray-500/20", text: "text-gray-600 dark:text-gray-400", heading: "text-accent" },
}

export default function FeedSection({ platform, selectedDate, searchQuery }: FeedSectionProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [platform, selectedDate])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let dateParam = "all"
      
      if (selectedDate === "all") {
        dateParam = "all"
      } else if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        // Only format if it's a valid Date object
        dateParam = format(selectedDate, "yyyy-MM-dd")
      } else if (typeof selectedDate === "string" && selectedDate !== "all") {
        // If it's a string but not "all", try to parse it as a date
        const parsedDate = new Date(selectedDate)
        if (!isNaN(parsedDate.getTime())) {
          dateParam = format(parsedDate, "yyyy-MM-dd")
        }
      }
      
      const response = await fetch(`/api/cached-posts?platform=${platform}&date=${dateParam}`)
      const data = await response.json()
      setPosts(data.posts || [])
      console.log(`Posts loaded from ${data.cached ? 'cache' : 'API'}`)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.caption?.toLowerCase().includes(searchLower) ||
        post.author.toLowerCase().includes(searchLower)
      )
    })
  }, [posts, searchQuery])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl text-center">
        <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
        <p className="text-xs sm:text-sm text-muted-foreground">
          {searchQuery ? "No posts match your search" : selectedDate === "all" ? `No posts found for ${platform}` : `No posts found for ${platform} on this date`}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6">
      <div className="mb-2 sm:mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-accent capitalize drop-shadow-lg">{platform}</h2>
        <div className="h-1 w-12 bg-gradient-to-r from-accent to-accent/50 rounded-full mt-2"></div>
      </div>

      {filteredPosts.map((post) => {
        // Get platform colors with fallback to 'other' if platform not found
        const colors = platformColors[platform] || platformColors['other']
        
        return (
          <div
            key={post.id}
            className="backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-accent/30"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{post.author}</h3>
                  <Badge className={`${colors.bg} ${colors.text} border-0 text-xs`}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Badge>
                  {post.isAlbum && (
                    <Badge className="bg-accent/20 text-accent border-0 flex items-center gap-1 text-xs">
                      <ImageIcon className="h-3 w-3" />
                      Album
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    try {
                      const date = new Date(post.timestamp)
                      if (isNaN(date.getTime())) {
                        return 'Invalid Date'
                      }
                      return date.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })
                    } catch (error) {
                      return 'Invalid Date'
                    }
                  })()}
                </p>
              </div>
            </div>

            {post.title && <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-accent">{post.title}</h2>}

            <p className="text-xs sm:text-sm md:text-base text-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-3">
              {post.content}
            </p>

            {post.images && post.images.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <LightboxAlbum images={post.images} caption={post.caption} title={post.title} isAlbum={post.isAlbum} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
