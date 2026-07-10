export type DrawPhase =
  | 'input'
  | 'ready'
  | 'shuffling'
  | 'locking'
  | 'reveal-first'
  | 'reveal-second'
  | 'complete'

export type Participant = {
  id: string
  name: string
}
