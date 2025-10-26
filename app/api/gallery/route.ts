import { type NextRequest, NextResponse } from "next/server"
import { fetchPostsFromSheet, convertDriveUrlToDirectUrl } from "@/lib/google-sheets"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const folder = searchParams.get("folder") || "all"

    // Fetch posts from Google Sheets
    const posts = await fetchPostsFromSheet("all")
    
    // Extract images from posts
    const images: any[] = []
    
    posts.forEach((post) => {
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
          albumImages: post.images.map(img => convertDriveUrlToDirectUrl(img)),
          albumCount: post.images.length
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
          isAlbum: false
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
          isAlbum: false
        })
      }
    })

    // Filter by folder if not "all"
    let filteredImages = images
    if (folder !== "all") {
      filteredImages = images.filter((img) => img.folder === folder)
    }

    return NextResponse.json({ images: filteredImages })
  } catch (error) {
    console.error("Error fetching gallery:", error)
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}
