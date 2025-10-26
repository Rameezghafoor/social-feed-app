import { type NextRequest, NextResponse } from "next/server"
import { fetchPostsFromSheet } from "@/lib/google-sheets"

// Mock data removed - now using only Google Sheets data

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get("platform") || "chamet"
    const dateParam = searchParams.get("date")

    // Fetch from Google Sheets
    const sheetPosts = await fetchPostsFromSheet(dateParam || "all")
    
    // Filter by platform
    let posts = platform === "all" 
      ? sheetPosts 
      : sheetPosts.filter(post => post.platform === platform)

    // Sort posts by latest (newest first)
    posts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const postsForResponse = posts.map(({ date, ...post }) => ({
      ...post,
      timestamp: new Date(date).toLocaleString()
    }))

    // Return response with cache headers for performance
    return NextResponse.json(
      { posts: postsForResponse, platform, date: dateParam },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error("Error fetching posts:", error)
    // Return empty array with 200 status instead of 500
    return NextResponse.json({ posts: [], platform: searchParams.get("platform") || "chamet", date: searchParams.get("date") })
  }
}
