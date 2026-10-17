/** A CV the visitor chose. `id` counts up, so two picks of the same file are still two jobs. */
export interface Job {
  file: File
  id: number
}
