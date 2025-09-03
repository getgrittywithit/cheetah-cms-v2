'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  Wrench, 
  Home, 
  Shield, 
  Star,
  Plus,
  RotateCcw,
  Zap,
  Settings,
  ChevronDown,
  Loader2
} from 'lucide-react'

interface TritonCalendarEnhancementsProps {
  brandConfig: {
    slug: string
    name: string
    theme: {
      primary: string
      secondary: string
      accent?: string
    }
  }
}

interface TritonTemplate {
  id: string
  name: string
  category: 'maintenance' | 'tools' | 'projects' | 'tips' | 'testimonials' | 'seasonal' | 'emergency'
  dayOfWeek?: number // 1=Monday, 7=Sunday
  icon: any
  prompt: string
  hashtags: string[]
  description: string
}

const TRITON_TEMPLATES: TritonTemplate[] = [
  // Maintenance Monday (Day 1)
  {
    id: 'maintenance-monday-1',
    name: 'Maintenance Monday - HVAC Check',
    category: 'maintenance',
    dayOfWeek: 1,
    icon: Settings,
    prompt: 'Fall HVAC maintenance checklist - checking air filters, cleaning vents, and ensuring your heating system is ready for cooler weather',
    hashtags: ['MaintenanceMonday', 'HVACMaintenance', 'FallPrep'],
    description: 'Weekly Monday HVAC maintenance tips'
  },
  {
    id: 'maintenance-monday-2', 
    name: 'Maintenance Monday - Gutter Cleaning',
    category: 'maintenance',
    dayOfWeek: 1,
    icon: Settings,
    prompt: 'Gutter cleaning and maintenance - preventing water damage and ensuring proper drainage before winter weather hits',
    hashtags: ['MaintenanceMonday', 'GutterCleaning', 'WinterPrep'],
    description: 'Weekly Monday gutter maintenance tips'
  },
  
  // Tool Tuesday (Day 2)
  {
    id: 'tool-tuesday-1',
    name: 'Tool Tuesday - Drill Bits Guide',
    category: 'tools',
    dayOfWeek: 2,
    icon: Wrench,
    prompt: 'The right drill bit for the job - comparing wood, metal, and masonry bits and when to use each type for professional results',
    hashtags: ['ToolTuesday', 'DrillBits', 'ToolTips'],
    description: 'Weekly Tuesday tool spotlight and usage tips'
  },
  {
    id: 'tool-tuesday-2',
    name: 'Tool Tuesday - Level Safety',
    category: 'tools',
    dayOfWeek: 2,
    icon: Wrench,
    prompt: 'Using a level properly for accurate installations - ensuring pictures, shelves, and fixtures are perfectly straight every time',
    hashtags: ['ToolTuesday', 'LevelTips', 'InstallationTips'],
    description: 'Weekly Tuesday tool safety and proper usage'
  },

  // Work Wednesday (Day 3)
  {
    id: 'work-wednesday-1',
    name: 'Work Wednesday - Kitchen Repair',
    category: 'projects',
    dayOfWeek: 3,
    icon: Home,
    prompt: 'Kitchen cabinet door repair project - fixing loose hinges and misaligned doors for smooth operation and professional appearance',
    hashtags: ['WorkWednesday', 'KitchenRepair', 'CabinetRepair'],
    description: 'Wednesday project showcases and before/after'
  },
  {
    id: 'work-wednesday-2',
    name: 'Work Wednesday - Bathroom Fixture',
    category: 'projects',
    dayOfWeek: 3,
    icon: Home,
    prompt: 'Bathroom fixture upgrade - installing new towel bars and toilet paper holders for improved functionality and modern style',
    hashtags: ['WorkWednesday', 'BathroomUpgrade', 'FixtureInstall'],
    description: 'Wednesday project highlights and work progress'
  },

  // Tip Thursday (Day 4)
  {
    id: 'tip-thursday-1',
    name: 'Tip Thursday - Safety First',
    category: 'tips',
    dayOfWeek: 4,
    icon: Shield,
    prompt: 'Home repair safety essentials - proper use of safety glasses, gloves, and protective equipment for DIY projects',
    hashtags: ['TipThursday', 'SafetyFirst', 'DIYSafety'],
    description: 'Thursday safety tips and quick DIY advice'
  },
  {
    id: 'tip-thursday-2',
    name: 'Tip Thursday - Measuring Tips',
    category: 'tips',
    dayOfWeek: 4,
    icon: Shield,
    prompt: 'Measuring twice, cutting once - professional measuring techniques to avoid costly mistakes on your next project',
    hashtags: ['TipThursday', 'MeasuringTips', 'ProjectPlanning'],
    description: 'Thursday practical tips for homeowners'
  },

  // Feature Friday (Day 5) 
  {
    id: 'feature-friday-1',
    name: 'Feature Friday - Customer Success',
    category: 'testimonials',
    dayOfWeek: 5,
    icon: Star,
    prompt: 'Customer testimonial feature - satisfied homeowner shares their experience with our professional repair service and quality workmanship',
    hashtags: ['FeatureFriday', 'CustomerSuccess', 'TestimonialFriday'],
    description: 'Friday customer testimonials and success stories'
  },

  // Service Saturday (Day 6)
  {
    id: 'service-saturday-1',
    name: 'Service Saturday - Winterization',
    category: 'seasonal',
    dayOfWeek: 6,
    icon: Calendar,
    prompt: 'Winterization service reminder - protecting your pipes, sealing drafts, and preparing your home for cold weather challenges',
    hashtags: ['ServiceSaturday', 'Winterization', 'SeasonalService'],
    description: 'Saturday seasonal service reminders'
  },

  // Emergency Services
  {
    id: 'emergency-response',
    name: 'Emergency Response Available',
    category: 'emergency',
    icon: Zap,
    prompt: 'Emergency repair services available - water leaks, electrical issues, and urgent home repairs that cannot wait',
    hashtags: ['EmergencyRepair', 'UrgentService', '24HourService'],
    description: 'Emergency services and urgent repairs'
  }
]

