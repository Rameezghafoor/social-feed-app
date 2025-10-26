"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react"
import AlbumGrid from "@/components/album-grid"

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
        {images.map((image, index) => (
          <Card
            key={image.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
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
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm truncate">{image.title}</h3>
                {image.isAlbum && (
                  <Badge className="bg-accent/20 text-accent border-0 flex items-center gap-1 text-xs">
                    <ImageIcon className="h-3 w-3" />
                    Album ({image.albumCount})
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{image.uploadedAt}</p>
              
              {/* Use AlbumGrid for albums, regular image for singles */}
              {image.isAlbum && image.albumImages ? (
                <AlbumGrid 
                  images={image.albumImages} 
                  caption={image.alt}
                  title={image.title}
                  isAlbum={true}
                />
              ) : (
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform"
                    loading="lazy"
                    quality={85}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
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

            {/* Image Container */}
            <div 
              className="relative w-full bg-black rounded-lg overflow-hidden"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
              }}
              style={{ pointerEvents: isClosing ? 'none' : 'auto', height: '80vh' }}
            >
              <Image
                src={
                  selectedImage.isAlbum && selectedImage.albumImages
                    ? selectedImage.albumImages[currentAlbumIndex] || "/placeholder.svg"
                    : selectedImage.url || "/placeholder.svg"
                }
                alt={selectedImage.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-contain"
                quality={90}
                priority
              />
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
                  <p className="font-semibold">{selectedImage.title}</p>
                  <p className="text-sm text-gray-300">{selectedImage.uploadedAt}</p>
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
                <p className="font-semibold">{selectedImage.title}</p>
                <p className="text-sm text-gray-300">{selectedImage.uploadedAt}</p>
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
