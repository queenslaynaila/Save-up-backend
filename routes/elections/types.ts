import { z } from 'zod'

export enum ElectionType {
  BALLOT = 'Ballot',
  RATIFICATION = 'Ratification'
}

export const election = z.object({
  group_id:z.number(),
  initiator_id:z.number(),
  type: z.enum([ElectionType.BALLOT, ElectionType.RATIFICATION])
})

export type ElectionInterface = z.infer<typeof election>