export default function TritonCalendarEnhancements({ brandConfig }: TritonCalendarEnhancementsProps) {
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showBulkScheduler, setShowBulkScheduler] = useState(false)
  const [schedulingTemplate, setSchedulingTemplate] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  const categories = [
    { id: 'all', name: 'All Templates', icon: Calendar },
    { id: 'maintenance', name: 'Maintenance Monday', icon: Settings },
    { id: 'tools', name: 'Tool Tuesday', icon: Wrench },
    { id: 'projects', name: 'Work Wednesday', icon: Home },
    { id: 'tips', name: 'Tip Thursday', icon: Shield },
    { id: 'testimonials', name: 'Feature Friday', icon: Star },
    { id: 'seasonal', name: 'Service Saturday', icon: Calendar },
    { id: 'emergency', name: 'Emergency Services', icon: Zap }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? TRITON_TEMPLATES 
    : TRITON_TEMPLATES.filter(t => t.category === selectedCategory)

  const handleScheduleTemplate = async (template: TritonTemplate, date?: Date) => {
    setSchedulingTemplate(template.id)
    
    try {
      // Generate content using the existing AI system
      const generateResponse = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: template.prompt,
          brand: brandConfig.name,
          brandSlug: brandConfig.slug,
          platforms: ['facebook', 'instagram'],
          tone: 'professional',
          style: 'helpful'
        })
      })

      if (!generateResponse.ok) {
        throw new Error('Failed to generate content')
      }

      const generated = await generateResponse.json()
      const post = generated.posts[0] // Get the universal post

      // Schedule the post using existing API
      const scheduleDate = date || new Date(selectedDate + 'T09:00:00')
      const scheduleResponse = await fetch('/api/marketing/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandConfig.slug,
          content: post.content,
          hashtags: [...post.hashtags, ...template.hashtags],
          platforms: ['facebook', 'instagram'],
          scheduledFor: scheduleDate.toISOString(),
          imagePrompt: `Professional handyman service image for: ${template.prompt.substring(0, 100)}`
        })
      })

      if (!scheduleResponse.ok) {
        throw new Error('Failed to schedule post')
      }

      alert(`Successfully scheduled "${template.name}" for ${scheduleDate.toLocaleDateString()}!`)
      
      // Refresh the calendar to show the new post
      window.location.reload()
      
    } catch (error) {
      console.error('Error scheduling template:', error)
      alert(`Failed to schedule template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSchedulingTemplate(null)
    }
  }

  const handleBulkSchedule = async (startDate: Date, templates: TritonTemplate[]) => {
    // TODO: Generate and schedule multiple posts at once
    console.log('Bulk scheduling from:', startDate, 'templates:', templates.length)
  }

  return (
    <div className="mb-8">
      {/* Triton Planning Tools */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: brandConfig.theme.primary }}
            >
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Triton Planning Tools</h2>
              <p className="text-gray-600 text-sm">Professional content templates and bulk scheduling for handyman services</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Content Templates</span>
            </button>
            
            <button
              onClick={() => setShowBulkScheduler(!showBulkScheduler)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: brandConfig.theme.primary }}
            >
              <Calendar className="w-4 h-4" />
              <span>Bulk Schedule</span>
            </button>
          </div>
        </div>

        {/* Content Templates Panel */}
        {showTemplates && (
          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">Professional Content Templates</h3>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map(category => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                        selectedCategory === category.id 
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Date Picker */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Date (templates will be scheduled for 9:00 AM)
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                  const Icon = template.icon
                  const isScheduling = schedulingTemplate === template.id
                  return (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                        </div>
                        {template.dayOfWeek && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][template.dayOfWeek]}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.hashtags.slice(0, 2).map(hashtag => (
                          <span key={hashtag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            #{hashtag}
                          </span>
                        ))}
                        {template.hashtags.length > 2 && (
                          <span className="text-xs text-gray-500">+{template.hashtags.length - 2} more</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleScheduleTemplate(template)}
                        disabled={isScheduling}
                        className="w-full text-sm py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isScheduling ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Scheduling...</span>
                          </>
                        ) : (
                          <span>Schedule for {new Date(selectedDate).toLocaleDateString()}</span>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Scheduler Panel */}
        {showBulkScheduler && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Bulk Content Scheduler</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-2">🚧 <strong>Coming Soon!</strong></p>
              <p className="text-yellow-700 text-sm">
                Generate and schedule a full month of Triton content with weekly themes:
                Maintenance Mondays, Tool Tuesdays, Work Wednesdays, and more.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}