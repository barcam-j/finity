import CsvImporter from './CsvImporter.vue'
import type { ImporterDefinition } from '@/types'

const definition: ImporterDefinition = {
  id: 'csv',
  label: 'CSV / Excel File',
  description: 'Import transactions from a CSV or Excel file exported from your bank.',
  accept: '.csv,.xlsx,.xls',
  component: CsvImporter,
}

export default definition
