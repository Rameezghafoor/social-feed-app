"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Post {
  id: string
  title: string
  content: string
  platform: "chamet" | "tango" | "viral" | "other"
  author: string
  timestamp: string
  likes: number
  comments: number
  image?: string
}

const platformColors: Record<string, string> = {
  chamet: "bg-blue-100 text-blue-800",
  tango: "bg-purple-100 text-purple-800",
  viral: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
}

export default function PostFeed({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{post.author}</h3>
                  <Badge className={platformColors[post.platform]}>
                    {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{post.timestamp}</p>
              </div>
            </div>

            {post.title && <h2 className="text-xl font-bold mb-2">{post.title}</h2>}

            <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

            {post.image && (
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{post.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.comments}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
