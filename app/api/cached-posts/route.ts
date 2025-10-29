import { NextRequest, NextResponse } from "next/server"
import { fetchPostsFromSheet } from "@/lib/google-sheets"
import { getCachedData, setCachedData, updateCachedData, needsRevalidation, markRevalidationComplete } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get("date") || "all"
    const platform = searchParams.get("platform") || "all"
    
    // Create cache key based on parameters
    const cacheKey = `posts-${date}-${platform}`
    
    // Try to get from cache first
    let posts = getCachedData(cacheKey)
    let isStale = false
    
    if (!posts) {
      // Cache miss - fetch from Google Sheets
      console.log(`Cache miss for key: ${cacheKey}`)
      posts = await fetchPostsFromSheet(date)
      
      // Map date field to timestamp for consistency
      posts = posts.map((post: any) => ({
        ...post,
        timestamp: post.date || new Date().toISOString()
      }))
      
      // Filter by platform if not "all"
      if (platform !== "all") {
        posts = posts.filter((post: any) => post.platform === platform)
      }
      
      // Cache the result
      setCachedData(cacheKey, posts)
      console.log(`Cached data for key: ${cacheKey}`)
    } else {
      console.log(`Cache hit for key: ${cacheKey}`)
      
      // Check if cache needs background revalidation
      if (needsRevalidation(cacheKey)) {
        console.log(`Starting background revalidation for key: ${cacheKey}`)
        isStale = true
        
        // Start background revalidation (non-blocking)
        revalidateInBackground(cacheKey, date, platform)
      }
    }
    
    return NextResponse.json({ 
      posts,
      cached: true,
      stale: isStale,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching cached posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

// Background revalidation function
async function revalidateInBackground(cacheKey: string, date: string, platform: string) {
  try {
    console.log(`Background revalidation started for key: ${cacheKey}`)
    
    // Fetch fresh data from Google Sheets
    let freshPosts = await fetchPostsFromSheet(date)
    
    // Map date field to timestamp for consistency
    freshPosts = freshPosts.map((post: any) => ({
      ...post,
      timestamp: post.date || new Date().toISOString()
    }))
    
    // Filter by platform if not "all"
    if (platform !== "all") {
      freshPosts = freshPosts.filter((post: any) => post.platform === platform)
    }
    
    // Update cache with fresh data
    updateCachedData(cacheKey, freshPosts)
    console.log(`Background revalidation completed for key: ${cacheKey}`)
  } catch (error) {
    console.error(`Background revalidation failed for key: ${cacheKey}`, error)
    // Mark revalidation as complete even if it failed
    markRevalidationComplete(cacheKey)
  }
}



