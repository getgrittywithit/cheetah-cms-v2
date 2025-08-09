export type Database = {
  public: {
    Tables: {
      brand_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          industry: string | null
          target_audience: string | null
          brand_values: string[] | null
          tone_of_voice: string | null
          brand_personality: string[] | null
          primary_color: string | null
          secondary_color: string | null
          accent_color: string | null
          primary_font: string | null
          secondary_font: string | null
          logo_url: string | null
          tagline: string | null
          unique_value_proposition: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          industry?: string | null
          target_audience?: string | null
          brand_values?: string[] | null
          tone_of_voice?: string | null
          brand_personality?: string[] | null
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          primary_font?: string | null
          secondary_font?: string | null
          logo_url?: string | null
          tagline?: string | null
          unique_value_proposition?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          industry?: string | null
          target_audience?: string | null
          brand_values?: string[] | null
          tone_of_voice?: string | null
          brand_personality?: string[] | null
          primary_color?: string | null
          secondary_color?: string | null
          accent_color?: string | null
          primary_font?: string | null
          secondary_font?: string | null
          logo_url?: string | null
          tagline?: string | null
          unique_value_proposition?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          brand_profile_id: string
          platform: string
          account_handle: string
          access_token: string | null
          account_id: string | null
          is_active: boolean
          posting_enabled: boolean
          last_sync: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_profile_id: string
          platform: string
          account_handle: string
          access_token?: string | null
          account_id?: string | null
          is_active?: boolean
          posting_enabled?: boolean
          last_sync?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_profile_id?: string
          platform?: string
          account_handle?: string
          access_token?: string | null
          account_id?: string | null
          is_active?: boolean
          posting_enabled?: boolean
          last_sync?: string | null
          created_at?: string
        }
      }
      content_calendar: {
        Row: {
          id: string
          user_id: string
          brand_profile_id: string
          title: string
          content_type: 'post' | 'story' | 'video' | 'carousel' | 'reel'
          platforms: string[]
          scheduled_date: string
          status: 'draft' | 'scheduled' | 'published' | 'failed'
          content_text: string | null
          hashtags: string[] | null
          media_urls: string[] | null
          ai_assistant_used: string | null
          engagement_prediction: Record<string, unknown> | null
          actual_performance: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_profile_id: string
          title: string
          content_type: 'post' | 'story' | 'video' | 'carousel' | 'reel'
          platforms: string[]
          scheduled_date: string
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          content_text?: string | null
          hashtags?: string[] | null
          media_urls?: string[] | null
          ai_assistant_used?: string | null
          engagement_prediction?: Record<string, unknown> | null
          actual_performance?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_profile_id?: string
          title?: string
          content_type?: 'post' | 'story' | 'video' | 'carousel' | 'reel'
          platforms?: string[]
          scheduled_date?: string
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          content_text?: string | null
          hashtags?: string[] | null
          media_urls?: string[] | null
          ai_assistant_used?: string | null
          engagement_prediction?: Record<string, unknown> | null
          actual_performance?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      content_analytics: {
        Row: {
          id: string
          content_calendar_id: string
          platform: string
          post_id: string | null
          impressions: number
          reach: number
          engagement_count: number
          likes_count: number
          comments_count: number
          shares_count: number
          clicks_count: number
          engagement_rate: number | null
          last_updated: string
        }
        Insert: {
          id?: string
          content_calendar_id: string
          platform: string
          post_id?: string | null
          impressions?: number
          reach?: number
          engagement_count?: number
          likes_count?: number
          comments_count?: number
          shares_count?: number
          clicks_count?: number
          engagement_rate?: number | null
          last_updated?: string
        }
        Update: {
          id?: string
          content_calendar_id?: string
          platform?: string
          post_id?: string | null
          impressions?: number
          reach?: number
          engagement_count?: number
          likes_count?: number
          comments_count?: number
          shares_count?: number
          clicks_count?: number
          engagement_rate?: number | null
          last_updated?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}