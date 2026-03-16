import PdfImporter from './PdfImporter.vue'
import type { ImporterDefinition } from '@/types'

const definition: ImporterDefinition = {
  id: 'pdf',
  labelKey: 'importer.pdfLabel',
  descriptionKey: 'importer.pdfDesc',
  accept: '.pdf',
  component: PdfImporter,
}

export default definition
