export interface Profile {
  id: string;
  user: string;
  role: string;
  rating: string;
  totalJobs: string;
  onTimePayments: string;
  disputes: string;
  totalEarnings: string;
  createdAt: string;
  exists: boolean;
}

export interface Project {
  id: number;
  name: string;
  location: string;
  status: string;
  statusLabel: string;
  daysCompleted: number;
  durationDays: number;
  totalAmount?: string;
  releasedAmount?: string;
  dailyRate?: string;
  earned?: string;
  kbId?: string;
  kontraktor?: string;
}

export interface Payment {
  id: number;
  projectName: string;
  projectId: number;
  day: number;
  amount: string;
  timestamp: string;
  status: string;
  txHash: string;
}
