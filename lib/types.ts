export interface Receipt {
  id: string;
  userId: string;
  imageUrl: string | null;
  storeName: string;
  date: string;
  totalAmount: number;
  items: ReceiptItem[];
  category?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  totalReceipts: number;
  totalRevenue: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalReceipts: number;
  averageTransaction: number;
  hourlyRevenue: { [key: string]: number };
  monthlyRevenue: { [key: string]: number };
  dailyRevenue: { [key: string]: number };
  categoryBreakdown: { [key: string]: number };
  merchantBreakdown: { [key: string]: number };
}
