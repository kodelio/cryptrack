import { readFileSync } from 'fs'
import { join } from 'path'

interface RawTransaction {
  type: string
  date: string
  timezone: string
  received_amount: string
  received_currency: string
  sent_amount: string
  sent_currency: string
  fee_amount: string
  fee_currency: string
  description: string
  address: string
  transaction_hash: string
  external_id: string
}

function parseCSV(content: string): RawTransaction[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',')
  const transactions: RawTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const tx: Record<string, string> = {}

    headers.forEach((header, index) => {
      tx[header] = values[index] || ''
    })

    transactions.push(tx as RawTransaction)
  }

  return transactions
}

export default defineEventHandler(async (event) => {
  const year = getRouterParam(event, 'year')

  if (!year || !/^\d{4}$/.test(year)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid year parameter'
    })
  }

  try {
    const filePath = join(process.cwd(), 'data', `${year}.csv`)
    const content = readFileSync(filePath, 'utf-8')
    const transactions = parseCSV(content)

    return transactions
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw createError({
        statusCode: 404,
        statusMessage: `No transactions found for year ${year}`
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Error reading transactions'
    })
  }
})
