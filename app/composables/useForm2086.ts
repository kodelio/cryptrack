import type { Transaction, CryptoCurrency } from '~/types'

export interface Form2086Cession {
  numero: number
  date: string
  crypto: CryptoCurrency
  quantite: number
  ligne211: string // Date de cession
  ligne212: number // Prix de cession (montant reçu)
  ligne213: number // Prix total d'acquisition (PAMP × quantité)
  ligne214: number // Frais et taxes sur acquisition (0)
  ligne215: number // Prix total d'acquisition + frais (213 + 214)
  ligne216: number // Frais sur cession
  ligne217: number // Prix de cession - frais (212 - 216)
  ligne218: number // Prix total d'acquisition + frais (même que 215)
  ligne220: number // Soulte versée (0)
  ligne221: number // Plus-value brute (217 - 218)
  ligne222: number // Moins-value
  ligne223: number // Plus-value nette
}

export interface Form2086Data {
  annee: number
  cessions: Form2086Cession[]
  ligne3VK: number // Total plus-values nettes
  ligne3VL: number // Total moins-values
}

export function useForm2086() {
  const { calculateCumulativeSummary } = useTaxCalculator()

  function generateForm2086Data(transactions: Transaction[], year: number): Form2086Data {
    const cessions: Form2086Cession[] = []
    let totalPlusValues = 0
    let totalMoinsValues = 0

    // Pour chaque vente, recalculer le PAMP au moment de la vente
    const sortedTransactions = [...transactions]
      .filter(t => t.date <= new Date(`${year}-12-31`))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Tracker les holdings au fur et à mesure
    const holdings: Record<CryptoCurrency, { amount: number; totalCost: number; avgCost: number }> = {
      BTC: { amount: 0, totalCost: 0, avgCost: 0 },
      ETH: { amount: 0, totalCost: 0, avgCost: 0 },
      SOL: { amount: 0, totalCost: 0, avgCost: 0 }
    }

    let cessionNumber = 1

    for (const tx of sortedTransactions) {
      if (tx.type === 'Trade' && tx.tradeType === 'Buy') {
        const crypto = tx.receivedCurrency as CryptoCurrency
        const amount = tx.receivedAmount
        const costEUR = tx.sentAmount || 0
        const feeEUR = tx.feeCurrency === 'EUR' ? tx.feeAmount : 0

        if (crypto in holdings) {
          const newTotalCost = holdings[crypto].totalCost + costEUR + feeEUR
          const newAmount = holdings[crypto].amount + amount

          holdings[crypto].amount = newAmount
          holdings[crypto].totalCost = newTotalCost
          holdings[crypto].avgCost = newAmount > 0 ? newTotalCost / newAmount : 0
        }
      } else if (tx.type === 'Trade' && tx.tradeType === 'Sell' && tx.date.getFullYear() === year) {
        const crypto = tx.sentCurrency as CryptoCurrency
        const quantite = tx.sentAmount || 0
        const prixCession = tx.receivedAmount // Montant EUR reçu
        const fraisCession = tx.feeCurrency === 'EUR' ? tx.feeAmount : 0

        if (crypto in holdings) {
          const prixAcquisition = holdings[crypto].avgCost * quantite

          const ligne211 = tx.date.toLocaleDateString('fr-FR')
          const ligne212 = prixCession
          const ligne213 = prixAcquisition
          const ligne214 = 0 // Pas de frais sur acquisition pour simplifier
          const ligne215 = ligne213 + ligne214
          const ligne216 = fraisCession
          const ligne217 = ligne212 - ligne216
          const ligne218 = ligne215
          const ligne220 = 0 // Pas de soulte
          const ligne221 = ligne217 - ligne218
          const ligne222 = ligne221 < 0 ? Math.abs(ligne221) : 0
          const ligne223 = ligne221 > 0 ? ligne221 : 0

          cessions.push({
            numero: cessionNumber++,
            date: ligne211,
            crypto,
            quantite,
            ligne211,
            ligne212,
            ligne213,
            ligne214,
            ligne215,
            ligne216,
            ligne217,
            ligne218,
            ligne220,
            ligne221,
            ligne222,
            ligne223
          })

          if (ligne223 > 0) {
            totalPlusValues += ligne223
          } else {
            totalMoinsValues += ligne222
          }

          // Mettre à jour les holdings
          holdings[crypto].amount -= quantite
          holdings[crypto].totalCost -= prixAcquisition
        }
      } else if (tx.type === 'Reward') {
        const crypto = tx.receivedCurrency as CryptoCurrency
        if (crypto in holdings) {
          holdings[crypto].amount += tx.receivedAmount
          // Les rewards ont un coût de 0, le PAMP est donc dilué
          if (holdings[crypto].amount > 0) {
            holdings[crypto].avgCost = holdings[crypto].totalCost / holdings[crypto].amount
          }
        }
      }
    }

    return {
      annee: year,
      cessions,
      ligne3VK: totalPlusValues,
      ligne3VL: totalMoinsValues
    }
  }

  function escapeCSVValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return ''

    let stringValue = String(value)

    // Prevent Formula Injection (CSV Injection)
    // If the field starts with any of the following characters, prepend a single quote
    if (/^[=\+\-@]/.test(stringValue)) {
      stringValue = "'" + stringValue
    }

    // If the field contains quotes, commas, or newlines, wrap it in quotes and escape internal quotes
    if (/[",\n\r]/.test(stringValue)) {
      stringValue = `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  function downloadCSV(data: Form2086Data) {
    const lines = [
      ['Numéro cession', 'Date', 'Crypto', 'Quantité', '211 - Date', '212 - Prix cession', '213 - Prix acquisition', '214 - Frais acquisition', '215 - Total acquisition', '216 - Frais cession', '217 - Cession nette', '218 - Acquisition totale', '220 - Soulte', '221 - Plus-value brute', '222 - Moins-value', '223 - Plus-value nette'].join(',')
    ]

    data.cessions.forEach(c => {
      lines.push([
        escapeCSVValue(c.numero),
        escapeCSVValue(c.date),
        escapeCSVValue(c.crypto),
        escapeCSVValue(c.quantite.toFixed(8)),
        escapeCSVValue(c.ligne211),
        escapeCSVValue(c.ligne212.toFixed(2)),
        escapeCSVValue(c.ligne213.toFixed(2)),
        escapeCSVValue(c.ligne214.toFixed(2)),
        escapeCSVValue(c.ligne215.toFixed(2)),
        escapeCSVValue(c.ligne216.toFixed(2)),
        escapeCSVValue(c.ligne217.toFixed(2)),
        escapeCSVValue(c.ligne218.toFixed(2)),
        escapeCSVValue(c.ligne220.toFixed(2)),
        escapeCSVValue(c.ligne221.toFixed(2)),
        escapeCSVValue(c.ligne222.toFixed(2)),
        escapeCSVValue(c.ligne223.toFixed(2))
      ].join(','))
    })

    lines.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''].join(','))
    lines.push(['', '', '', '', '', '', '', '', '', '', '', '', 'TOTAL', escapeCSVValue(data.ligne3VK.toFixed(2)), escapeCSVValue(data.ligne3VL.toFixed(2))].join(','))

    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `formulaire_2086_${data.annee}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    generateForm2086Data,
    downloadCSV
  }
}
