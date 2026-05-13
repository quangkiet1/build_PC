export type Category = 'cpu' | 'mainboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case' | 'cooling';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  
  // CPU
  socket?: string;
  cores?: number;
  tdp?: number;
  
  // Mainboard
  supportedRam?: string[];
  supportedSocket?: string;
  
  // RAM
  ramType?: 'DDR4' | 'DDR5';
  capacity?: number; // GB
  
  // GPU
  vram?: number; // GB
  
  // PSU
  wattage?: number;
  
  // Storage
  capacity_storage?: number; // GB
  type?: 'SSD' | 'HDD';
}

export interface CompatibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}
