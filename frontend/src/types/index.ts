import type { Component } from 'vue'

export interface Transaction {
  id?: string
  date: string
  amount: number
  description: string
  category: string | null
  source?: string
  user_id?: string
}

export interface PaginatedTransactions {
  items: Transaction[]
  total: number
  page: number
  pages: number
}

export interface AiConfig {
  provider: string
  model: string
  has_key: boolean
}

export interface SaveAiConfigRequest {
  provider: string
  model: string
  api_key?: string
}

export interface UserPreferences {
  currency: string
}

export interface AuthUser {
  id: string
  email: string
}

export interface AuthTokenResponse {
  access_token: string
  token_type: string
}

export interface ImporterDefinition {
  id: string
  label: string
  description: string
  accept: string
  component: Component
}

export interface ParsedCsvResponse {
  headers: string[]
  rows: string[][]
  has_header_warning: boolean
}

export interface ImportResponse {
  imported: number
  transactions: Transaction[]
}

export interface PreviewResponse {
  transactions: Transaction[]
}
