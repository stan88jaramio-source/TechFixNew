export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  totalRepairs: number;
}

export interface ClientCreateRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface ClientUpdateRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}
