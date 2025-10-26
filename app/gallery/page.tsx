"use client"

import { useState, useEffect, useMemo } from "react"
import ImageGallery from "@/components/image-gallery"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Send } from "lucide-react"
import Link from "next/link"
import SearchBar from "@/components/search-bar"
import { useSearchParams } from "next/navigation"

interface GalleryImage {
  id: string
  url: string
  title: string
  alt: string
  uploadedAt: string
  isAlbum?: boolean
  albumImages?: string[]
  albumCount?: number
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const searchParams = useSearchParams()
  const postId = searchParams.get('post')
  const platform = searchParams.get('platform')

  useEffect(() => {
    // Auto-select platform folder if coming from a specific post
    if (platform && platform !== selectedFolder) {
      setSelectedFolder(platform)
    } else {
      fetchImages()
    }
  }, [selectedFolder, platform])

  useEffect(() => {
    // Fetch images when platform changes
    if (platform && platform !== selectedFolder) {
      setSelectedFolder(platform)
    }
  }, [platform])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/gallery?folder=${selectedFolder}`)
      const data = await response.json()
      setImages(data.images || [])
    } catch (error) {
      console.error("Error fetching images:", error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const folders = [
    { id: "all", label: "All Images" },
    { id: "chamet", label: "Chamet" },
    { id: "tango", label: "Tango" },
    { id: "viral", label: "Viral" },
    { id: "other", label: "Other" },
  ]

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images
    
    const searchLower = searchQuery.toLowerCase()
    return images.filter((image) => 
      image.title.toLowerCase().includes(searchLower) ||
      image.alt.toLowerCase().includes(searchLower) ||
      (image.isAlbum && 'album'.includes(searchLower))
    )
  }, [images, searchQuery])

  // Scroll to specific post if postId is provided
  useEffect(() => {
    if (postId && filteredImages.length > 0) {
      // Find the post with matching ID and scroll to it
      const postElement = document.getElementById(`post-${postId}`)
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add highlight effect
        postElement.classList.add('ring-2', 'ring-accent', 'ring-opacity-50')
        setTimeout(() => {
          postElement.classList.remove('ring-2', 'ring-accent', 'ring-opacity-50')
        }, 3000)
      }
    }
  }, [postId, filteredImages])

  const telegramLink = "https://t.me/your_channel_here"

  const handleHeaderClick = () => {
    window.open(telegramLink, "_blank")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Feed Hub Header - Same style as home screen */}
      <div
        onClick={handleHeaderClick}
        className="backdrop-blur-md bg-white/30 dark:bg-white/25 border border-white/60 dark:border-white/50 border-b sticky top-0 z-50 cursor-pointer hover:bg-white/40 dark:hover:bg-white/30 transition-all duration-300 shadow-xl"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          minHeight: '80px'
        }}
      >
        <div className="w-full px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-accent font-semibold truncate drop-shadow-md">
                leakurge
              </h1>
              <p className="text-muted-foreground/90 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate font-medium">
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


      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Image Gallery</h1>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Folder Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? "default" : "outline"}
                onClick={() => setSelectedFolder(folder.id)}
              >
                {folder.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Search Bar - Below Folder Filter */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Gallery Component */}
        <ImageGallery images={filteredImages} isLoading={loading} />
      </div>
    </main>
  )
}
