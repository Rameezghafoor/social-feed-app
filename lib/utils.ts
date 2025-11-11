import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a URL points to a video file
 * @param url - The URL to check
 * @returns true if the URL is likely a video file
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v', '.3gp', '.flv', '.wmv']
  const lowerUrl = url.toLowerCase()
  
  // Check file extension
  const hasVideoExtension = videoExtensions.some(ext => lowerUrl.includes(ext))
  if (hasVideoExtension) return true
  
  // Check for video MIME types in URL (common patterns)
  const videoMimePatterns = ['video/', 'video%2F']
  const hasVideoMime = videoMimePatterns.some(pattern => lowerUrl.includes(pattern))
  if (hasVideoMime) return true
  
  return false
}