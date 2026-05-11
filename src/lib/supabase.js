// src/lib/supabase.js
//
// Step 1: npm install @supabase/supabase-js
// Step 2: Create .env in the project root with:
//   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key
// Step 3: Restart your dev server: npm run dev
//
// Get URL + key from: Supabase Dashboard → Project Settings → API

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[Supabase] Missing env vars. Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(url, anonKey);

// =========================================================================
// Helper: API functions for the marketplace
// =========================================================================

export const api = {
  // ---------- AUTH ----------
  async signUp({ email, password, name, zip }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, zip } },  // passed to handle_new_user trigger
    });
    return { data, error };
  },

  async signIn({ email, password }) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    return profile;
  },

  // ---------- LISTINGS ----------
  async fetchListings(filters = {}) {
    let q = supabase.from("listings").select("*, seller:profiles!seller_id(*)").eq("status", "active");
    if (filters.type) q = q.eq("type", filters.type);
    if (filters.state) q = q.eq("state", filters.state);
    if (filters.category) q = q.eq("category", filters.category);
    return await q.order("created_at", { ascending: false });
  },

  async createListing(listing) {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase.from("listings").insert({ ...listing, seller_id: user.id }).select().single();
  },

  // ---------- AUCTIONS ----------
  async fetchAuctions() {
    return await supabase
      .from("auctions")
      .select("*, seller:profiles!seller_id(*)")
      .eq("status", "active")
      .order("ends_at", { ascending: true });
  },

  async createAuction(auction) {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase.from("auctions").insert({ ...auction, seller_id: user.id }).select().single();
  },

  async placeBid({ auctionId, amount }) {
    const { data: { user } } = await supabase.auth.getUser();
    // Insert bid
    const { error: bidError } = await supabase.from("bids").insert({
      auction_id: auctionId, bidder_id: user.id, amount,
    });
    if (bidError) return { error: bidError };
    // First bid counts as a purchase — complete any pending referral for this user
    this.completeReferralOnPurchase();
    // Update auction current_bid + count
    const { data, error } = await supabase
      .from("auctions")
      .update({ current_bid: amount, bid_count: supabase.rpc("increment_bid_count", { auction_id: auctionId }) })
      .eq("id", auctionId)
      .select()
      .single();
    return { data, error };
  },

  // ---------- VIDEOS ----------
  async fetchVideos() {
    return await supabase
      .from("videos")
      .select("*, channel:profiles!channel_id(*)")
      .order("created_at", { ascending: false });
  },

  async fetchVideoComments(videoId) {
    return await supabase
      .from("video_comments")
      .select("*, user:profiles!user_id(name, avatar)")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });
  },

  async postVideoComment({ videoId, text }) {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase.from("video_comments").insert({ video_id: videoId, user_id: user.id, text }).select().single();
  },

  // ---------- MESSAGES ----------
  async fetchConversations() {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase
      .from("conversations")
      .select("*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });
  },

  async fetchMessages(conversationId) {
    return await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
  },

  async sendMessage({ conversationId, text, isOffer = false, offerAmount = null }) {
    const { data: { user } } = await supabase.auth.getUser();
    // Sending an offer counts as a purchase — complete any pending referral
    if (isOffer) this.completeReferralOnPurchase();
    return await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      text,
      is_offer: isOffer,
      offer_amount: offerAmount,
    }).select().single();
  },

  async startConversation({ sellerId, listingId, listingType }) {
    const { data: { user } } = await supabase.auth.getUser();
    // Look for existing convo
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("buyer_id", user.id)
      .eq("seller_id", sellerId)
      .eq("listing_id", listingId)
      .maybeSingle();
    if (existing) return { data: existing };
    return await supabase
      .from("conversations")
      .insert({ buyer_id: user.id, seller_id: sellerId, listing_id: listingId, listing_type: listingType })
      .select()
      .single();
  },

  // ---------- REVIEWS ----------
  async fetchReviews(sellerId) {
    return await supabase
      .from("reviews")
      .select("*, buyer:profiles!buyer_id(name)")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
  },

  async postReview({ sellerId, rating, text }) {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase
      .from("reviews")
      .insert({ seller_id: sellerId, buyer_id: user.id, rating, text })
      .select()
      .single();
  },

  // ---------- SAVED ----------
  async fetchSaved() {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase.from("saved").select("*").eq("user_id", user.id);
  },

  async toggleSave({ itemId, itemType }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: existing } = await supabase
      .from("saved")
      .select("*")
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .eq("item_type", itemType)
      .maybeSingle();
    if (existing) {
      return await supabase.from("saved").delete().eq("user_id", user.id).eq("item_id", itemId).eq("item_type", itemType);
    } else {
      return await supabase.from("saved").insert({ user_id: user.id, item_id: itemId, item_type: itemType });
    }
  },

  // ---------- REFERRALS ----------
  async generateReferralCode() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data: existing } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) return { data: existing.code };
    const code = "PS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from("referral_codes").insert({ user_id: user.id, code });
    if (error) return { error };
    return { data: code };
  },

  async applyReferralCode(code) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    const { data: refCode } = await supabase
      .from("referral_codes")
      .select("user_id")
      .eq("code", code.toUpperCase().trim())
      .maybeSingle();
    if (!refCode) return { error: "Invalid referral code" };
    if (refCode.user_id === user.id) return { error: "Cannot use your own referral code" };
    // Status starts as "pending" — becomes "completed" on first purchase
    const { error } = await supabase.from("referrals").insert({
      referrer_id: refCode.user_id,
      referred_id: user.id,
      code: code.toUpperCase().trim(),
      status: "pending",
    });
    return { error };
  },

  async sendWelcomeEmail({ email, name, referralCode }) {
    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${referralCode}`;
    return await supabase.functions.invoke("welcome-email", {
      body: { email, name, referralCode, referralLink },
    });
  },

  async completeReferralOnPurchase() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: pending } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_id", user.id)
      .eq("status", "pending")
      .maybeSingle();
    if (!pending) return;
    await supabase.from("referrals").update({ status: "completed" }).eq("id", pending.id);
  },

  async fetchReferralStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { code: null, referrals: [], credits: 0 };
    const [{ data: codeRow }, { data: refs }] = await Promise.all([
      supabase.from("referral_codes").select("code").eq("user_id", user.id).maybeSingle(),
      supabase.from("referrals").select("*, referred:profiles!referred_id(name)").eq("referrer_id", user.id).order("created_at", { ascending: false }),
    ]);
    const referrals = refs || [];
    const completed = referrals.filter(r => r.status === "completed");
    const pending = referrals.filter(r => r.status === "pending");
    return {
      code: codeRow?.code || null,
      referrals,
      completed: completed.length,
      pending: pending.length,
      credits: completed.length * 5,
    };
  },

  // ---------- IMAGE UPLOAD ----------
  async uploadListingImage(file) {
    const { data: { user } } = await supabase.auth.getUser();
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("listings").upload(fileName, file);
    if (error) return { error };
    const { data: { publicUrl } } = supabase.storage.from("listings").getPublicUrl(fileName);
    return { data: { url: publicUrl } };
  },

  // ---------- REALTIME (live bidding, live messaging) ----------
  subscribeToAuction(auctionId, onUpdate) {
    return supabase
      .channel(`auction:${auctionId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` }, onUpdate)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids", filter: `auction_id=eq.${auctionId}` }, onUpdate)
      .subscribe();
  },

  subscribeToConversation(conversationId, onMessage) {
    return supabase
      .channel(`convo:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, onMessage)
      .subscribe();
  },
};
