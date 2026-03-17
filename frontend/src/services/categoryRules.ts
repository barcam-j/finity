import { api } from './api'

export interface CategoryRuleItem {
  id: string
  pattern: string
}

export interface CategoryRuleGroup {
  category: string
  rules: CategoryRuleItem[]
}

export const categoryRulesService = {
  getAll: () => api.get<CategoryRuleGroup[]>('/category-rules/'),
  delete: (id: string) => api.delete(`/category-rules/${id}`),
}
