export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

export type Product = {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  imageAltText?: string;
  isActive?: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type Cart = {
  id: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    availableStock: number;
    lineTotal: number;
  }[];
  itemCount: number;
  totalAmount: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone?: string;
  shippingAddress?: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  items?: {
    id: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};

export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
