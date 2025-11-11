"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X, ImageIcon, Video } from "lucide-react"
import AlbumGrid from "@/components/album-grid"
import { isVideoUrl } from "@/lib/utils"

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

interface ImageGalleryProps {
  images?: GalleryImage[]
  isLoading?: boolean
}

export default function ImageGallery({ images = [], isLoading = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const handlePrevious = () => {
    if (selectedImage?.isAlbum && selectedImage.albumImages) {
      setCurrentAlbumIndex((prev) => (prev === 0 ? selectedImage.albumImages!.length - 1 : prev - 1))
    } else {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      setSelectedImage(images[currentIndex === 0 ? images.length - 1 : currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (selectedImage?.isAlbum && selectedImage.albumImages) {
      setCurrentAlbumIndex((prev) => (prev === selectedImage.albumImages!.length - 1 ? 0 : prev + 1))
    } else {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      setSelectedImage(images[currentIndex === images.length - 1 ? 0 : currentIndex + 1])
    }
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isClosing) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isClosing) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isClosing) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrevious()
    }
  }

  // Close modal function - PREVENT REOPENING
  const closeModal = () => {
    if (isClosing) return // Prevent multiple close calls
    
    setIsClosing(true)
    setSelectedImage(null)
    
    // Reset all states after a longer delay to prevent reopening
    setTimeout(() => {
      setCurrentIndex(0)
      setCurrentAlbumIndex(0)
      setTouchStart(null)
      setTouchEnd(null)
      setIsClosing(false)
    }, 500) // Increased delay to 500ms
  }

  // Force close when selectedImage is null
  useEffect(() => {
    if (!selectedImage) {
      setCurrentIndex(0)
      setCurrentAlbumIndex(0)
      setTouchStart(null)
      setTouchEnd(null)
    }
  }, [selectedImage])



  // Keyboard handler for ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        closeModal()
      }
    }

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

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

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => {
          // Platform colors matching home page
          const platformColors: Record<string, { bg: string; text: string }> = {
            chamet: { bg: "bg-blue-500", text: "text-white" },
            tango: { bg: "bg-purple-500", text: "text-white" },
            viral: { bg: "bg-red-500", text: "text-white" },
            other: { bg: "bg-gray-500", text: "text-white" },
          }
          
          const colors = platformColors[image.platform || 'other'] || platformColors['other']
          
          return (
            <Card
              key={image.id}
              className="backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-accent/30 cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (isClosing) return // Prevent opening during closing
                setSelectedImage(image)
                setCurrentIndex(index)
                setCurrentAlbumIndex(0) // Reset album index when selecting new image
                setTouchStart(null)
                setTouchEnd(null)
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
              
              {/* Images - Use AlbumGrid for albums, regular image for singles */}
              {image.isAlbum && image.albumImages ? (
                <div className="mb-3 sm:mb-4">
                  <AlbumGrid 
                    images={image.albumImages} 
                    caption={image.caption}
                    title={image.title}
                    isAlbum={true}
                  />
                </div>
              ) : (
                <div 
                  className="relative w-full h-48 bg-muted rounded-lg overflow-hidden mb-3 sm:mb-4 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (isClosing) return
                    setSelectedImage(image)
                    setCurrentIndex(index)
                    setCurrentAlbumIndex(0)
                    setTouchStart(null)
                    setTouchEnd(null)
                  }}
                >
                  {isVideoUrl(image.url) ? (
                    <video
                      src={image.url || "/placeholder.svg"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover hover:scale-105 transition-transform"
                      loading="lazy"
                      quality={85}
                    />
                  )}
                  {/* Video indicator */}
                  {isVideoUrl(image.url) && (
                    <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                      <Video className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && !isClosing && (
        <div 
          key={selectedImage.id}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
            if (!isClosing) {
              closeModal()
            }
          }}
          style={{ pointerEvents: isClosing ? 'none' : 'auto' }}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ pointerEvents: isClosing ? 'none' : 'auto' }}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
                if (!isClosing) {
                  closeModal()
                }
              }}
              disabled={isClosing}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Media Container */}
            <div 
              className="relative w-full bg-black rounded-lg overflow-hidden"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
              }}
              style={{ pointerEvents: isClosing ? 'none' : 'auto', height: '80vh' }}
            >
              {(() => {
                const mediaUrl = selectedImage.isAlbum && selectedImage.albumImages
                  ? selectedImage.albumImages[currentAlbumIndex] || "/placeholder.svg"
                  : selectedImage.url || "/placeholder.svg"
                const isVideo = isVideoUrl(mediaUrl)
                
                return isVideo ? (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-contain"
                    style={{ maxHeight: '80vh' }}
                    controls
                    autoPlay
                    playsInline
                    muted={false}
                  />
                ) : (
                  <Image
                    src={mediaUrl}
                    alt={selectedImage.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    className="object-contain"
                    quality={90}
                    priority
                  />
                )
              })()}
            </div>

            {/* Navigation Buttons - Only show for albums with multiple images, hidden on mobile */}
            {(selectedImage.isAlbum && selectedImage.albumImages && selectedImage.albumImages.length > 1) && (
              <div className="flex items-center justify-between mt-4">
                {/* Left/Right buttons - hidden on mobile */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hidden md:flex"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="text-white text-center flex-1">
                  <p className="font-semibold">{selectedImage.author || 'leakurge DEMO'}</p>
                  <p className="text-sm text-gray-300">{selectedImage.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentAlbumIndex + 1} / {selectedImage.albumImages.length} (Album)
                  </p>
                  <p className="text-xs text-gray-500 mt-1 md:hidden">
                    Swipe left/right to navigate
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hidden md:flex"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}

            {/* Single Image Info */}
            {(!selectedImage.isAlbum || !selectedImage.albumImages || selectedImage.albumImages.length <= 1) && (
              <div className="text-white text-center mt-4">
                <p className="font-semibold">{selectedImage.author || 'leakurge DEMO'}</p>
                <p className="text-sm text-gray-300">{selectedImage.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {currentIndex + 1} / {images.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
