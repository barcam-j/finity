import CsvImporter from './CsvImporter.vue'

export default {
  id: 'csv',
  label: 'CSV File',
  description: 'Import transactions from a CSV file exported from your bank.',
  accept: '.csv',
  component: CsvImporter,
}
