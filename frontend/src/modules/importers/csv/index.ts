import CsvImporter from './CsvImporter.vue'
import type { ImporterDefinition } from '@/types'

const definition: ImporterDefinition = {
  id: 'csv',
  labelKey: 'importer.csvLabel',
  descriptionKey: 'importer.csvDesc',
  accept: '.csv,.xlsx,.xls',
  component: CsvImporter,
}

export default definition
