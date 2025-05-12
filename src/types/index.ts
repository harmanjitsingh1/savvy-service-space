
export type UserRole = 'user' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  phone?: string;
  image?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  providerId: string;
  providerName: string;
  providerImage?: string;
  providerBio?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  location: string;
  duration: number;
  available: boolean;
  featured?: boolean;
  createdAt: string;
  availabilitySchedule?: string;
  serviceableAreas?: string[];
  whatsIncluded?: string[];
  whatsNotIncluded?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  cancellationPolicy?: string;
  refundPolicy?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  serviceId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id?: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
