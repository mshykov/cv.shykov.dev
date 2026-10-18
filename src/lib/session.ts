// What the page remembers for the life of the tab, in memory only (never stored, never sent):
// the previous file's score, so a second upload shows what changed, and the job postings, so the
// same ones can be tried on a new CV. It lives here, outside the report component, because that
// component is mounted anew for every file.
import type { Snapshot } from './delta.ts'

let previous: Snapshot | null = null
let postings: string[] = ['']

export const previousScore = (): Snapshot | null => previous
export const rememberScore = (snapshot: Snapshot): void => {
  previous = snapshot
}

export const savedPostings = (): string[] => postings
export const savePostings = (next: string[]): void => {
  postings = next
}
