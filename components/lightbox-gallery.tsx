"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon } from "lucide-react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

interface GalleryImage {
  id: string
  url: string
  title: string
  alt: string
  uploadedAt: string
  isAlbum?: boolean
  albumImages?: string[]
  albumCount?: number
  author?: string
  platform?: string
  content?: string
  caption?: string
}

interface LightboxGalleryProps {
  images?: GalleryImage[]
  isLoading?: boolean
}

export default function LightboxGallery({ images = [], isLoading = false }: LightboxGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [showSwipeHint, setShowSwipeHint] = useState(false)

  // Show swipe hint on mobile when lightbox opens
  useEffect(() => {
    if (lightboxOpen) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
      if (isMobile) {
        setShowSwipeHint(true)
        const timer = setTimeout(() => setShowSwipeHint(false), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [lightboxOpen])

  // Touch handlers for custom swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return
    
    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchEnd.y - touchStart.y
    const minSwipeDistance = 30 // Reduced threshold for minor swipes
    const minVerticalSwipe = 80 // Higher threshold for closing

    // Handle horizontal swipes for navigation (minor swipes)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      e.preventDefault()
      if (deltaX > 0) {
        // Swipe left - next image
        setLightboxIndex((prev) => (prev + 1) % getCurrentSlides().length)
      } else {
        // Swipe right - previous image
        setLightboxIndex((prev) => (prev - 1 + getCurrentSlides().length) % getCurrentSlides().length)
      }
    }
    // Handle vertical swipes for closing
    else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minVerticalSwipe) {
      e.preventDefault()
      setLightboxOpen(false)
    }
    
    // Reset touch states
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Handle album images - create slides for albums
  const createAlbumSlides = (image: GalleryImage) => {
    if (image.isAlbum && image.albumImages) {
      return image.albumImages.map((img, index) => ({
        src: img,
        alt: `${image.title} - Image ${index + 1}`,
        title: image.title,
        description: image.caption || image.content || `By ${image.author || 'leakurge DEMO'}`,
      }))
    }
    return [{
      src: image.url,
      alt: image.alt,
      title: image.title,
      description: image.caption || image.content || `By ${image.author || 'leakurge DEMO'}`,
    }]
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No images available</p>
      </Card>
    )
  }

  // Get current slides based on selected image
  const getCurrentSlides = () => {
    if (lightboxOpen && images[lightboxIndex]) {
      return createAlbumSlides(images[lightboxIndex])
    }
    return []
  }

  // Platform colors
  const platformColors: Record<string, { bg: string; text: string }> = {
    chamet: { bg: "bg-blue-500", text: "text-white" },
    tango: { bg: "bg-purple-500", text: "text-white" },
    viral: { bg: "bg-red-500", text: "text-white" },
    other: { bg: "bg-gray-500", text: "text-white" },
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => {
          const colors = platformColors[image.platform || 'other'] || platformColors['other']
          
          return (
            <Card
              key={image.id}
              className="backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-accent/30 cursor-pointer"
              onClick={() => {
                // Create slides for this specific image/album
                const slides = createAlbumSlides(image)
                setLightboxIndex(0) // Always start from first image of the album
                setLightboxOpen(true)
              }}
            >
              {/* Post Header - Same as home page */}
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{image.author || 'leakurge DEMO'}</h3>
                    <Badge className={`${colors.bg} ${colors.text} border-0 text-xs`}>
                      {(image.platform || 'other').charAt(0).toUpperCase() + (image.platform || 'other').slice(1)}
                    </Badge>
                    {image.isAlbum && (
                      <Badge className="bg-accent/20 text-accent border-0 flex items-center gap-1 text-xs">
                        <ImageIcon className="h-3 w-3" />
                        Album
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{image.uploadedAt}</p>
                </div>
              </div>

              {/* Post Title - Same as home page */}
              {image.title && <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-accent">{image.title}</h2>}

              {/* Post Content - Same as home page */}
              {image.content && (
                <p className="text-xs sm:text-sm md:text-base text-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                  {image.content}
                </p>
              )}
              
              {/* Image Display - Grid for albums, single for regular images */}
              {image.isAlbum && image.albumImages && image.albumImages.length > 1 ? (
                // Album Grid Display
                <div className="grid grid-cols-2 gap-1 mb-3 sm:mb-4">
                  {image.albumImages.slice(0, 4).map((albumImg, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
                    >
                      <Image
                        src={albumImg || "/placeholder.svg"}
                        alt={`${image.title} - Image ${imgIndex + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        quality={85}
                      />
                      {/* Show +X overlay on last visible image */}
                      {imgIndex === 3 && image.albumImages.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            +{image.albumImages.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Single Image Display
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden mb-3 sm:mb-4 group">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    quality={85}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 dark:bg-black/90 rounded-full p-3">
                        <ImageIcon className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Caption */}
              {image.caption && (
                <p className="text-xs text-muted-foreground italic line-clamp-2">{image.caption}</p>
              )}
            </Card>
          )
        })}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex} // Use lightboxIndex for custom navigation
        slides={getCurrentSlides()}
        carousel={{
          finite: true,
        }}
        render={{
          slide: ({ slide, rect }) => (
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  maxWidth: rect.width,
                  maxHeight: rect.height,
                }}
                draggable={false}
              />
              
              {/* Swipe hints */}
              {showSwipeHint && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                  Swipe left/right to navigate • Swipe down to close
                </div>
              )}
            </div>
          ),
        }}
        plugins={[]}
      />
    </>
  )
}
