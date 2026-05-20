export type UserType = "student" | "cafeteria";
export type OfferType = "free" | "symbolic";
export type PostStatus = "available" | "claimed" | "delivered" | "expired";
export type ClaimStatus = "active" | "cancelled";
export type NotifType = "claim" | "message" | "expiring_soon";

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  user_type: UserType;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string;
  expiration_date: string;
  pickup_location: string;
  offer_type: OfferType;
  price_amount: number | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Claim {
  id: string;
  post_id: string;
  claimer_id: string;
  claimed_at: string;
  status: ClaimStatus;
  posts?: Post;
  profiles?: Profile;
}

export interface Message {
  id: string;
  claim_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  profiles?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  reference_id: string | null;
  created_at: string;
}

// Supabase Database type stub (se puede expandir con supabase gen types)
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at">; Update: Partial<Profile> };
      posts: { Row: Post; Insert: Omit<Post, "id" | "created_at" | "updated_at">; Update: Partial<Post> };
      claims: { Row: Claim; Insert: Omit<Claim, "id" | "claimed_at">; Update: Partial<Claim> };
      messages: { Row: Message; Insert: Omit<Message, "id" | "sent_at">; Update: Partial<Message> };
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "created_at">; Update: Partial<Notification> };
    };
  };
};
