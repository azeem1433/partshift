-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query

-- Table: one unique referral code per user
CREATE TABLE IF NOT EXISTS referral_codes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code       text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Table: tracks completed referrals (one per referred user)
CREATE TABLE IF NOT EXISTS referrals (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code        text NOT NULL,
  status      text DEFAULT 'completed',
  created_at  timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals      ENABLE ROW LEVEL SECURITY;

-- referral_codes policies
CREATE POLICY "Anyone can read referral codes"
  ON referral_codes FOR SELECT USING (true);

CREATE POLICY "Users insert their own referral code"
  ON referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- referrals policies
CREATE POLICY "Users read their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Authenticated users create referral records"
  ON referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);
