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

export interface AdminProductsResponse {
  items: Product[];
  total: number;
  offset: number;
  limit: number;
}

export type ProductSort = "latest" | "priceAsc" | "priceDesc";

export interface ProductsResponse {
  items: Product[];
  nextCursor: string | null;
  hasNext: boolean;
}

// Reservation Types
export type ReservationStatus = "REQUESTED" | "CONFIRMED" | "PAID" | "COMPLETED" | "CANCELLED";

export interface ReservationSlot {
  id: number;
  startAt: string; // ISO datetime
}

export interface Reservation {
  id: number;
  reservationNumber: string;
  productId: number;
  productName: string;
  slotId: number;
  slotStartAt: string; // ISO datetime
  quantity: number;
  totalPrice: number;
  requirements?: string | null;
  status: ReservationStatus;
  createdAt: string;
}

export interface AdminReservation extends Reservation {
  customerName: string;
}

export interface AdminReservationsResponse {
  items: AdminReservation[];
  total: number;
  offset: number;
  limit: number;
}

// Payment Types
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

export interface Payment {
  id: number;
  reservationId: number;
  amount: number;
  status: PaymentStatus;
  paidAt?: string | null;
  paymentKey?: string | null;
  orderId?: string | null;
  createdAt: string;
}

export interface PaymentPrepareResponse {
  clientKey: string;
  customerKey: string;
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
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

// Post Types
export interface Post {
  id: number;
  productId?: number | null;
  title: string;
  content: string;
  imageUrl?: string | null;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isNotice: boolean;
  createdAt: string;
}

export interface PostsResponse {
  items: Post[];
  total: number;
  offset: number;
  limit: number;
}

export interface AdminPost {
  id: number;
  productId?: number | null;
  title: string;
  content: string;
  imageUrl?: string | null;
  viewCount: number;
  likeCount: number;
  isNotice: boolean;
  createdAt: string;
}

export interface AdminPostsResponse {
  items: AdminPost[];
  total: number;
  offset: number;
  limit: number;
}

export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  authorProfileImageUrl?: string | null;
  content: string;
  createdAt: string;
}

export interface CommentsResponse {
  items: Comment[];
  total: number;
  offset: number;
  limit: number;
}