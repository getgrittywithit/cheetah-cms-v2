'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, FileText, Send } from 'lucide-react'
import { SocialPost, BlogPost } from '@/lib/marketing-types'

interface ContentCalendarProps {
  socialPosts: SocialPost[]
  blogPosts: BlogPost[]
}

export default function ContentCalendar({ socialPosts, blogPosts }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }
  
  const getContentForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]
    
    const posts = socialPosts.filter(post => {
      if (!post.scheduledFor) return false
      const postDate = new Date(post.scheduledFor).toISOString().split('T')[0]
      return postDate === dateStr
    })
    
    const blogs = blogPosts.filter(blog => {
      if (!blog.scheduledFor) return false
      const blogDate = new Date(blog.scheduledFor).toISOString().split('T')[0]
      return blogDate === dateStr
    })
    
    return { posts, blogs }
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Calendar days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const { posts, blogs } = getContentForDate(day)
          const hasContent = posts.length > 0 || blogs.length > 0
          
          return (
            <div
              key={day}
              className={`aspect-square border rounded-lg p-2 flex flex-col ${
                hasContent ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
              } hover:bg-gray-50 transition-colors`}
            >
              <div className="text-sm font-medium mb-1">{day}</div>
              <div className="flex-1 space-y-1">
                {posts.slice(0, 2).map((post, index) => (
                  <div
                    key={index}
                    className="flex items-center text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                    title={post.content}
                  >
                    <Send className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{post.platform}</span>
                  </div>
                ))}
                {blogs.slice(0, 1).map((blog, index) => (
                  <div
                    key={index}
                    className="flex items-center text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded truncate"
                    title={blog.title}
                  >
                    <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Blog</span>
                  </div>
                ))}
                {(posts.length > 2 || blogs.length > 1) && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    +{(posts.length - 2) + (blogs.length - 1)} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}