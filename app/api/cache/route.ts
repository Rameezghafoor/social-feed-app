import { NextRequest, NextResponse } from "next/server"
import { getCacheStats, clearCache } from "@/lib/cache"

export async function GET() {
  try {
    const stats = getCacheStats()
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error getting cache stats:", error)
    return NextResponse.json({ error: "Failed to get cache stats" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    clearCache()
    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
  }
}




