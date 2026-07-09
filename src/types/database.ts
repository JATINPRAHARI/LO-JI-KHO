export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          avatar_url: string;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          avatar_url?: string;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image_url?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          slug?: string;
          image_url?: string;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string;
          price: number;
          image_url: string;
          is_veg: boolean;
          is_active: boolean;
          is_featured: boolean;
          is_best_seller: boolean;
          sort_order: number;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string;
          price: number;
          image_url?: string;
          is_veg?: boolean;
          is_active?: boolean;
          is_featured?: boolean;
          is_best_seller?: boolean;
          sort_order?: number;
          rating?: number;
          review_count?: number;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          description?: string;
          price?: number;
          image_url?: string;
          is_veg?: boolean;
          is_active?: boolean;
          is_featured?: boolean;
          is_best_seller?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          menu_item_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          menu_item_id: string;
          quantity?: number;
        };
        Update: {
          quantity?: number;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address_line: string;
          landmark: string | null;
          city: string;
          pincode: string;
          is_default: boolean;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          label?: string;
          address_line: string;
          landmark?: string | null;
          city?: string;
          pincode?: string;
          is_default?: boolean;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: {
          label?: string;
          address_line?: string;
          landmark?: string | null;
          city?: string;
          pincode?: string;
          is_default?: boolean;
          latitude?: number | null;
          longitude?: number | null;
        };
      };
      offers: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string;
          discount_type: 'percentage' | 'flat';
          discount_value: number;
          min_order: number;
          max_discount: number | null;
          is_active: boolean;
          valid_until: string | null;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string;
          discount_type?: 'percentage' | 'flat';
          discount_value: number;
          min_order?: number;
          max_discount?: number | null;
          is_active?: boolean;
          valid_until?: string | null;
        };
        Update: {
          code?: string;
          title?: string;
          description?: string;
          discount_type?: 'percentage' | 'flat';
          discount_value?: number;
          min_order?: number;
          max_discount?: number | null;
          is_active?: boolean;
          valid_until?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: OrderStatus;
          subtotal: number;
          delivery_fee: number;
          gst_amount: number;
          discount_amount: number;
          total_amount: number;
          delivery_distance: number | null;
          offer_code: string | null;
          customer_name: string;
          customer_phone: string;
          delivery_address: string;
          delivery_landmark: string;
          delivery_instructions: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string;
          status?: OrderStatus;
          subtotal: number;
          delivery_fee?: number;
          gst_amount: number;
          discount_amount?: number;
          total_amount: number;
          delivery_distance?: number | null;
          offer_code?: string | null;
          customer_name: string;
          customer_phone: string;
          delivery_address: string;
          delivery_landmark?: string;
          delivery_instructions?: string;
        };
        Update: {
          status?: OrderStatus;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          name: string;
          price: number;
          quantity: number;
          image_url: string;
          is_veg: boolean;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id?: string | null;
          name: string;
          price: number;
          quantity: number;
          image_url?: string;
          is_veg?: boolean;
        };
        Update: never;
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          amount: number;
          status: PaymentStatus;
          upi_ref: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id?: string;
          amount: number;
          status?: PaymentStatus;
          upi_ref?: string | null;
        };
        Update: {
          status?: PaymentStatus;
          upi_ref?: string | null;
          verified_at?: string | null;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          menu_item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          menu_item_id: string;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: NotificationType;
          is_read: boolean;
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: NotificationType;
          is_read?: boolean;
          order_id?: string | null;
        };
        Update: {
          is_read?: boolean;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
        };
        Update: {
          value?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type OrderStatus =
  | 'payment_pending'
  | 'waiting_verification'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'processing' | 'verified' | 'failed';

export type NotificationType =
  | 'order_received'
  | 'payment_pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'info'
  | 'offer';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
export type Offer = Database['public']['Tables']['offers']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Setting = Database['public']['Tables']['settings']['Row'];
