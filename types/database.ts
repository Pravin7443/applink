export interface Admin {
  id: string;
  email: string;
  full_name: string;
  mobile_number: string;
  company_name: string;
  role: 'super_admin' | 'admin' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  upi_id: string;
  status: 'pending' | 'active' | 'blocked';
  role: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  id: string;
  bill_no: string;
  amount: number;
  customer_name?: string;
  customer_mobile: string;
  customer_email?: string;
  employee_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  payment_link: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface Transaction {
  id: string;
  payment_request_id: string;
  transaction_id: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  payment_method: string;
  gateway_response: any;
  created_at: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  company_logo?: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  upi_ids: string[];
  payment_gateway_config: any;
  notification_settings: any;
  created_at: string;
  updated_at: string;
}