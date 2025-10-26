"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ImageIcon, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface AlbumGridProps {
  images: string[]
  caption?: string
  title?: string
  isAlbum?: boolean
  showMobileRedirect?: boolean // New prop to control mobile redirect behavior
  postId?: string // Post ID for direct linking
  platform?: string // Platform for filtering in gallery
}

export default function AlbumGrid({ images, caption, title, isAlbum, showMobileRedirect = false, postId, platform }: AlbumGridProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [showMobileMessage, setShowMobileMessage] = useState(false)

  const minSwipeDistance = 50
  const minSwipeDownDistance = 100 // Minimum distance for swipe down to close

  // Check if device is mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (isClosing) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // Prevent default touch behavior that might cause scroll
    e.preventDefault()
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (isClosing) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // Prevent default touch behavior that might cause scroll
    e.preventDefault()
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (isClosing) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // Prevent default touch behavior that might cause scroll
    e.preventDefault()
    if (!touchStart || !touchEnd) return
    
    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchEnd.y - touchStart.y // Positive means swipe down
    
    const isLeftSwipe = deltaX > minSwipeDistance
    const isRightSwipe = deltaX < -minSwipeDistance
    const isSwipeDown = deltaY > minSwipeDownDistance

    // Check for swipe down to close (only on mobile and when modal is open)
    if (isSwipeDown && isMobile() && selectedImageIndex !== null) {
      closeModal()
      return
    }

    // Handle horizontal swipes for image navigation
    if (selectedImageIndex !== null && images.length > 1) {
      if (isLeftSwipe) {
        // Swipe left - next image
        setSelectedImageIndex((selectedImageIndex + 1) % images.length)
      } else if (isRightSwipe) {
        // Swipe right - previous image
        setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)
      }
    }
  }

  // Close modal function - PREVENT REOPENING
  const closeModal = () => {
    if (isClosing) return // Prevent multiple close calls
    
    setIsClosing(true)
    setSelectedImageIndex(null)
    
    // Reset all states after a longer delay to prevent reopening
    setTimeout(() => {
      setTouchStart(null)
      setTouchEnd(null)
      setIsClosing(false)
    }, 500) // Increased delay to 500ms
  }

  // Force close when selectedImageIndex is null
  useEffect(() => {
    if (selectedImageIndex === null) {
      setTouchStart(null)
      setTouchEnd(null)
    }
  }, [selectedImageIndex])

  // Keyboard handler for ESC key and mobile scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImageIndex !== null) {
        closeModal()
      }
    }

    if (selectedImageIndex !== null) {
      document.addEventListener('keydown', handleKeyDown)
      // Store current scroll position
      const scrollY = window.scrollY
      // Simple scroll lock for mobile - just prevent scrolling
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'relative'
      // Prevent mobile zoom and scroll issues
      document.body.style.touchAction = 'none'
      document.documentElement.style.overflow = 'hidden'
    } else {
      // Restore scroll position
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.touchAction = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.touchAction = ''
      document.documentElement.style.overflow = ''
    }
  }, [selectedImageIndex])

  if (!images || images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="w-full">
        <div className="relative overflow-hidden rounded-lg bg-muted aspect-square">
            <Image
              src={images[0] || "/placeholder.svg"}
              alt={title || "Image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover cursor-pointer hover:scale-105 transition-transform"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (isClosing) return
                
                // On mobile, show message to go to gallery instead of opening modal (only if showMobileRedirect is true)
                if (isMobile() && showMobileRedirect) {
                  setShowMobileMessage(true)
                  return
                }
                
                setSelectedImageIndex(0)
                setTouchStart(null)
                setTouchEnd(null)
              }}
              loading="lazy"
              quality={85}
            />
        </div>
        {caption && <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">{caption}</p>}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 mb-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg bg-muted aspect-square group cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (isClosing) return
              
              // On mobile, show message to go to gallery instead of opening modal (only if showMobileRedirect is true)
              if (isMobile() && showMobileRedirect) {
                setShowMobileMessage(true)
                return
              }
              
              setSelectedImageIndex(index)
              setTouchStart(null)
              setTouchEnd(null)
            }}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${title} - Image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
              quality={85}
            />
            {/* Show overlay on last image if more than 2 */}
            {index === images.length - 1 && images.length > 2 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-xs sm:text-sm">+{images.length - 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption and album badge */}
      <div className="flex items-start justify-between gap-2">
        {caption && <p className="text-xs text-muted-foreground italic line-clamp-2 flex-1">{caption}</p>}
        {isAlbum && (
          <Badge className="bg-accent/20 text-accent border-0 flex items-center gap-1 whitespace-nowrap text-xs">
            <ImageIcon className="h-3 w-3" />
            Album
          </Badge>
        )}
      </div>

      {selectedImageIndex !== null && !isClosing && (
        <div 
          key={selectedImageIndex}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
            if (!isClosing) {
              closeModal()
            }
          }}
          style={{ 
            pointerEvents: isClosing ? 'none' : 'auto',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Mobile-specific fixes - prevent scroll jump
            transform: 'translateZ(0)', // Force hardware acceleration
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
            // Ensure modal is always centered on mobile
            margin: 0,
            padding: '8px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ 
              pointerEvents: isClosing ? 'none' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxHeight: '90vh',
              // Mobile-specific fixes
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-8 sm:-top-12 right-0 text-white hover:bg-white/20 z-10 h-10 w-10 sm:h-12 sm:w-12"
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
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Image Container */}
            <div 
              className="relative w-full bg-black rounded-lg overflow-hidden flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
              }}
              style={{ 
                pointerEvents: isClosing ? 'none' : 'auto', 
                height: '80vh',
                maxHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Mobile-specific fixes
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            >
              <Image
                src={images[selectedImageIndex] || "/placeholder.svg"}
                alt={`${title} - Image ${selectedImageIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-contain"
                quality={90}
                priority
              />
            </div>

            {/* Navigation Buttons - Only show for multiple images, hidden on mobile */}
            {images.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                {/* Left/Right buttons - hidden on mobile */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hidden md:flex"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="text-white text-center flex-1">
                  <p className="font-semibold">{title || 'Image'}</p>
                  {caption && <p className="text-sm text-gray-300">{caption}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedImageIndex + 1} / {images.length} {isAlbum ? '(Album)' : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 md:hidden">
                    Swipe left/right to navigate • Swipe down to close
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % images.length)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hidden md:flex"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}

            {/* Single Image Info */}
            {images.length <= 1 && (
              <div className="text-white text-center mt-4">
                <p className="font-semibold">{title || 'Image'}</p>
                {caption && <p className="text-sm text-gray-300">{caption}</p>}
                <p className="text-xs text-gray-500 mt-1 md:hidden">
                  Swipe down to close
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Message Modal */}
      {showMobileMessage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowMobileMessage(false)}
        >
          <div 
            className="relative max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent/10 mb-4">
                <ImageIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                View in Gallery
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                For the best viewing experience, please visit our Image Gallery to view albums and images in full screen.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMobileMessage(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Link 
                  href={`/gallery${postId ? `?post=${postId}` : ''}${platform ? `&platform=${platform}` : ''}`} 
                  className="flex-1"
                >
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to Gallery
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
