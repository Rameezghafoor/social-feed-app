import { NextRequest, NextResponse } from "next/server"
import { fetchPostsFromSheet, convertDriveUrlToDirectUrl } from "@/lib/google-sheets"
import { getCachedData, setCachedData } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const folder = searchParams.get("folder") || "all"
    
    // Create cache key
    const cacheKey = `gallery-${folder}`
    
    // Try to get from cache first
    let images = getCachedData(cacheKey)
    
    if (!images) {
      // Cache miss - fetch from Google Sheets
      console.log(`Gallery cache miss for key: ${cacheKey}`)
      const posts = await fetchPostsFromSheet("all")
      
      // Extract images from posts
      images = []
      
      posts.forEach((post: any) => {
        // Format date to match home posts
        const formattedDate = new Date(post.date).toLocaleString()
        
        // If it's an album (has multiple images), show as album
        if (post.isAlbum && post.images && post.images.length > 1) {
          // Show album with first image as thumbnail
          images.push({
            id: `${post.id}-album`,
            url: convertDriveUrlToDirectUrl(post.images[0]),
            title: post.title,
            alt: post.caption || post.title,
            uploadedAt: formattedDate,
            folder: post.platform,
            isAlbum: true,
            albumImages: post.images.map((img: string) => convertDriveUrlToDirectUrl(img)),
            albumCount: post.images.length,
            author: post.author,
            platform: post.platform,
            content: post.content,
            caption: post.caption
          })
        } else if (post.images && post.images.length === 1) {
          // Single image from images array
          images.push({
            id: `${post.id}-single`,
            url: convertDriveUrlToDirectUrl(post.images[0]),
            title: post.title,
            alt: post.caption || post.title,
            uploadedAt: formattedDate,
            folder: post.platform,
            isAlbum: false,
            author: post.author,
            platform: post.platform,
            content: post.content,
            caption: post.caption
          })
        } else if (post.imageUrl) {
          // Single image from imageUrl
          images.push({
            id: `${post.id}-single`,
            url: convertDriveUrlToDirectUrl(post.imageUrl),
            title: post.title,
            alt: post.caption || post.title,
            uploadedAt: formattedDate,
            folder: post.platform,
            isAlbum: false,
            author: post.author,
            platform: post.platform,
            content: post.content,
            caption: post.caption
          })
        }
      })
      
      // Filter by folder if not "all"
      if (folder !== "all") {
        images = images.filter((img: any) => img.folder === folder)
      }
      
      // Cache the result
      setCachedData(cacheKey, images)
      console.log(`Cached gallery data for key: ${cacheKey}`)
    } else {
      console.log(`Gallery cache hit for key: ${cacheKey}`)
    }
    
    return NextResponse.json({ 
      images,
      cached: !!getCachedData(cacheKey),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching cached gallery:", error)
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}
