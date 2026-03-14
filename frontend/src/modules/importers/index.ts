import csv from './csv/index'
import pdf from './pdf/index'
import type { ImporterDefinition } from '@/types'

// Register importers here — add or remove modules freely
const importers: ImporterDefinition[] = [csv, pdf]

export default importers
