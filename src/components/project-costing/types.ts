export type Activity = { id: string; name: string; budget: number; quantity?: number; rate?: number; };
export type Subphase = { id: string; name: string; activities: Activity[] };
export type Phase = {
  id: string;
  name: string;
  subphases: Subphase[];
  activities: Activity[];
};
