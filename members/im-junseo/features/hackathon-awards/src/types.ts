export type AwardRank = 1 | 2 | 3

export type Award = {
  rank: AwardRank
  teamName: string
  prizeAmount: number
}

export type AwardStage = 'intro' | 'third' | 'second' | 'first' | 'complete'
