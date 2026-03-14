import PdfImporter from './PdfImporter.vue'
import type { ImporterDefinition } from '@/types'

const definition: ImporterDefinition = {
  id: 'pdf',
  label: 'PDF Statement',
  description: 'Import transactions from a PDF bank statement.',
  accept: '.pdf',
  component: PdfImporter,
}

export default definition
