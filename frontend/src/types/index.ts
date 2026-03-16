import type { Component } from 'vue'

export interface Transaction {
  id?: string
  date: string
  amount: number
  description: string
  categories: string[]
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
  params: Record<string, unknown>
  analysis_enabled: boolean
}

export interface SaveAiConfigRequest {
  provider: string
  model: string
  api_key?: string
  analysis_enabled?: boolean
}

export interface DashboardCategory {
  name: string
  total: number
  percentage: number
}

export interface DashboardKpis {
  total_income: number
  total_expenses: number
  total_investments: number
  balance: number
  balance_with_investments: number
  top_category: string | null
  transaction_count: number
  categories: DashboardCategory[]
  period_label: string | null
  last_import_date: string | null
}

export interface DashboardAnalysis {
  analysis: string | null
  enabled: boolean
}

export interface UserPreferences {
  currency: string
  language: string
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
  labelKey: string
  descriptionKey: string
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

export interface TransactionFilters {
  search?: string
  categories?: string[]
  date_from?: string
  date_to?: string
  amount_min?: number
  amount_max?: number
}
