'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  Users, 
  Send, 
  Calendar,
  BarChart3,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  MousePointer,
  Sparkles
} from 'lucide-react'
import { BrandConfig } from '@/lib/brand-config'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  status: 'draft' | 'scheduled' | 'sent'
  scheduledFor?: Date
  sentAt?: Date
  recipients: number
  opens?: number
  clicks?: number
  openRate?: number
  clickRate?: number
}

interface EmailList {
  id: string
  name: string
  subscribers: number
  growthRate: number
}

interface EmailDashboardProps {
  brandConfig: BrandConfig
}

export default function EmailDashboard({ brandConfig }: EmailDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'lists' | 'create'>('overview')
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [emailLists, setEmailLists] = useState<EmailList[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all')

  // Email Creation State
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [selectedList, setSelectedList] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  useEffect(() => {
    loadEmailData()
  }, [])

  const loadEmailData = async () => {
    setLoading(true)
    try {
      // Mock data for now - replace with actual API calls
      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Weekly Motivation Newsletter',
          subject: 'Your Weekly Dose of Grit - Edition #42',
          content: 'This week we explore the power of consistency...',
          status: 'sent',
          sentAt: new Date('2025-01-15'),
          recipients: 2450,
          opens: 980,
          clicks: 147,
          openRate: 40.0,
          clickRate: 6.0
        },
        {
          id: '2',
          name: 'New Product Launch',
          subject: 'Introducing: Mountain Peak Canvas Collection',
          content: 'We\'re excited to share our latest canvas designs...',
          status: 'scheduled',
          scheduledFor: new Date('2025-01-22'),
          recipients: 2450
        }
      ]

      const mockLists: EmailList[] = [
        { id: '1', name: 'Main Newsletter', subscribers: 2450, growthRate: 12.5 },
        { id: '2', name: 'Product Updates', subscribers: 1890, growthRate: 8.3 },
        { id: '3', name: 'VIP Customers', subscribers: 145, growthRate: 5.2 }
      ]

      setCampaigns(mockCampaigns)
      setEmailLists(mockLists)
    } catch (error) {
      console.error('Failed to load email data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async (type: 'now' | 'scheduled') => {
    if (!emailSubject || !emailContent || !selectedList) {
      alert('Subject, content, and list selection are required')
      return
    }

    try {
      const scheduledFor = type === 'scheduled' && scheduleDate && scheduleTime 
        ? new Date(`${scheduleDate}T${scheduleTime}`)
        : undefined

      const response = await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          content: emailContent,
          listId: selectedList,
          type,
          scheduledFor,
          brandId: brandConfig.slug
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Email ${type === 'now' ? 'sent' : 'scheduled'} successfully!`)
        setEmailSubject('')
        setEmailContent('')
        setSelectedList('')
        setScheduleDate('')
        setScheduleTime('')
        loadEmailData()
        setActiveTab('campaigns')
      } else {
        alert('Failed to send email: ' + data.error)
      }
    } catch (error) {
      console.error('Email send error:', error)
      alert('Failed to send email')
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalSubscribers = emailLists.reduce((sum, list) => sum + list.subscribers, 0)
  const totalSent = campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.recipients, 0)
  const avgOpenRate = campaigns.filter(c => c.openRate).reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.filter(c => c.openRate).length || 0
  const avgClickRate = campaigns.filter(c => c.clickRate).reduce((sum, c) => sum + (c.clickRate || 0), 0) / campaigns.filter(c => c.clickRate).length || 0

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'create', label: 'Create Campaign', icon: Plus },
            { id: 'campaigns', label: 'Campaigns', icon: Mail },
            { id: 'lists', label: 'Email Lists', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalSubscribers.toLocaleString()}</p>
                  <p className="text-gray-600">Total Subscribers</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Send className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalSent.toLocaleString()}</p>
                  <p className="text-gray-600">Emails Sent</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{avgOpenRate.toFixed(1)}%</p>
                  <p className="text-gray-600">Avg Open Rate</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <MousePointer className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{avgClickRate.toFixed(1)}%</p>
                  <p className="text-gray-600">Avg Click Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-bold">Recent Campaigns</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${
                          campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                        <span>{campaign.recipients.toLocaleString()} recipients</span>
                        {campaign.openRate && <span>{campaign.openRate}% open rate</span>}
                        {campaign.clickRate && <span>{campaign.clickRate}% click rate</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Email Configuration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">Email Configuration</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Sending from: <span className="font-medium">{brandConfig.emailSettings.fromName} &lt;{brandConfig.emailSettings.fromEmail}&gt;</span>
                </p>
                <p className="text-sm text-blue-700">
                  Reply to: <span className="font-medium">{brandConfig.emailSettings.replyTo || brandConfig.emailSettings.fromEmail}</span>
                </p>
              </div>
            </div>
          </div>

          {/* AI Email Generator */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Email Generator</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Generate personalized email campaigns for {brandConfig.name} using AI
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Coming Soon - AI Email Generation
            </button>
          </div>

          {/* Email Editor */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Create Email Campaign</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Weekly Newsletter #43"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email List *
                  </label>
                  <select
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select email list</option>
                    {emailLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.subscribers.toLocaleString()} subscribers)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Weekly Dose of Grit - Edition #43"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content *
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
                  placeholder="Write your email content here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Save as Draft
                </button>
                
                <div className="flex space-x-3">
                  {scheduleDate && scheduleTime ? (
                    <button
                      onClick={() => sendEmail('scheduled')}
                      className="flex items-center space-x-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Schedule</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => sendEmail('now')}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search campaigns..."
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Drafts</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </select>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Email Campaigns ({filteredCampaigns.length})</h3>
                <button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Campaign</span>
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <div key={campaign.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Subject: {campaign.subject}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{campaign.recipients.toLocaleString()} recipients</span>
                        {campaign.openRate && <span>{campaign.openRate}% opens</span>}
                        {campaign.clickRate && <span>{campaign.clickRate}% clicks</span>}
                        {campaign.sentAt && <span>Sent {campaign.sentAt.toLocaleDateString()}</span>}
                        {campaign.scheduledFor && <span>Scheduled for {campaign.scheduledFor.toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email Lists Tab */}
      {activeTab === 'lists' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Email Lists</h3>
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  <span>New List</span>
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {emailLists.map((list) => (
                <div key={list.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{list.name}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{list.subscribers.toLocaleString()} subscribers</span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">+{list.growthRate}% this month</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}