export interface Client {
  id: string;
  user_id?: string;
  card_number?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  fio?: string;
  template?: string;
  email?: string;
  discount?: string | number;
  bonus?: string | number;
  bonuses?: string | number;
  barcode?: string;
  link?: string;
  created_at?: string;
  [key: string]: any;
}

export interface ClientsResponse {
  data: Client[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
