import { readFile } from 'fs/promises'
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

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuote) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuote = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuote = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  result.push(current)
  return result
}

function parseCSV(content: string): RawTransaction[] {
  const lines = content.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const transactions: RawTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
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
    const content = await readFile(filePath, 'utf-8')
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
