"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ImageIcon, Video } from "lucide-react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
import { isVideoUrl } from "@/lib/utils"

interface LightboxAlbumProps {
  images: string[]
  caption?: string
  title?: string
  isAlbum?: boolean
}

export default function LightboxAlbum({ images, caption, title, isAlbum }: LightboxAlbumProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [showSwipeHint, setShowSwipeHint] = useState(false)

  // Touch handlers for custom swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchEnd.y - touchStart.y
    const minSwipeDistance = 40 // Balanced threshold for smooth swipes
    const minVerticalSwipe = 80 // Higher threshold for closing
    const maxSwipeDistance = 200 // Prevent overly sensitive swipes

    // Handle horizontal swipes for navigation with balanced sensitivity
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) < maxSwipeDistance) {
      e.preventDefault()
      
      // Add slight delay for smoother transition
      setTimeout(() => {
        if (deltaX > 0) {
          // Swipe left - next image
          setLightboxIndex((prev) => (prev + 1) % images.length)
        } else {
          // Swipe right - previous image  
          setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
        }
      }, 50) // Small delay for smoother experience
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

  // Create slides for lightbox
  const createAlbumSlides = () => {
    return images.map((image, index) => ({
      src: image,
      alt: `${title || 'Media'} - ${index + 1}`,
      type: isVideoUrl(image) ? 'video' : 'image',
    }))
  }

  const getCurrentSlides = () => {
    return createAlbumSlides()
  }

  if (!images || images.length === 0) return null

  // Single media display
  if (images.length === 1) {
    const isVideo = isVideoUrl(images[0])
    return (
      <div className="w-full">
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden mb-3 sm:mb-4 group">
          {isVideo ? (
            <video
              src={images[0]}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => {
                setLightboxIndex(0)
                setLightboxOpen(true)
              }}
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={images[0] || "/placeholder.svg"}
              alt={title || "Media"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => {
                setLightboxIndex(0)
                setLightboxOpen(true)
              }}
              loading="lazy"
              quality={85}
            />
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {isVideo ? (
                <Video className="h-6 w-6 text-accent" />
              ) : (
                <ImageIcon className="h-6 w-6 text-accent" />
              )}
            </div>
          </div>
        </div>
        {caption && <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">{caption}</p>}
        
        {/* Lightbox for single image */}
        {(() => {
          const slides = getCurrentSlides()
          const safeIndex = Math.max(0, Math.min(lightboxIndex, Math.max(0, slides.length - 1)))
          if (!lightboxOpen || slides.length === 0) return null
          return (
            <Lightbox
              open={lightboxOpen}
              close={() => setLightboxOpen(false)}
              index={safeIndex}
              slides={slides}
              carousel={{
                finite: true,
              }}
              render={{
            slide: ({ slide, rect }) => {
              const isVideo = slide.type === 'video' || isVideoUrl(slide.src)
              return (
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ touchAction: 'none' }}
                >
                  {isVideo ? (
                    <video
                      src={slide.src}
                      className="max-w-full max-h-full object-contain select-none"
                      style={{
                        maxWidth: rect.width,
                        maxHeight: rect.height,
                      }}
                      controls
                      autoPlay
                      playsInline
                      muted={false}
                    />
                  ) : (
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
                  )}
                  {/* Swipe hints */}
                  {showSwipeHint && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                      Swipe down to close
                    </div>
                  )}
                </div>
              )
            },
              }}
              plugins={[]}
            />
          )
        })()}
      </div>
    )
  }

  // Album display
  return (
    <div className="w-full">
      {/** prepare slides and safe index to avoid any runtime issues */}
      {(() => null)()}
      {/* Album Grid Display */}
      <div className="grid grid-cols-2 gap-1 mb-3 sm:mb-4">
        {images.slice(0, 4).map((image, index) => {
          const isVideo = isVideoUrl(image)
          return (
            <div
              key={index}
              className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
              onClick={() => {
                setLightboxIndex(0) // Always start from first media
                setLightboxOpen(true)
              }}
            >
              {isVideo ? (
                <video
                  src={image || "/placeholder.svg"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${title || 'Media'} - ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  quality={85}
                />
              )}
              {/* Video indicator */}
              {isVideo && (
                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                  <Video className="h-3 w-3 text-white" />
                </div>
              )}
              {/* Show +X overlay on last visible media */}
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    +{images.length - 4}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Caption and album badge */}
      <div className="flex items-start justify-between gap-2">
        {caption && <p className="text-xs text-muted-foreground italic line-clamp-2 flex-1">{caption}</p>}
        {isAlbum && (
          <div className="bg-accent/20 text-accent border-0 flex items-center gap-1 whitespace-nowrap text-xs px-2 py-1 rounded-full">
            <ImageIcon className="h-3 w-3" />
            Album
          </div>
        )}
      </div>

      {/* Lightbox */}
      {(() => {
        const slides = getCurrentSlides()
        const safeIndex = Math.max(0, Math.min(lightboxIndex, Math.max(0, slides.length - 1)))
        if (!lightboxOpen || slides.length === 0) return null
        return (
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={safeIndex}
            slides={slides}
            carousel={{
              finite: true,
            }}
            render={{
          slide: ({ slide, rect }) => {
            const isVideo = slide.type === 'video' || isVideoUrl(slide.src)
            return (
              <div
                className="relative w-full h-full flex items-center justify-center"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
              >
                {isVideo ? (
                  <video
                    src={slide.src}
                    className="max-w-full max-h-full object-contain select-none"
                    style={{
                      maxWidth: rect.width,
                      maxHeight: rect.height,
                    }}
                    controls
                    autoPlay
                    playsInline
                    muted={false}
                  />
                ) : (
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
                )}
                {/* Swipe hints */}
                {showSwipeHint && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                    Swipe left/right to navigate • Swipe down to close
                  </div>
                )}
              </div>
            )
          },
            }}
            plugins={[]}
          />
        )
      })()}
    </div>
  )
}
