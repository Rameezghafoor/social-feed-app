// Google Sheets integration utilities
// This file contains functions to fetch data from Google Sheets

export interface SheetPost {
  id: string
  title: string
  content: string
  platform: "chamet" | "tango" | "viral" | "other"
  author: string
  date: string
  likes: number
  comments: number
  views: number
  imageUrl?: string
  images?: string[]
  caption?: string
  isAlbum?: boolean
}

export async function fetchPostsFromSheet(date: string): Promise<SheetPost[]> {
  try {
    // Use environment variables with fallback to hardcoded values
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY || 'AIzaSyBgtwVJuzaqcmNMm4U3TWxohbMfgaaA9V0'
    const sheetId = process.env.GOOGLE_SHEET_ID || '1J2tXeDwvJBdayzPr-vEUt5JMt8Em73awYZmdvVhgCHQ'
    
    if (!apiKey || !sheetId) {
      console.error('Missing Google Sheets API credentials')
      return []
    }

    // Fetch data from Google Sheets with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`,
      { signal: controller.signal }
    )
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error(`Google Sheets API error: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    const rows = data.values || []
    
    // Skip header row and convert to posts
    // Sheet structure: Title, Content, Platform, Date, Image URL, Images, Caption, Is Album
    const posts: SheetPost[] = rows.slice(1)
      .filter((row: any[]) => row && row.length > 0) // Filter out empty rows
      .map((row: any[], index: number) => {
        try {
          // Convert Google Drive URLs to direct image URLs
          const imageUrl = row[4] ? convertDriveUrlToDirectUrl(row[4]) : ''
          const imagesFromSheet = row[5] ? row[5].split(',').map((img: string) => convertDriveUrlToDirectUrl(img.trim())).filter((img: string) => img) : []
          
          // If imageUrl exists but images array is empty, use imageUrl
          let finalImages = imagesFromSheet
          if (finalImages.length === 0 && imageUrl) {
            finalImages = [imageUrl]
          }
          
          // Debug logging
          if (finalImages.length > 0) {
            console.log(`Post "${row[0] || 'No title'}": Found ${finalImages.length} images`)
          } else {
            console.log(`Post "${row[0] || 'No title'}": No images found`)
          }
          
          const platform = (row[2] || 'other') as "chamet" | "tango" | "viral" | "other"
          
          // Parse date properly - handle format like "10/26/2025 12:55:23 AM"
          let parsedDate = new Date().toISOString()
          if (row[3]) {
            const dateValue = new Date(row[3])
            if (!isNaN(dateValue.getTime())) {
              parsedDate = dateValue.toISOString()
            }
          }
          
          return {
            id: `${platform}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            title: row[0] || '',
            content: row[1] || '',
            platform: platform,
            author: 'leakurge DEMO', // Default author since sheet doesn't have author column
            date: parsedDate,
            likes: 0, // Default value since not in spreadsheet
            comments: 0, // Default value since not in spreadsheet
            views: 0, // Default value since not in spreadsheet
            imageUrl: imageUrl,
            images: finalImages.length > 0 ? finalImages : undefined,
            caption: row[6] || '',
            isAlbum: row[7] === 'TRUE' || row[7] === 'true' || (finalImages.length > 1)
          }
        } catch (err) {
          console.error('Error parsing row:', err, row)
          return null
        }
      })
      .filter((post: SheetPost | null): post is SheetPost => post !== null) // Filter out null posts
    
    // Sort by date descending (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Filter by date if not "all"
    if (date !== "all") {
      const targetDate = new Date(date)
      return posts.filter(post => {
        const postDate = new Date(post.date)
        return postDate.toDateString() === targetDate.toDateString()
      })
    }
    
    return posts
  } catch (error) {
    console.error('Error fetching posts from Google Sheets:', error)
    return []
  }
}

// Utility function to convert Google Drive sharing links to direct image URLs
export function convertDriveUrlToDirectUrl(driveUrl: string): string {
  if (!driveUrl || !driveUrl.includes('drive.google.com')) {
    return driveUrl
  }
  
  // Extract file ID from Google Drive URL
  const fileIdMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
  if (fileIdMatch) {
    const fileId = fileIdMatch[1]
    // Use the direct download URL format that works better
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }
  
  return driveUrl
}

// Note: This function is not used since we're using direct image links in the sheet
export async function fetchImagesFromDrive(folderId: string): Promise<string[]> {
  // This function is not needed when using direct image links in Google Sheets
  return []
}
