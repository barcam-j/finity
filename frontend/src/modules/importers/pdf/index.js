import PdfImporter from './PdfImporter.vue'

export default {
  id: 'pdf',
  label: 'PDF Statement',
  description: 'Import transactions from a PDF bank statement.',
  accept: '.pdf',
  component: PdfImporter,
}
