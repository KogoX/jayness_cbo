export interface Beneficiary {
  _id: string;
  fullName: string;
  idNumber: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  assignedProgram: {
    _id: string;
    title: string;
  } | string; 
  status: string;
  needs: string;
}