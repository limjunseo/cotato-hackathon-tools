import type { Award } from '../types'

export const AWARDS_STORAGE_KEY = 'cotato.hackathonAwards.settings'

export const DEFAULT_AWARDS: Award[] = [
  { rank: 1, teamName: '1등 팀', prizeAmount: 150_000 },
  { rank: 2, teamName: '2등 팀', prizeAmount: 100_000 },
  { rank: 3, teamName: '3등 팀', prizeAmount: 50_000 },
]

export function getAward(awards: Award[], rank: Award['rank']) {
  const award = awards.find((item) => item.rank === rank)
  if (!award) {
    throw new Error(`${rank}등 수상 정보가 필요합니다.`)
  }
  return award
}

export function readAwards(): Award[] {
  try {
    const saved = window.localStorage.getItem(AWARDS_STORAGE_KEY)
    if (!saved) return DEFAULT_AWARDS.map((award) => ({ ...award }))

    const parsed = JSON.parse(saved) as Award[]
    return DEFAULT_AWARDS.map((fallback) => {
      const award = parsed.find((item) => item.rank === fallback.rank)
      return {
        rank: fallback.rank,
        teamName: award?.teamName.trim() || fallback.teamName,
        prizeAmount: Number.isFinite(award?.prizeAmount) && award!.prizeAmount >= 0
          ? award!.prizeAmount
          : fallback.prizeAmount,
      }
    })
  } catch {
    return DEFAULT_AWARDS.map((award) => ({ ...award }))
  }
}

export function saveAwards(awards: Award[]) {
  window.localStorage.setItem(AWARDS_STORAGE_KEY, JSON.stringify(awards))
}

export function formatPrize(amount: number) {
  return `₩ ${amount.toLocaleString('ko-KR')}`
}
