export interface SuccessResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ErrorResponse {
  code: number;
  message: string;
  details?: {
    field?: string;
    reason: string;
  }[];
  timestamp: string;
}

// Product Types
export type ProductStatus = "AVAILABLE" | "SOLD_OUT" | "HIDDEN";

export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export type OrderStatus = "PENDING" | "MAKING" | "READY" | "COMPLETED" | "CANCELLED";

export interface Order {
  id: number;
  orderNumber: string;
  productId: number;
  productName: string;
  customerName: string;
  quantity: number;
  totalPrice: number;
  pickupDateTime: string;
  requirements?: string;
  status: OrderStatus;
  createdAt: string;
}

// Review Types
export interface Review {
  id: number;
  productId: number;
  authorName: string;
  authorProfileImageUrl?: string;
  content: string;
  rating: number; // 1 to 5
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}