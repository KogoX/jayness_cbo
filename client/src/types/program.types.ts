export interface Program { 
  _id: string;
  title: string;
  description: string;
  targetBudget: number;
  currentRaised: number;
  beneficiariesCount: number;
  image: string;
  status: 'Active' | 'Completed' | 'Upcoming';
}