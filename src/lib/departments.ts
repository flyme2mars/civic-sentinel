export interface DepartmentBranch {
  id: string;
  name: string;
  department: string;
  description: string;
}

export const DEPARTMENTS: DepartmentBranch[] = [
  {
    id: 'PWD_KALAMASSERY',
    name: 'Kalamassery PWD (Roads)',
    department: 'Public Works Department (PWD)',
    description: 'Responsible for road maintenance, potholes, and physical infrastructure in Kalamassery.'
  },
  {
    id: 'KWA_KALAMASSERY',
    name: 'KWA Kalamassery Section',
    department: 'Kerala Water Authority (KWA)',
    description: 'Handles water supply issues, pipe leaks, and drainage systems.'
  },
  {
    id: 'KSEB_KALAMASSERY',
    name: 'KSEB Section Office',
    department: 'Kerala State Electricity Board (KSEB)',
    description: 'Responsible for streetlights, hanging wires, and electrical infrastructure.'
  },
  {
    id: 'HEALTH_WARD_33',
    name: 'Health & Sanitation - Ward 33',
    department: 'Municipal Health Department',
    description: 'Focused on waste management, garbage collection, and public health standards.'
  },
  {
    id: 'NHAI_KERALA',
    name: 'NHAI Kerala Regional Office',
    department: 'National Highways Authority of India',
    description: 'Handles maintenance and issues related to National Highways passing through the region.'
  }
];

export const getDepartmentById = (id: string) => DEPARTMENTS.find(d => d.id === id);
