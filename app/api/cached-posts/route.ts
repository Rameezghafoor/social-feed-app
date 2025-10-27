import { NextRequest, NextResponse } from "next/server"
import { fetchPostsFromSheet } from "@/lib/google-sheets"
import { getCachedData, setCachedData } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get("date") || "all"
    const platform = searchParams.get("platform") || "all"
    
    // Create cache key based on parameters
    const cacheKey = `posts-${date}-${platform}`
    
    // Try to get from cache first
    let posts = getCachedData(cacheKey)
    
    if (!posts) {
      // Cache miss - fetch from Google Sheets
      console.log(`Cache miss for key: ${cacheKey}`)
      posts = await fetchPostsFromSheet(date)
      
      // Filter by platform if not "all"
      if (platform !== "all") {
        posts = posts.filter((post: any) => post.platform === platform)
      }
      
      // Cache the result
      setCachedData(cacheKey, posts)
      console.log(`Cached data for key: ${cacheKey}`)
    } else {
      console.log(`Cache hit for key: ${cacheKey}`)
    }
    
    return NextResponse.json({ 
      posts,
      cached: !!getCachedData(cacheKey),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching cached posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}



