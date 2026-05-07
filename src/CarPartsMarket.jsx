import { useState, useMemo, useEffect, useRef } from "react";
import { api, supabase } from "./lib/supabase";
import PhotoUploader from "./components/PhotoUploader";

/* ============== REGIONS ============== */
const REGIONS = {
  "Northeast": ["CT", "ME", "MA", "NH", "NJ", "NY", "PA", "RI", "VT"],
  "Southeast": ["AL", "AR", "DE", "FL", "GA", "KY", "LA", "MD", "MS", "NC", "SC", "TN", "VA", "WV"],
  "Midwest": ["IL", "IN", "IA", "KS", "MI", "MN", "MO", "NE", "ND", "OH", "SD", "WI"],
  "Southwest": ["AZ", "NM", "OK", "TX"],
  "West": ["AK", "CA", "CO", "HI", "ID", "MT", "NV", "OR", "UT", "WA", "WY"],
};
const STATE_TO_REGION = {};
Object.entries(REGIONS).forEach(([r, ss]) => ss.forEach(s => { STATE_TO_REGION[s] = r; }));
const ALL_STATES = Object.values(REGIONS).flat().sort();

/* ============== DATA ============== */
const initialParts = [
  { id: 1, type: "part", title: "Brembo GT 6-Piston Big Brake Kit", category: "Brakes", price: 1249, condition: "New", sellerId: "u2", city: "Los Angeles", state: "CA", zip: "90001", image: "https://images.unsplash.com/photo-1635073908681-b4dfb7f0aaa6?w=600&q=80", tag: "HOT", desc: "Front big brake kit, fits BMW E46/E90. 6-piston calipers, 380mm rotors, includes pads and stainless lines." },
  { id: 2, type: "part", title: 'Snap-on 1/2" Drive Impact Wrench', category: "Tools", price: 389, condition: "Used – Excellent", sellerId: "u3", city: "Chicago", state: "IL", zip: "60601", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80", tag: "VERIFIED", desc: "Model MG725. Lightly used in pro shop. Calibrated, no leaks. Includes carry case." },
  { id: 3, type: "part", title: "HKS Supercharger Kit – EJ25 Engine", category: "Engine", price: 3450, condition: "New", sellerId: "u4", city: "Houston", state: "TX", zip: "77001", image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&q=80", tag: "NEW", desc: "Brand new in box. Complete bolt-on kit for 2008-2014 Subaru WRX/STI. Includes ECU tune file." },
  { id: 4, type: "part", title: "KW Variant 3 Coilover Suspension", category: "Suspension", price: 2199, condition: "New", sellerId: "u5", city: "Miami", state: "FL", zip: "33101", image: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=600&q=80", tag: "", desc: "Brand new, sealed boxes. Adjustable rebound and compression damping. German engineered." },
  { id: 5, type: "part", title: "Autel OBD2 Pro Diagnostic Scanner", category: "Tools", price: 149, condition: "New", sellerId: "u6", city: "Atlanta", state: "GA", zip: "30301", image: "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?w=600&q=80", tag: "HOT", desc: "Bluetooth scanner with full system diagnostics. Reads ABS, SRS, transmission codes. iOS and Android." },
  { id: 6, type: "part", title: "Mishimoto Top-Mount Intercooler", category: "Cooling", price: 599, condition: "Used – Good", sellerId: "u4", city: "Portland", state: "OR", zip: "97201", image: "https://images.unsplash.com/photo-1599256630537-90681cf6f9b1?w=600&q=80", tag: "", desc: "Top-mount intercooler upgrade for STI. Used one season, perfectly clean condition." },
  { id: 7, type: "part", title: "Akrapovic Titanium Cat-Back Exhaust", category: "Exhaust", price: 1875, condition: "Used – Good", sellerId: "u3", city: "Denver", state: "CO", zip: "80201", image: "https://images.unsplash.com/photo-1605152276897-4f618f831968?w=600&q=80", tag: "", desc: "Cat-back system, M3 F80 fitment. Some heat discoloration on tips. Sounds incredible." },
  { id: 8, type: "part", title: "Milwaukee M18 Fuel 12-Piece Combo Kit", category: "Tools", price: 699, condition: "New", sellerId: "u2", city: "Phoenix", state: "AZ", zip: "85001", image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80", tag: "VERIFIED", desc: "Complete Fuel-series 12-piece kit. Drills, impact, saws, lights, two batteries, charger." },
  { id: 9, type: "part", title: "K&N Cold Air Intake System – F-150", category: "Engine", price: 329, condition: "New", sellerId: "u5", city: "Dallas", state: "TX", zip: "75201", image: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=600&q=80", tag: "", desc: "Performance cold air intake for 5.0L Coyote V8. CARB legal, 50-state compliant." },
  { id: 10, type: "part", title: "OEM Subaru STI BBS Wheels (Set of 4)", category: "Wheels", price: 850, condition: "Used – Excellent", sellerId: "u2", city: "Seattle", state: "WA", zip: "98101", image: "https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=600&q=80", tag: "", desc: "18x8.5 BBS forged. Pulled off a 2018 STI. Minor curb rash on one wheel, otherwise excellent." },
  { id: 11, type: "part", title: "3-Ton Heavy Duty Floor Jack", category: "Tools", price: 89, condition: "Used – Fair", sellerId: "u6", city: "San Francisco", state: "CA", zip: "94101", image: "https://images.unsplash.com/photo-1632823469826-8e5b88e34c89?w=600&q=80", tag: "", desc: "Works fine, some cosmetic scuffs. Quick-lift action. Selling because I upgraded." },
  { id: 12, type: "part", title: "Borla S-Type Performance Mufflers (Pair)", category: "Exhaust", price: 425, condition: "Used – Excellent", sellerId: "u4", city: "Nashville", state: "TN", zip: "37201", image: "https://images.unsplash.com/photo-1597007030739-6d2e7172ee9c?w=600&q=80", tag: "VERIFIED", desc: "Pulled from a Mustang GT after less than 5,000 miles. Clean, no rust, sounds great." },
];

const initialCars = [
  { id: 101, type: "car", make: "Subaru", model: "WRX STI", year: 2018, trim: "Limited", price: 31500, mileage: 42300, transmission: "6-Speed Manual", drivetrain: "AWD", fuel: "Gasoline", color: "World Rally Blue", sellerId: "u2", city: "Seattle", state: "WA", zip: "98101", image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d109?w=800&q=80", tag: "VERIFIED", vin: "JF1VA2*****12345", desc: "Adult-owned, never tracked. Full service records. Tasteful modifications: ECU tune, exhaust, KW coilovers." },
  { id: 102, type: "car", make: "Toyota", model: "Tacoma TRD Off-Road", year: 2021, trim: "Double Cab", price: 38900, mileage: 28500, transmission: "6-Speed Auto", drivetrain: "4WD", fuel: "Gasoline", color: "Cement Gray", sellerId: "u3", city: "Denver", state: "CO", zip: "80201", image: "https://images.unsplash.com/photo-1633493702341-4d04841df53b?w=800&q=80", tag: "HOT", vin: "3TMCZ5A*****8821", desc: "One-owner truck. Bed cover, 2-inch lift, BFG all-terrain tires. All maintenance up to date." },
  { id: 103, type: "car", make: "BMW", model: "M3 Competition", year: 2022, trim: "xDrive Sedan", price: 78500, mileage: 12800, transmission: "8-Speed Auto", drivetrain: "AWD", fuel: "Gasoline", color: "Isle of Man Green", sellerId: "u4", city: "Miami", state: "FL", zip: "33101", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80", tag: "VERIFIED", vin: "WBS8M9*****0042", desc: "Carbon roof, M Driver's Package, full executive package. Always garage-kept and meticulously maintained." },
  { id: 104, type: "car", make: "Ford", model: "Mustang GT", year: 2019, trim: "Premium", price: 28750, mileage: 51000, transmission: "6-Speed Manual", drivetrain: "RWD", fuel: "Gasoline", color: "Race Red", sellerId: "u5", city: "Houston", state: "TX", zip: "77001", image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&q=80", tag: "", vin: "1FA6P8*****3344", desc: "Performance Pack 1 with MagneRide. Bone stock, never modified. Garage queen." },
  { id: 105, type: "car", make: "Honda", model: "Civic Type R", year: 2020, trim: "Touring", price: 36400, mileage: 35200, transmission: "6-Speed Manual", drivetrain: "FWD", fuel: "Gasoline", color: "Championship White", sellerId: "u6", city: "Los Angeles", state: "CA", zip: "90001", image: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&q=80", tag: "HOT", vin: "SHHFK8*****7711", desc: "FK8 generation. Adult-owned, no track use whatsoever. Clean title, two keys." },
  { id: 106, type: "car", make: "Tesla", model: "Model 3 Performance", year: 2023, trim: "AWD", price: 41200, mileage: 18900, transmission: "Single-Speed", drivetrain: "AWD", fuel: "Electric", color: "Pearl White", sellerId: "u2", city: "San Francisco", state: "CA", zip: "94101", image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80", tag: "NEW", vin: "5YJ3E1*****9988", desc: "FSD transferable to next owner. White interior. Includes free Supercharging benefit." },
  { id: 107, type: "car", make: "Jeep", model: "Wrangler Rubicon", year: 2017, trim: "Unlimited", price: 32600, mileage: 67800, transmission: "5-Speed Auto", drivetrain: "4WD", fuel: "Gasoline", color: "Firecracker Red", sellerId: "u3", city: "Phoenix", state: "AZ", zip: "85001", image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d109?w=800&q=80", tag: "", vin: "1C4HJW*****5566", desc: "3-inch lift, 35-inch tires, front and rear lockers. Trail-ready and reliable." },
  { id: 108, type: "car", make: "Porsche", model: "911 Carrera S", year: 2016, trim: "Coupe", price: 72000, mileage: 38400, transmission: "7-Speed PDK", drivetrain: "RWD", fuel: "Gasoline", color: "GT Silver", sellerId: "u4", city: "Atlanta", state: "GA", zip: "30301", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", tag: "VERIFIED", vin: "WP0AB2*****1100", desc: "991.1 Carrera S with Sport Chrono, sport exhaust, premium package plus." },
];

// === AUCTIONS === (each starts with a duration in seconds from "now")
const initialAuctions = [
  { id: 201, type: "auction", itemType: "car", title: "1995 Toyota Supra Turbo MK4", make: "Toyota", model: "Supra Turbo", year: 1995, mileage: 89200, image: "https://images.unsplash.com/photo-1607603750909-408e193868c7?w=800&q=80", category: "JDM Classic", currentBid: 84500, startBid: 60000, reserve: 90000, bidCount: 27, sellerId: "u4", city: "Houston", state: "TX", zip: "77001", endsInSec: 86400 + 7200, desc: "MK4 Supra Turbo with the legendary 6-speed manual. Documented service history. Adult-owned. Reserve not yet met.", tag: "HOT" },
  { id: 202, type: "auction", itemType: "car", title: "1969 Chevrolet Camaro SS 396", make: "Chevrolet", model: "Camaro SS", year: 1969, mileage: 78400, image: "https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800&q=80", category: "American Muscle", currentBid: 51200, startBid: 35000, reserve: 0, bidCount: 41, sellerId: "u3", city: "Chicago", state: "IL", zip: "60601", endsInSec: 3600 * 5, desc: "Numbers-matching 396ci big-block. Ground-up restoration completed in 2018. No reserve auction.", tag: "NEW" },
  { id: 203, type: "auction", itemType: "part", title: "Vintage Snap-on Tool Cabinet (1972)", category: "Tools", image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80", currentBid: 2150, startBid: 800, reserve: 2500, bidCount: 18, sellerId: "u3", city: "Chicago", state: "IL", zip: "60601", endsInSec: 3600 * 28, desc: "Original red Snap-on roll cabinet, 11 drawers, all original handles. Some patina. A piece of history.", tag: "VERIFIED" },
  { id: 204, type: "auction", itemType: "part", title: "Garrett GTX3582R Gen II Turbocharger", category: "Engine", image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&q=80", currentBid: 1825, startBid: 1200, reserve: 0, bidCount: 12, sellerId: "u4", city: "Houston", state: "TX", zip: "77001", endsInSec: 3600 * 12, desc: "Brand new in box. Dual ball bearing center cartridge. T3 inlet flange. No reserve auction.", tag: "" },
  { id: 205, type: "auction", itemType: "part", title: "Recaro Pole Position ABE Seats (Pair)", category: "Interior", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80", currentBid: 1420, startBid: 800, reserve: 1800, bidCount: 9, sellerId: "u2", city: "Los Angeles", state: "CA", zip: "90001", endsInSec: 3600 * 60, desc: "Used pair, FIA certification expired but seats are cosmetically clean. Slider rails included.", tag: "" },
  { id: 206, type: "auction", itemType: "car", title: "2008 Mitsubishi Lancer Evolution X MR", make: "Mitsubishi", model: "Lancer Evolution X MR", year: 2008, mileage: 64200, image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80", category: "JDM", currentBid: 27800, startBid: 18000, reserve: 30000, bidCount: 22, sellerId: "u5", city: "Miami", state: "FL", zip: "33101", endsInSec: 3600 * 40, desc: "Phantom Black, SST dual-clutch transmission, fully unmodified from factory. Two-owner car.", tag: "HOT" },
];

const initialUsers = {
  u1: { id: "u1", name: "You", joined: "2024", avatar: "🧑", rating: 0, totalSales: 0, city: "Franklin", state: "TN", zip: "37064", bio: "" },
  u2: { id: "u2", name: "SpeedKraft", joined: "2021", avatar: "🏁", rating: 4.9, totalSales: 142, city: "Los Angeles", state: "CA", zip: "90001", bio: "Specialty performance shop." },
  u3: { id: "u3", name: "GarageProTools", joined: "2020", avatar: "🔧", rating: 4.8, totalSales: 287, city: "Chicago", state: "IL", zip: "60601", bio: "Pro mechanic." },
  u4: { id: "u4", name: "TurboNation", joined: "2022", avatar: "💨", rating: 5.0, totalSales: 56, city: "Houston", state: "TX", zip: "77001", bio: "Boost specialists." },
  u5: { id: "u5", name: "ChassisTech", joined: "2019", avatar: "🛞", rating: 4.7, totalSales: 198, city: "Miami", state: "FL", zip: "33101", bio: "Suspension experts." },
  u6: { id: "u6", name: "EVNation", joined: "2023", avatar: "⚡", rating: 4.6, totalSales: 41, city: "San Francisco", state: "CA", zip: "94101", bio: "EV specialist." },
};

const initialReviews = [
  { id: 1, sellerId: "u2", buyerName: "Mike R.", rating: 5, date: "2 weeks ago", text: "Brakes arrived fast. Perfect fitment." },
  { id: 2, sellerId: "u2", buyerName: "Sarah K.", rating: 5, date: "1 month ago", text: "Top notch seller." },
  { id: 3, sellerId: "u3", buyerName: "Dave L.", rating: 5, date: "3 weeks ago", text: "Tools as described. Snap-on quality." },
  { id: 4, sellerId: "u4", buyerName: "Carlos M.", rating: 5, date: "1 week ago", text: "Supercharger kit was complete. Highly recommended." },
];

// === VIDEOS === (repair tutorials, how-tos, DIY guides)
const initialVideos = [
  { id: 301, title: "How to Replace Brake Pads & Rotors", category: "Brakes", level: "Beginner", duration: "12:48", views: 142000, likes: 3800, channel: "GarageProTools", channelId: "u3", thumb: "https://images.unsplash.com/photo-1635073908681-b4dfb7f0aaa6?w=600&q=80", desc: "Complete walkthrough including tools needed, torque specs, and the bedding-in procedure. Works for most cars.", tags: ["brakes", "diy", "maintenance"] },
  { id: 302, title: "Coilover Install on a 2018 WRX STI", category: "Suspension", level: "Intermediate", duration: "23:15", views: 89000, likes: 2400, channel: "ChassisTech", channelId: "u5", thumb: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=600&q=80", desc: "Step-by-step KW V3 coilover installation including corner-balancing tips.", tags: ["suspension", "subaru", "install"] },
  { id: 303, title: "Diagnosing Misfires with an OBD2 Scanner", category: "Diagnostics", level: "Beginner", duration: "8:22", views: 256000, likes: 6100, channel: "GarageProTools", channelId: "u3", thumb: "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?w=600&q=80", desc: "Read codes, identify the cylinder, and narrow down causes (coil pack, plug, injector).", tags: ["obd2", "diagnostics", "misfire"] },
  { id: 304, title: "Turbo Install: Garrett GTX3582R", category: "Engine", level: "Advanced", duration: "47:30", views: 64000, likes: 1900, channel: "TurboNation", channelId: "u4", thumb: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&q=80", desc: "Full bolt-on turbo install. Oil and coolant lines, downpipe routing, tuning preparation.", tags: ["turbo", "engine", "advanced"] },
  { id: 305, title: "Cat-Back Exhaust Install in 30 Minutes", category: "Exhaust", level: "Beginner", duration: "11:05", views: 178000, likes: 4500, channel: "SpeedKraft", channelId: "u2", thumb: "https://images.unsplash.com/photo-1605152276897-4f618f831968?w=600&q=80", desc: "Easy weekend modification. Just hand tools required. Sound clip at the end.", tags: ["exhaust", "diy", "easy"] },
  { id: 306, title: "Cold Air Intake: Worth It or Marketing Hype?", category: "Engine", level: "Beginner", duration: "9:40", views: 312000, likes: 8200, channel: "SpeedKraft", channelId: "u2", thumb: "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=600&q=80", desc: "Real dyno numbers, sound test, and an honest verdict on intake modifications.", tags: ["intake", "review", "dyno"] },
  { id: 307, title: "Changing Your Own Oil — Full Walkthrough", category: "Maintenance", level: "Beginner", duration: "7:18", views: 524000, likes: 12000, channel: "GarageProTools", channelId: "u3", thumb: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=600&q=80", desc: "Save fifty dollars at every oil change. Covers tools, oil selection, and proper disposal.", tags: ["maintenance", "oil", "basics"] },
  { id: 308, title: "EV Battery Replacement: What You Need to Know", category: "Maintenance", level: "Advanced", duration: "18:55", views: 41000, likes: 1100, channel: "EVNation", channelId: "u6", thumb: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80", desc: "Cost, available options, refurbished versus new, and key safety considerations.", tags: ["ev", "battery", "tesla"] },
  { id: 309, title: "Flushing Brake Fluid (DOT 3/4) the Right Way", category: "Brakes", level: "Intermediate", duration: "14:22", views: 98000, likes: 2700, channel: "GarageProTools", channelId: "u3", thumb: "https://images.unsplash.com/photo-1599256630537-90681cf6f9b1?w=600&q=80", desc: "Two-person bleed and one-person vacuum methods. Avoid the dreaded spongy pedal.", tags: ["brakes", "fluid", "maintenance"] },
  { id: 310, title: "Wheel Bearing Replacement (Front Hub)", category: "Suspension", level: "Intermediate", duration: "26:40", views: 73000, likes: 1800, channel: "ChassisTech", channelId: "u5", thumb: "https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?w=600&q=80", desc: "Diagnosing the bad bearing, press-out tools, and proper torque specs.", tags: ["bearing", "suspension", "diy"] },
  { id: 311, title: "Reading a Wiring Diagram: Beginner's Guide", category: "Diagnostics", level: "Beginner", duration: "15:10", views: 187000, likes: 4900, channel: "GarageProTools", channelId: "u3", thumb: "https://images.unsplash.com/photo-1617886322207-6f504e7472c5?w=600&q=80", desc: "Decode any factory service manual diagram. Symbols, color codes, signal flow.", tags: ["wiring", "electrical", "basics"] },
  { id: 312, title: "Restoration: Bringing a '69 Camaro Back to Life", category: "Restoration", level: "Advanced", duration: "1:02:34", views: 218000, likes: 7400, channel: "SpeedKraft", channelId: "u2", thumb: "https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=600&q=80", desc: "Multi-month restoration documentary covering bodywork, paint, and full drivetrain rebuild.", tags: ["classic", "restoration", "vintage"] },
];

const videoCategories = ["All", "Brakes", "Suspension", "Engine", "Exhaust", "Diagnostics", "Maintenance", "Restoration"];
const videoLevels = ["Any Level", "Beginner", "Intermediate", "Advanced"];

const partCategories = ["All", "Engine", "Brakes", "Suspension", "Exhaust", "Cooling", "Wheels", "Tools", "Interior"];
const carMakes = ["All", "Subaru", "Toyota", "BMW", "Ford", "Honda", "Tesla", "Jeep", "Porsche"];
const auctionCats = ["All", "Cars", "Parts"];
const tagColors = { HOT: "#ff3b30", NEW: "#34c759", VERIFIED: "#007aff" };
const C = { bg: "#f7f8fa", surface: "#ffffff", card: "#ffffff", border: "#e4e7ec", accent: "#e89400", text: "#1a1d24", muted: "#6b7280", red: "#dc2626", green: "#16a34a", blue: "#2563eb", purple: "#7c3aed" };

const isNew = (cond) => cond === "New";
const isUsed = (cond) => cond && cond !== "New";

const formatTime = (s) => {
  if (s <= 0) return "ENDED";
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
};

// Format a message timestamp into a friendly relative+absolute label
// e.g. "Just now", "5m ago", "Yesterday 3:42 PM", "Mar 12, 2:18 PM"
const formatChatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = (now - d) / 1000; // seconds
  if (diff < 5) return "Just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  const sameDay = d.toDateString() === now.toDateString();
  const time12 = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return time12;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${time12}`;
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }) + ` ${time12}`;
};


const fallbackImage = (item) => {
  if (!item) return "📦";
  return item.image_url || item.image || (Array.isArray(item.images) && item.images.length ? item.images[0] : "📦");
};

const normalizeProfile = (profile) => {
  if (!profile) return null;
  return {
    ...profile,
    id: profile.id,
    name: profile.name || "Seller",
    avatar: profile.avatar || "👤",
    rating: Number(profile.rating || 0),
    totalSales: profile.total_sales ?? profile.totalSales ?? 0,
    joined: profile.joined ? String(new Date(profile.joined).getFullYear()) : "2026",
    city: profile.city || "—",
    state: profile.state || "—",
    zip: profile.zip || "",
  };
};

const normalizeListing = (row) => {
  if (!row) return row;
  const seller = normalizeProfile(row.seller);
  return {
    ...row,
    id: row.id,
    type: row.type,
    title: row.title || `${row.year || ""} ${row.make || ""} ${row.model || ""}`.trim(),
    desc: row.description || row.desc || "",
    description: row.description || row.desc || "",
    price: Number(row.price || 0),
    image: fallbackImage(row),
    sellerId: row.seller_id || row.sellerId,
    seller,
    tag: row.tag || "",
    condition: row.condition || "Used – Good",
    category: row.category || (row.type === "car" ? "Cars" : "Parts"),
    mileage: Number(row.mileage || 0),
    year: row.year ? Number(row.year) : row.year,
  };
};

const normalizeAuction = (row) => {
  if (!row) return row;
  const seller = normalizeProfile(row.seller);
  const endsAt = row.ends_at ? new Date(row.ends_at).getTime() : Date.now();
  return {
    ...row,
    type: "auction",
    itemType: row.item_type || row.itemType,
    desc: row.description || row.desc || "",
    description: row.description || row.desc || "",
    image: fallbackImage(row),
    sellerId: row.seller_id || row.sellerId,
    seller,
    startBid: Number(row.start_bid ?? row.startBid ?? 0),
    currentBid: Number(row.current_bid ?? row.currentBid ?? 0),
    bidCount: Number(row.bid_count ?? row.bidCount ?? 0),
    endsInSec: Math.max(0, Math.floor((endsAt - Date.now()) / 1000)),
    reserve: Number(row.reserve || 0),
    mileage: Number(row.mileage || 0),
    year: row.year ? Number(row.year) : row.year,
  };
};

/* ============== APP ============== */
export default function App() {
  const [view, setView] = useState("browse");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", zip: "", referralCode: "" });
  const [referralStats, setReferralStats] = useState(null);

  const [parts, setParts] = useState([]);
  const [cars, setCars] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [videos, setVideos] = useState(initialVideos);
  const [users, setUsers] = useState(initialUsers);
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);

      const [{ data: partRows, error: partError }, { data: carRows, error: carError }, { data: auctionRows, error: auctionError }] = await Promise.all([
        api.fetchListings({ type: "part" }),
        api.fetchListings({ type: "car" }),
        api.fetchAuctions(),
      ]);

      if (!mounted) return;

      if (partError) console.error("Parts error:", partError);
      if (carError) console.error("Cars error:", carError);
      if (auctionError) console.error("Auctions error:", auctionError);

      const nextParts = (partRows || []).map(normalizeListing);
      const nextCars = (carRows || []).map(normalizeListing);
      const nextAuctions = (auctionRows || []).map(normalizeAuction);

      setParts(nextParts);
      setCars(nextCars);
      setAuctions(nextAuctions);

      const profileMap = {};
      [...nextParts, ...nextCars, ...nextAuctions].forEach((item) => {
        if (item.seller?.id) profileMap[item.seller.id] = item.seller;
      });
      if (Object.keys(profileMap).length) setUsers((prev) => ({ ...prev, ...profileMap }));

      setLoading(false);
    }

    loadData();

    api.getCurrentUser().then((profile) => {
      if (!mounted || !profile) return;
      const normalized = normalizeProfile(profile);
      setUser(normalized);
      setUsers((prev) => ({ ...prev, [normalized.id]: normalized }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setUser(null);
        return;
      }
      api.getCurrentUser().then((profile) => {
        if (!mounted || !profile) return;
        const normalized = normalizeProfile(profile);
        setUser(normalized);
        setUsers((prev) => ({ ...prev, [normalized.id]: normalized }));
      });
    });

    // Detect referral code in URL (?ref=PS-XXXXXX)
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setAuthForm(prev => ({ ...prev, referralCode: refCode.toUpperCase() }));
      setView("auth");
      setAuthMode("signup");
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Video state
  const [videoCat, setVideoCat] = useState("All");
  const [videoLevel, setVideoLevel] = useState("Any Level");
  const [videoSearch, setVideoSearch] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoComments, setVideoComments] = useState({});
  const [commentDraft, setCommentDraft] = useState("");
  const [likedVideos, setLikedVideos] = useState([]);

  // Tick down auction timers every second
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    setAuctions(prev => prev.map(a => ({ ...a, endsInSec: Math.max(0, a.endsInSec - 1) })));
    // eslint-disable-next-line
  }, [tick]);

  // Inject global CSS once: kill body margin so the page fills edge-to-edge
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      html, body, #root {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        min-height: 100vh;
        background: ${C.bg} !important;
        overflow-x: hidden !important;
      }
      html { color-scheme: light; }
      * { box-sizing: border-box; }
      img { max-width: 100%; height: auto; }
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-6px); opacity: 1; }
      }

      /* Messaging layout — stack vertically on narrow screens */
      @media (max-width: 720px) {
        .ps-msg-layout { flex-direction: column !important; height: auto !important; max-height: none !important; }
        .ps-convo-list { width: 100% !important; min-width: 0 !important; flex: 0 0 auto !important; max-height: 220px !important; border-right: none !important; border-bottom: 1px solid ${C.border} !important; }
        .ps-msg-panel { width: 100% !important; min-height: 70vh !important; }
      }
    `;
    document.head.appendChild(styleEl);

    // Make sure there's a proper viewport meta tag (Vite's index.html may not have one)
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    let createdViewport = false;
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
      createdViewport = true;
    }
    const prevContent = viewportMeta.getAttribute("content");
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");

    return () => {
      document.head.removeChild(styleEl);
      if (createdViewport) document.head.removeChild(viewportMeta);
      else if (prevContent) viewportMeta.setAttribute("content", prevContent);
    };
  }, []);

  // Filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeMake, setActiveMake] = useState("All");
  const [carSearch, setCarSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [maxMileage, setMaxMileage] = useState(150000);
  const [auctionCat, setAuctionCat] = useState("All");
  const [auctionSearch, setAuctionSearch] = useState("");
  const [showEnded, setShowEnded] = useState(false);

  // Location
  const [locMode, setLocMode] = useState("any");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterState, setFilterState] = useState("");
  const [zipFilter, setZipFilter] = useState("");
  const [maxDistance, setMaxDistance] = useState("100");
  const [sortBy, setSortBy] = useState("featured");

  // Marketplace
  const [saved, setSaved] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [msgDraft, setMsgDraft] = useState("");
  const [offerDraft, setOfferDraft] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [bidDraft, setBidDraft] = useState("");
  const [showBidModal, setShowBidModal] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, text: "" });
  const [selected, setSelected] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null);

  // Sell
  const [sellMode, setSellMode] = useState("part");
  const [sellForm, setSellForm] = useState({ title: "", category: "Engine", price: "", condition: "New", description: "", city: "", state: "", zip: "", listAsAuction: false, startBid: "", duration: "3", reserve: "", photos: [] });
  const [carForm, setCarForm] = useState({ make: "", model: "", year: "", trim: "", price: "", mileage: "", transmission: "Automatic", drivetrain: "FWD", fuel: "Gasoline", color: "", description: "", city: "", state: "", vin: "", zip: "", listAsAuction: false, startBid: "", duration: "7", reserve: "", photos: [] });
  const [sellSuccess, setSellSuccess] = useState(false);

  // === Help Chatbot ===
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Hi! I'm PartShift Assistant 🤖 I can help you find parts, understand auctions, navigate the site, or troubleshoot issues. What do you need?" }
  ]);
  const [chatDraft, setChatDraft] = useState("");
  // Agent handoff state
  const [chatMode, setChatMode] = useState("bot"); // "bot" | "connecting" | "agent"
  const [liveAgent, setLiveAgent] = useState(null); // {name, avatar}
  const [userMessageCount, setUserMessageCount] = useState(0); // track turns to know when to offer agent
  const chatScrollRef = useRef(null);
  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

  // ========== MESSAGING — load conversations whenever the user signs in ==========
  // Track last-read timestamps per conversation in localStorage so unread counts survive refresh
  const [lastReadMap, setLastReadMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("partshift_lastRead") || "{}"); }
    catch { return {}; }
  });
  const markConvoRead = (convoId) => {
    const updated = { ...lastReadMap, [convoId]: Date.now() };
    setLastReadMap(updated);
    try { localStorage.setItem("partshift_lastRead", JSON.stringify(updated)); }
    catch { /* private browsing — ignore */ }
  };

  // Track typing status per conversation: { [convoId]: { name, until } }
  const [typingMap, setTypingMap] = useState({});

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveConvo(null);
      setActiveMessages([]);
      return;
    }
    let cancelled = false;
    api.fetchConversations().then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error("[fetchConversations]", error);
        return;
      }
      if (data) setConversations(data);
    });
    return () => { cancelled = true; };
  }, [user]);

  // ========== MESSAGING — GLOBAL subscription to all incoming messages ==========
  // Fires regardless of which page user is on, so the unread badge in the header
  // updates when a message arrives while they're browsing parts/cars/etc.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`user-inbox:${user.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new;
          if (!m || m.sender_id === user.id) return; // only count messages from others
          // Refresh conversation list to update preview + unread state
          api.fetchConversations().then(({ data }) => {
            if (data) setConversations(data);
          });
          // If this is the conversation we're currently viewing, mark as read
          if (m.conversation_id === activeConvo && view === "messages") {
            markConvoRead(m.conversation_id);
          }
        })
      .subscribe();
    return () => {
      if (channel?.unsubscribe) channel.unsubscribe();
      else if (supabase?.removeChannel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [user, activeConvo, view]);

  // Mark active conversation as read whenever we open it or new messages arrive in it
  useEffect(() => {
    if (activeConvo && view === "messages" && activeMessages.length > 0) {
      markConvoRead(activeConvo);
    }
    // eslint-disable-next-line
  }, [activeConvo, view, activeMessages.length]);

  // Compute unread count: messages from other users newer than my lastReadAt
  // For the global header badge, we count CONVERSATIONS that have unread, not raw messages
  const unreadConvoIds = useMemo(() => {
    if (!user) return [];
    return conversations.filter(c => {
      const lastRead = lastReadMap[c.id] || 0;
      // Use the latest activity timestamp on this convo; fall back to created_at
      const latest = c.last_message_at ? new Date(c.last_message_at).getTime() : new Date(c.created_at).getTime();
      // Only count as unread if the latest activity wasn't from us
      const lastSenderIsUs = c.last_sender_id === user.id;
      return !lastSenderIsUs && latest > lastRead;
    }).map(c => c.id);
  }, [conversations, lastReadMap, user]);

  // ========== MESSAGING — load messages when active convo changes + subscribe to realtime ==========
  // Hold the active channel in a ref so sendTypingBroadcast can reuse it (must be the
  // same channel instance that's subscribed; creating a new one won't deliver to peers).
  const activeChannelRef = useRef(null);

  useEffect(() => {
    if (!activeConvo) {
      setActiveMessages([]);
      activeChannelRef.current = null;
      return;
    }
    let cancelled = false;

    api.fetchMessages(activeConvo).then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error("[fetchMessages]", error);
        return;
      }
      if (data) setActiveMessages(data);
    });

    // One channel for DB inserts (new messages) AND broadcast events (typing).
    // Note: we attach the broadcast listener BEFORE subscribe(), and we keep the
    // channel ref so the input handler can call channel.send() on the same instance.
    const channel = supabase.channel(`convo:${activeConvo}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConvo}` },
        (payload) => {
          if (cancelled) return;
          const newMsg = payload.new;
          if (!newMsg) return;
          setActiveMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          // Sender just sent → clear their typing indicator
          setTypingMap(prev => {
            const next = { ...prev };
            delete next[activeConvo];
            return next;
          });
          api.fetchConversations().then(({ data }) => {
            if (!cancelled && data) setConversations(data);
          });
        })
      .on("broadcast", { event: "typing" }, (payload) => {
        if (cancelled) return;
        const { userId, name } = payload.payload || {};
        if (!userId || userId === user?.id) return;
        setTypingMap(prev => ({
          ...prev,
          [activeConvo]: { name: name || "Someone", until: Date.now() + 4000 },
        }));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          activeChannelRef.current = channel;
        }
      });

    return () => {
      cancelled = true;
      activeChannelRef.current = null;
      if (channel?.unsubscribe) channel.unsubscribe();
      else if (supabase?.removeChannel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [activeConvo]);

  // Sweep stale typing indicators every second
  useEffect(() => {
    const id = setInterval(() => {
      setTypingMap(prev => {
        const now = Date.now();
        let changed = false;
        const next = {};
        Object.entries(prev).forEach(([k, v]) => {
          if (v.until > now) next[k] = v;
          else changed = true;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Send typing broadcast through the EXISTING subscribed channel.
  // Debounced to once per ~2s so we don't spam the channel on every keystroke.
  const lastTypingSentRef = useRef(0);
  const sendTypingBroadcast = () => {
    if (!activeConvo || !user) return;
    const ch = activeChannelRef.current;
    if (!ch) return; // not subscribed yet — silently skip
    const now = Date.now();
    if (now - lastTypingSentRef.current < 2000) return;
    lastTypingSentRef.current = now;
    ch.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id, name: user.name || "Someone" },
    });
  };

  // Auto-scroll the message panel to the bottom when new messages arrive
  const messagesScrollRef = useRef(null);
  useEffect(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, [activeMessages]);

  // Pool of mock agent identities for the demo. With a real backend (Intercom,
  // Crisp, Zendesk, your own Supabase channel), you'd pull this from an
  // "online agents" table and route based on their availability.
  const AGENT_POOL = [
    { name: "Marcus T.", avatar: "👨🏽‍🔧", title: "Senior Support Specialist" },
    { name: "Priya S.", avatar: "👩🏾‍💼", title: "Marketplace Support" },
    { name: "Jordan R.", avatar: "🧑🏻‍💻", title: "Trust & Safety" },
  ];

  // Detects if the user clearly needs human help — direct request or signals
  // of frustration / complex disputes that the bot shouldn't try to resolve.
  const wantsHumanHelp = (q) => {
    const t = q.toLowerCase();
    return (
      t.includes("agent") ||
      t.includes("human") ||
      t.includes("real person") ||
      t.includes("speak to") ||
      t.includes("talk to") ||
      t.includes("representative") ||
      t.includes("manager") ||
      t.includes("dispute") ||
      t.includes("refund") ||
      t.includes("scam") ||
      t.includes("fraud") ||
      t.includes("lawsuit") ||
      t.includes("complaint") ||
      t.includes("not working") ||
      t.includes("doesn't work") ||
      t.includes("broken") ||
      t.includes("urgent") ||
      t.includes("emergency")
    );
  };

  const connectToAgent = () => {
    setChatMode("connecting");
    setChatMessages(prev => [
      ...prev,
      { from: "system", text: "🔄 Connecting you with a live agent..." }
    ]);
    // Simulate the connection delay — real backend would await an
    // agent accept event from your support tool.
    setTimeout(() => {
      const agent = AGENT_POOL[Math.floor(Math.random() * AGENT_POOL.length)];
      setLiveAgent(agent);
      setChatMode("agent");
      setChatMessages(prev => [
        ...prev,
        { from: "system", text: `✓ ${agent.name} (${agent.title}) joined the chat.` },
        { from: "agent", text: `Hi${user ? " " + user.name : ""}, I'm ${agent.name.split(" ")[0]}. I just read your conversation — give me a moment to look into this for you.` },
      ]);
    }, 2200);
  };

  const endAgentChat = () => {
    setChatMessages(prev => [
      ...prev,
      { from: "system", text: `${liveAgent?.name || "Agent"} ended the conversation. You're back with the assistant.` },
    ]);
    setLiveAgent(null);
    setChatMode("bot");
    setUserMessageCount(0);
  };

  const botReply = (q) => {
    const text = q.toLowerCase();
    if (text.includes("video") || text.includes("tutorial") || text.includes("how-to") || text.includes("how to") || text.includes("repair") || text.includes("install") || text.includes("guide") || text.includes("learn")) return "Click the 🎬 Videos tab to watch repair tutorials and how-to guides — covering brakes, suspension, engine work, diagnostics, and full restorations. Filter by category (Brakes, Engine, etc.) and skill level (Beginner, Intermediate, Advanced). Each video has comments where you can ask questions.";
    if (text.includes("auction") && (text.includes("how") || text.includes("work"))) return "Auctions work like this: click any auction listing → press 'Place Bid' → enter your amount (must beat current bid). Highest bidder when the timer hits 0 wins. If a reserve is set, the listing only sells if the reserve is met. No-reserve auctions sell to the highest bid no matter what.";
    if (text.includes("bid")) return "To bid: open the Auctions tab, click a listing, and tap 'Place Bid'. You must bid higher than the current bid. You'll get notified if you're outbid.";
    if (text.includes("reserve")) return "A reserve is the minimum price the seller will accept. If bids don't reach it, the auction ends with no sale. Listings marked 'No Reserve' will always sell to the highest bidder.";
    if (text.includes("offer") && !text.includes("auction")) return "On regular (non-auction) listings, you can use 'Make an Offer' to negotiate privately with the seller. Open any listing detail page and click the offer button.";
    if (text.includes("sell") || text.includes("list")) return "To list something: click 'Sell' in the top nav. Choose Part/Tool or Used Car. Fill in the form, optionally toggle 'List as Auction' to enable bidding instead of a fixed price. You'll need to be signed in.";
    if (text.includes("ship")) return "Shipping is arranged directly between buyer and seller via the Messages feature. Most sellers offer USPS, UPS, or freight for larger items. Cars are typically arranged for local pickup or buyer's transport.";
    if (text.includes("fee") || text.includes("cost")) return "Listing is free. We charge 3% on parts/tools when sold, flat $99 on car sales, and 5% on auction wins. Buyers pay no fees beyond the agreed price.";
    if (text.includes("location") || text.includes("near") || text.includes("region") || text.includes("state") || text.includes("zip") || text.includes("distance")) return "You can filter listings by location: choose 'By Region' (Northeast/Southeast/Midwest/Southwest/West), 'By State', or 'Near Me' (zip code + max distance). The location bar appears at the top of every browse page.";
    if (text.includes("new") || text.includes("used")) return "Use the New/Used toggle above the filters on the Parts page to show only new items, only used items, or both. Each card shows a NEW or USED badge in the top-left corner of the photo.";
    if (text.includes("message") || text.includes("seller") || text.includes("contact")) return "Click 'Message' on any listing to start a chat with the seller. All your conversations live in the Messages tab in the top nav.";
    if (text.includes("review") || text.includes("rating")) return "Every seller has a profile page with their rating, total sales, and reviews. Click any seller's name on a listing to view it. After a transaction, you can leave a star rating and a written review.";
    if (text.includes("save") || text.includes("favorite") || text.includes("watchlist")) return "Tap the heart icon on any listing to save it. View all saved items in the ❤️ tab in the top nav.";
    if (text.includes("account") || text.includes("sign") || text.includes("login") || text.includes("register")) return "Click 'Sign In' in the top right. New here? Switch to 'Create Account', enter your email, password, and zip code to get started.";
    if (text.includes("safe")) return "Stay safe: only message inside PartShift, never wire money, ask for VIN/maintenance records on cars, request inspection photos, and prefer in-person pickup or escrow for high-value items.";
    if (text.includes("hi") || text.includes("hello") || text.includes("hey")) return "Hey! Ask me about auctions, listings, shipping, fees, location filters, or anything else about using PartShift.";
    if (text.includes("thank")) return "Anytime! Anything else I can help you with?";
    return "I can help with: auctions & bidding, buying & selling, repair videos, location filters, messaging sellers, fees, shipping, and account questions. What would you like to know?";
  };

  // Mock live-agent reply. With a real backend (Intercom, Supabase Realtime,
  // your own websocket), this is replaced with a subscription to the agent's
  // outgoing messages on a support channel.
  const agentReply = (q) => {
    const t = q.toLowerCase();
    if (t.includes("refund") || t.includes("dispute") || t.includes("scam") || t.includes("fraud")) {
      return "I'm sorry you're dealing with this. To open a formal dispute I'll need: (1) the listing URL or ID, (2) the seller's username, and (3) screenshots of your conversation. Send those over and I'll escalate to our trust & safety team within the hour.";
    }
    if (t.includes("payment") || t.includes("paid") || t.includes("money")) {
      return "Got it. Can you confirm the payment method used and the date the transaction was completed? Once I have that, I can pull the records on our side and help reconcile.";
    }
    if (t.includes("not working") || t.includes("broken") || t.includes("error")) {
      return "Thanks for the details. Could you share a screenshot of what you're seeing, plus your browser and device? I'll loop in our engineering team if it's a platform issue.";
    }
    return "Thanks — let me look into that for you. One moment while I check our records.";
  };

  const sendChat = () => {
    if (!chatDraft.trim()) return;
    const text = chatDraft;
    const userMsg = { from: "user", text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatDraft("");

    // ---- AGENT MODE: live agent is connected, route to them ----
    if (chatMode === "agent") {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { from: "agent", text: agentReply(text) }]);
      }, 1400);
      return;
    }

    // ---- CONNECTING MODE: queue the message until agent arrives ----
    if (chatMode === "connecting") {
      // user already requested an agent — just acknowledge
      setTimeout(() => {
        setChatMessages(prev => [...prev, { from: "system", text: "Your message has been logged. An agent will be with you shortly." }]);
      }, 600);
      return;
    }

    // ---- BOT MODE ----
    const nextCount = userMessageCount + 1;
    setUserMessageCount(nextCount);

    // 1. Explicit request for human → connect immediately
    if (wantsHumanHelp(text)) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          from: "bot",
          text: "Sounds like this is something a real person should help you with. Connecting you to the next available agent now."
        }]);
        setTimeout(connectToAgent, 800);
      }, 600);
      return;
    }

    // 2. Normal bot reply
    const reply = botReply(text);
    setTimeout(() => setChatMessages(prev => [...prev, { from: "bot", text: reply }]), 600);

    // 3. After 3 user messages, proactively offer a live agent
    if (nextCount === 3) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          from: "bot",
          text: "Still have questions or need someone to look at your specific situation? I can connect you with a live agent.",
          showAgentButton: true,
        }]);
      }, 1400);
    }
  };

  // === HELPERS ===
  const distance = (a, b) => {
    if (!a || !b) return null;
    const x = parseInt(a, 10), y = parseInt(b, 10);
    if (isNaN(x) || isNaN(y)) return null;
    return Math.abs(x - y) / 30;
  };

  const passesLocation = (item) => {
    if (locMode === "any") return true;
    if (locMode === "region" && filterRegion) return STATE_TO_REGION[item.state] === filterRegion;
    if (locMode === "state" && filterState) return item.state === filterState;
    if (locMode === "zip" && zipFilter) {
      const d = distance(zipFilter, item.zip);
      return d == null ? true : d <= +maxDistance;
    }
    return true;
  };

  const sortFn = (a, b) => {
    const pA = a.price || a.currentBid || 0;
    const pB = b.price || b.currentBid || 0;
    if (sortBy === "price-asc") return pA - pB;
    if (sortBy === "price-desc") return pB - pA;
    if (sortBy === "miles-asc") return (a.mileage || 0) - (b.mileage || 0);
    if (sortBy === "year-desc") return (b.year || 0) - (a.year || 0);
    if (sortBy === "ending") return (a.endsInSec || 999999) - (b.endsInSec || 999999);
    if (sortBy === "distance" && zipFilter) {
      return (distance(zipFilter, a.zip) ?? 999999) - (distance(zipFilter, b.zip) ?? 999999);
    }
    return 0;
  };

  const filteredParts = useMemo(() => parts
    .filter(l => activeCategory === "All" || l.category === activeCategory)
    .filter(l => conditionFilter === "all" || (conditionFilter === "new" ? isNew(l.condition) : isUsed(l.condition)))
    .filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase()))
    .filter(passesLocation).sort(sortFn)
  , [parts, activeCategory, conditionFilter, search, locMode, filterRegion, filterState, zipFilter, maxDistance, sortBy]);

  const filteredCars = useMemo(() => cars
    .filter(c => activeMake === "All" || c.make === activeMake)
    .filter(c => `${c.year} ${c.make} ${c.model} ${c.trim}`.toLowerCase().includes(carSearch.toLowerCase()))
    .filter(c => c.price <= maxPrice && c.mileage <= maxMileage)
    .filter(passesLocation).sort(sortFn)
  , [cars, activeMake, carSearch, maxPrice, maxMileage, locMode, filterRegion, filterState, zipFilter, maxDistance, sortBy]);

  const filteredAuctions = useMemo(() => auctions
    .filter(a => auctionCat === "All" || (auctionCat === "Cars" ? a.itemType === "car" : a.itemType === "part"))
    .filter(a => (a.title || "").toLowerCase().includes(auctionSearch.toLowerCase()))
    .filter(a => showEnded || a.endsInSec > 0)
    .filter(passesLocation).sort(sortFn)
  , [auctions, auctionCat, auctionSearch, showEnded, locMode, filterRegion, filterState, zipFilter, maxDistance, sortBy]);

  // === ACTIONS ===
  const requireAuth = () => { if (!user) { setView("auth"); return false; } return true; };

  const handleAuth = async () => {
    if (authMode === "signup") {
      if (!authForm.name || !authForm.email || !authForm.password) {
        alert("Enter name, email, and password.");
        return;
      }

      const { error } = await api.signUp({
        email: authForm.email,
        password: authForm.password,
        name: authForm.name,
        zip: authForm.zip,
      });
      if (error) return alert(error.message);

      // Apply referral code if provided (silently ignore errors — don't block signup)
      if (authForm.referralCode.trim()) {
        await api.applyReferralCode(authForm.referralCode);
      }
      // Auto-generate a referral code for the new user
      await api.generateReferralCode();
    } else {
      if (!authForm.email || !authForm.password) {
        alert("Enter email and password.");
        return;
      }

      const { error } = await api.signIn({
        email: authForm.email,
        password: authForm.password,
      });
      if (error) return alert(error.message);
    }

    const profile = await api.getCurrentUser();
    if (profile) {
      const normalized = normalizeProfile(profile);
      setUser(normalized);
      setUsers((prev) => ({ ...prev, [normalized.id]: normalized }));
    }

    setAuthForm({ name: "", email: "", password: "", zip: "", referralCode: "" });
    setView("browse");
  };
  const toggleSave = (id) => {
    if (!requireAuth()) return;
    setSaved(saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id]);
  };

  const startConversation = async (sellerId, listingId, listingType = "listing") => {
    if (!requireAuth()) return;
    if (sellerId === user.id) {
      alert("You can't message yourself.");
      return;
    }
    try {
      const { data, error } = await api.startConversation({ sellerId, listingId, listingType });
      if (error) throw error;
      // Refresh conversation list
      const { data: convos } = await api.fetchConversations();
      if (convos) setConversations(convos);
      setActiveConvo(data.id);
      setView("messages");
    } catch (err) {
      console.error("[startConversation]", err);
      alert("Couldn't start conversation: " + (err.message || "unknown error"));
    }
  };

  const sendMessage = async () => {
    if (!msgDraft.trim() || !activeConvo) return;
    const text = msgDraft;
    setMsgDraft(""); // clear immediately so the user knows the send fired
    try {
      const { error } = await api.sendMessage({ conversationId: activeConvo, text });
      if (error) throw error;
      // Realtime subscription (below) will push the new message into state.
      // As a fallback for the sender's own UI, refetch immediately:
      const { data: msgs } = await api.fetchMessages(activeConvo);
      if (msgs) setActiveMessages(msgs);
    } catch (err) {
      console.error("[sendMessage]", err);
      alert("Couldn't send message: " + (err.message || "unknown error"));
      setMsgDraft(text); // restore draft so user can retry
    }
  };

  const submitOffer = async () => {
    if (!requireAuth() || !offerDraft || !selected) return;
    setShowOfferModal(false);
    const amt = +offerDraft;
    setOfferDraft("");
    try {
      // Open or fetch existing conversation
      const { data: convo, error: convoErr } = await api.startConversation({
        sellerId: selected.sellerId,
        listingId: selected.id,
        listingType: selected.type === "auction" ? "auction" : "listing",
      });
      if (convoErr) throw convoErr;
      // Post the offer as a real message
      const { error: msgErr } = await api.sendMessage({
        conversationId: convo.id,
        text: `💰 Offer submitted: $${amt.toLocaleString()}`,
        isOffer: true,
        offerAmount: amt,
      });
      if (msgErr) throw msgErr;
      // Refresh convo list and switch to it
      const { data: convos } = await api.fetchConversations();
      if (convos) setConversations(convos);
      setActiveConvo(convo.id);
      setView("messages");
    } catch (err) {
      console.error("[submitOffer]", err);
      alert("Couldn't submit offer: " + (err.message || "unknown error"));
    }
  };

  const submitBid = async () => {
    if (!requireAuth() || !bidDraft || !selected) return;
    const amt = +bidDraft;
    if (amt <= selected.currentBid) {
      alert(`Your bid must be higher than the current bid of $${selected.currentBid.toLocaleString()}`);
      return;
    }

    const { error } = await api.placeBid({ auctionId: selected.id, amount: amt });
    if (error) return alert(error.message);

    setAuctions(prev => prev.map(a => a.id === selected.id
      ? { ...a, currentBid: amt, current_bid: amt, bidCount: a.bidCount + 1, bid_count: (a.bidCount || 0) + 1, lastBidder: user.id }
      : a));
    setSelected({ ...selected, currentBid: amt, current_bid: amt, bidCount: selected.bidCount + 1, bid_count: (selected.bidCount || 0) + 1, lastBidder: user.id });
    setShowBidModal(false);
    setBidDraft("");
  };
  const submitReview = (sellerId) => {
    if (!requireAuth() || !reviewDraft.text.trim()) return;
    const newReview = { id: Date.now(), sellerId, buyerName: user.name, rating: reviewDraft.rating, date: "just now", text: reviewDraft.text };
    setReviews([newReview, ...reviews]);
    setReviewDraft({ rating: 5, text: "" });
  };

  const deleteListing = async (item) => {
    if (!requireAuth()) return;
    if (item.sellerId !== user.id) {
      alert("You can only delete your own listings.");
      return;
    }
    const label =
      item.type === "auction"
        ? `the auction "${item.title}"`
        : item.type === "car"
        ? `your ${item.year} ${item.make} ${item.model}`
        : `"${item.title}"`;
    if (!window.confirm(`Are you sure you want to delete ${label}? This cannot be undone.`)) return;

    try {
      const table = item.type === "auction" ? "auctions" : "listings";
      const { error } = await supabase.from(table).delete().eq("id", item.id);
      if (error) {
        alert("Could not delete: " + error.message);
        return;
      }
      // Remove from local state
      if (item.type === "auction") {
        setAuctions(prev => prev.filter(a => a.id !== item.id));
      } else if (item.type === "car") {
        setCars(prev => prev.filter(c => c.id !== item.id));
      } else {
        setParts(prev => prev.filter(p => p.id !== item.id));
      }
      setSaved(prev => prev.filter(s => s !== item.id));
      // If currently viewing this item, go back
      if (selected && selected.id === item.id) {
        setSelected(null);
        setView(item.type === "car" ? "cars" : item.type === "auction" ? "auctions" : "browse");
      }
    } catch (err) {
      console.error("[delete] failed", err);
      alert("Delete failed. Check console for details.");
    }
  };

  const handleSellSubmit = async () => {
    if (!requireAuth()) return;

    if (sellMode === "part") {
      if (!sellForm.title || (!sellForm.price && !sellForm.listAsAuction)) {
        alert("Enter a title and price/start bid.");
        return;
      }

      if (sellForm.listAsAuction) {
        const endsAt = new Date(Date.now() + (+sellForm.duration || 3) * 86400 * 1000).toISOString();
        const { data, error } = await api.createAuction({
          item_type: "part",
          title: sellForm.title,
          category: sellForm.category,
          description: sellForm.description,
          start_bid: +sellForm.startBid || 1,
          current_bid: +sellForm.startBid || 1,
          reserve: +sellForm.reserve || 0,
          ends_at: endsAt,
          city: sellForm.city || user.city,
          state: sellForm.state || user.state,
          zip: sellForm.zip || user.zip,
          tag: "NEW",
          image_url: sellForm.photos?.[0] || null,
          images: sellForm.photos || [],
        });
        if (error) return alert(error.message);
        setAuctions([normalizeAuction(data), ...auctions]);
      } else {
        const { data, error } = await api.createListing({
          type: "part",
          title: sellForm.title,
          category: sellForm.category,
          price: +sellForm.price,
          condition: sellForm.condition,
          description: sellForm.description,
          city: sellForm.city || user.city,
          state: sellForm.state || user.state,
          zip: sellForm.zip || user.zip,
          tag: isNew(sellForm.condition) ? "NEW" : "",
          image_url: sellForm.photos?.[0] || null,
          images: sellForm.photos || [],
        });
        if (error) return alert(error.message);
        setParts([normalizeListing(data), ...parts]);
      }
    } else {
      if (!carForm.make || !carForm.model || (!carForm.price && !carForm.listAsAuction)) {
        alert("Enter make, model, and price/start bid.");
        return;
      }

      // VIN is required for auction cars, and recommended for fixed-price cars
      const vin = (carForm.vin || "").trim();
      if (carForm.listAsAuction) {
        if (!vin) {
          alert("VIN is required when auctioning a vehicle. Please enter the 17-character VIN.");
          return;
        }
        if (vin.length !== 17) {
          alert(`VIN must be exactly 17 characters. You entered ${vin.length}.`);
          return;
        }
        // VIN cannot contain I, O, or Q (per the standard)
        if (/[IOQ]/i.test(vin)) {
          alert("VIN cannot contain the letters I, O, or Q. Please double-check.");
          return;
        }
      }

      const carTitle = `${carForm.year} ${carForm.make} ${carForm.model}`.trim();

      if (carForm.listAsAuction) {
        const endsAt = new Date(Date.now() + (+carForm.duration || 7) * 86400 * 1000).toISOString();
        const { data, error } = await api.createAuction({
          item_type: "car",
          title: carTitle,
          make: carForm.make,
          model: carForm.model,
          year: +carForm.year || null,
          mileage: +carForm.mileage || 0,
          category: "Auction Car",
          description: carForm.description,
          vin: vin.toUpperCase(),
          start_bid: +carForm.startBid || 1,
          current_bid: +carForm.startBid || 1,
          reserve: +carForm.reserve || 0,
          ends_at: endsAt,
          city: carForm.city || user.city,
          state: carForm.state || user.state,
          zip: carForm.zip || user.zip,
          tag: "NEW",
          image_url: carForm.photos?.[0] || null,
          images: carForm.photos || [],
        });
        if (error) return alert(error.message);
        setAuctions([normalizeAuction(data), ...auctions]);
      } else {
        const { data, error } = await api.createListing({
          type: "car",
          title: carTitle,
          make: carForm.make,
          model: carForm.model,
          year: +carForm.year || null,
          trim: carForm.trim,
          price: +carForm.price,
          mileage: +carForm.mileage || 0,
          transmission: carForm.transmission,
          drivetrain: carForm.drivetrain,
          fuel: carForm.fuel,
          color: carForm.color,
          vin: carForm.vin,
          description: carForm.description,
          city: carForm.city || user.city,
          state: carForm.state || user.state,
          zip: carForm.zip || user.zip,
          tag: "NEW",
          image_url: carForm.photos?.[0] || null,
          images: carForm.photos || [],
        });
        if (error) return alert(error.message);
        setCars([normalizeListing(data), ...cars]);
      }
    }

    setSellSuccess(true);
    setTimeout(() => {
      setSellSuccess(false);
      setSellForm({ title: "", category: "Engine", price: "", condition: "New", description: "", city: "", state: "", zip: "", listAsAuction: false, startBid: "", duration: "3", reserve: "", photos: [] });
      setCarForm({ make: "", model: "", year: "", trim: "", price: "", mileage: "", transmission: "Automatic", drivetrain: "FWD", fuel: "Gasoline", color: "", description: "", city: "", state: "", vin: "", zip: "", listAsAuction: false, startBid: "", duration: "7", reserve: "", photos: [] });
      setView("browse");
    }, 1200);
  };
  const allListings = [...parts, ...cars, ...auctions];
  const savedListings = allListings.filter(l => saved.includes(l.id));
  const sellerReviews = (id) => reviews.filter(r => r.sellerId === id);
  const sellerOf = (l) => l?.seller || users[l?.sellerId] || { name: "Unknown", avatar: "?", rating: 0, totalSales: 0, city: "—", state: "—" };

  const locationCtx = { locMode, setLocMode, filterRegion, setFilterRegion, filterState, setFilterState, zipFilter, setZipFilter, maxDistance, setMaxDistance };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo} onClick={() => setView("browse")}>
            <span style={styles.logoIcon}>⚙</span>
            <span style={styles.logoText}>PARTSHIFT</span>
          </div>
          <nav style={styles.nav}>
            {[["browse", "Parts & Tools"], ["cars", "Vehicles"], ["auctions", "Auctions"], ["videos", "Tutorials"], ["sell", "Sell"]].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} style={{ ...styles.navBtn, ...(view === v ? styles.navBtnActive : {}) }}>{l}</button>
            ))}
          </nav>
          <div style={styles.headerRight}>
            {user && (
              <>
                <button onClick={() => setView("saved")} style={styles.iconBtn}>❤️ {saved.length > 0 && <span style={styles.dot}>{saved.length}</span>}</button>
                <button onClick={() => setView("messages")} style={styles.iconBtn}>💬 {unreadConvoIds.length > 0 && <span style={styles.dot}>{unreadConvoIds.length}</span>}</button>
                <button onClick={() => { setProfileUserId(user.id); setView("profile"); }} style={styles.userPill}>
                  <span style={{ fontSize: 16 }}>{user.avatar}</span><span>{user.name}</span>
                </button>
              </>
            )}
            {!user && <button onClick={() => setView("auth")} style={styles.authBtn}>Sign In</button>}
          </div>
        </div>
      </header>

      <main style={styles.main}>

        {/* AUTH */}
        {view === "auth" && (
          <section style={styles.authWrap}>
            <div style={styles.authCard}>
              <div style={styles.authTabs}>
                <button onClick={() => setAuthMode("login")} style={{ ...styles.authTab, ...(authMode === "login" ? styles.authTabActive : {}) }}>Sign In</button>
                <button onClick={() => setAuthMode("signup")} style={{ ...styles.authTab, ...(authMode === "signup" ? styles.authTabActive : {}) }}>Create Account</button>
              </div>
              <h2 style={styles.authTitle}>{authMode === "login" ? "Welcome Back" : "Join PARTSHIFT"}</h2>
              <p style={styles.authSub}>{authMode === "login" ? "Sign in to bid, message, save, and offer." : "Buy, sell, and bid with verified enthusiasts."}</p>
              {authMode === "signup" && <div style={styles.formGroup}><label style={styles.formLabel}>Display Name</label><input style={styles.formInput} placeholder="AlexBuilds" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} /></div>}
              <div style={styles.formGroup}><label style={styles.formLabel}>Email</label><input style={styles.formInput} type="email" placeholder="you@example.com" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} /></div>
              <div style={styles.formGroup}><label style={styles.formLabel}>Password</label><input style={styles.formInput} type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} /></div>
              {authMode === "signup" && <div style={styles.formGroup}><label style={styles.formLabel}>Zip Code</label><input style={styles.formInput} placeholder="37064" value={authForm.zip} onChange={e => setAuthForm({ ...authForm, zip: e.target.value })} /></div>}
              {authMode === "signup" && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Referral Code <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
                  <input style={{ ...styles.formInput, textTransform: "uppercase" }} placeholder="PS-XXXXXX" value={authForm.referralCode} onChange={e => setAuthForm({ ...authForm, referralCode: e.target.value.toUpperCase() })} />
                  {authForm.referralCode && <p style={{ margin: "4px 0 0", fontSize: 12, color: C.green }}>Referral code applied — your referrer earns $5 credit!</p>}
                </div>
              )}
              <button style={styles.submitBtn} onClick={handleAuth}>{authMode === "login" ? "Sign In →" : "Create Account →"}</button>
              <p style={styles.authNote}>Real Supabase login — use your email and password.</p>
            </div>
          </section>
        )}

        {/* BROWSE PARTS */}
        {view === "browse" && (
          <>
            <section style={styles.hero}>
              <div style={styles.heroContent}>
                <p style={styles.heroEyebrow}>Trusted Automotive Marketplace</p>
                <h1 style={styles.heroTitle}>The smartest way to buy and sell auto parts and vehicles.</h1>
                <p style={styles.heroSub}>Browse new and used parts, professional tools, and certified pre-owned vehicles from a network of verified sellers across the country. Fixed price or live auction.</p>
                <div style={styles.heroStats}>
                  {[
                    [parts.length, "Active Listings"],
                    [cars.length, "Vehicles for Sale"],
                    [auctions.filter(a => a.endsInSec > 0).length, "Live Auctions"],
                  ].map(([val, lab]) => (
                    <div key={lab} style={styles.heroStat}>
                      <span style={styles.heroStatVal}>{val}+</span>
                      <span style={styles.heroStatLab}>{lab}</span>
                    </div>
                  ))}
                </div>
                <div style={styles.heroCtas}>
                  <button style={styles.heroCta} onClick={() => setView("auctions")}>Browse Live Auctions</button>
                  <button style={styles.heroCtaGhost} onClick={() => setView("sell")}>Start Selling</button>
                </div>
              </div>
              <div style={styles.heroVisual}>
                <img src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&q=80" alt="Performance engine" style={{ width: "100%", maxHeight: 360, aspectRatio: "4/3", objectFit: "cover", borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }} />
              </div>
            </section>

            <div style={styles.conditionRow}>
              {[["all", "All Items"], ["new", "🆕 New Only"], ["used", "♻️ Used Only"]].map(([v, l]) => (
                <button key={v} onClick={() => setConditionFilter(v)} style={{ ...styles.condBtn, ...(conditionFilter === v ? styles.condBtnActive : {}) }}>{l}</button>
              ))}
            </div>

            <FilterBar search={search} setSearch={setSearch} chips={partCategories} active={activeCategory} setActive={setActiveCategory}
              sortBy={sortBy} setSortBy={setSortBy}
              sortOpts={[["featured", "Featured"], ["price-asc", "Price: Low → High"], ["price-desc", "Price: High → Low"], ["distance", "Closest"]]}
              placeholder="Search parts, tools, brands..." {...locationCtx} />

            <section style={styles.grid}>
              {filteredParts.length === 0 && <div style={styles.empty}>No listings match your filters.</div>}
              {filteredParts.map(item => (
                <PartCard key={item.id} item={item} seller={sellerOf(item)} saved={saved.includes(item.id)}
                  onClick={() => { setSelected(item); setView("detail"); }}
                  onSave={(e) => { e.stopPropagation(); toggleSave(item.id); }}
                  distance={zipFilter && locMode === "zip" ? distance(zipFilter, item.zip) : null} />
              ))}
            </section>
          </>
        )}

        {/* CARS */}
        {view === "cars" && (
          <>
            <section style={styles.carsHero}>
              <p style={styles.heroEyebrow}>Vehicles For Sale</p>
              <h1 style={styles.carsTitle}>Find your next vehicle.</h1>
              <p style={styles.heroSub}>Browse certified pre-owned cars, trucks, and SUVs from verified sellers nationwide. Filter by region, state, or distance from your location.</p>
            </section>
            <FilterBar search={carSearch} setSearch={setCarSearch} chips={carMakes} active={activeMake} setActive={setActiveMake}
              sortBy={sortBy} setSortBy={setSortBy}
              sortOpts={[["featured", "Featured"], ["price-asc", "Price: Low → High"], ["price-desc", "Price: High → Low"], ["miles-asc", "Lowest Mileage"], ["year-desc", "Newest First"], ["distance", "Closest"]]}
              placeholder="Search by year, make, model..." {...locationCtx} />
            <section style={styles.sliderRow}>
              <div style={styles.sliderGroup}>
                <label style={styles.sliderLabel}>Max Price: <strong style={{ color: C.accent }}>${maxPrice.toLocaleString()}</strong></label>
                <input type="range" min="10000" max="100000" step="1000" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} style={styles.slider} />
              </div>
              <div style={styles.sliderGroup}>
                <label style={styles.sliderLabel}>Max Mileage: <strong style={{ color: C.accent }}>{maxMileage.toLocaleString()} mi</strong></label>
                <input type="range" min="10000" max="150000" step="5000" value={maxMileage} onChange={e => setMaxMileage(+e.target.value)} style={styles.slider} />
              </div>
            </section>
            <section style={styles.carGrid}>
              {filteredCars.length === 0 && <div style={styles.empty}>No vehicles match your filters.</div>}
              {filteredCars.map(car => (
                <CarCard key={car.id} car={car} seller={sellerOf(car)} saved={saved.includes(car.id)}
                  onClick={() => { setSelected(car); setView("detail"); }}
                  onSave={(e) => { e.stopPropagation(); toggleSave(car.id); }}
                  distance={zipFilter && locMode === "zip" ? distance(zipFilter, car.zip) : null} />
              ))}
            </section>
          </>
        )}

        {/* AUCTIONS */}
        {view === "auctions" && (
          <>
            <section style={styles.auctionHero}>
              <div style={styles.auctionBadge}>LIVE AUCTIONS</div>
              <h1 style={styles.carsTitle}>Bid on rare cars, parts, and tools.</h1>
              <p style={styles.heroSub}>Real-time bidding with transparent reserves. From classic Camaros to vintage Snap-on tool cabinets — find what you can't get anywhere else.</p>
            </section>
            <FilterBar search={auctionSearch} setSearch={setAuctionSearch} chips={auctionCats} active={auctionCat} setActive={setAuctionCat}
              sortBy={sortBy} setSortBy={setSortBy}
              sortOpts={[["ending", "⏰ Ending Soon"], ["featured", "Featured"], ["price-asc", "Bid: Low → High"], ["price-desc", "Bid: High → Low"], ["distance", "Closest"]]}
              placeholder="Search auctions..." {...locationCtx} />
            <div style={styles.auctionToggleRow}>
              <label style={styles.checkRow}>
                <input type="checkbox" checked={showEnded} onChange={e => setShowEnded(e.target.checked)} /> Show ended auctions
              </label>
              <span style={styles.auctionStat}>{filteredAuctions.filter(a => a.endsInSec > 0).length} live</span>
            </div>
            <section style={styles.carGrid}>
              {filteredAuctions.length === 0 && <div style={styles.empty}>No auctions match your filters.</div>}
              {filteredAuctions.map(a => (
                <AuctionCard key={a.id} auction={a} seller={sellerOf(a)} saved={saved.includes(a.id)}
                  onClick={() => { setSelected(a); setView("detail"); }}
                  onSave={(e) => { e.stopPropagation(); toggleSave(a.id); }} />
              ))}
            </section>
          </>
        )}

        {/* DETAIL */}
        {view === "detail" && selected && (
          <DetailView item={selected} seller={sellerOf(selected)} reviews={sellerReviews(selected.sellerId)}
            saved={saved.includes(selected.id)}
            onBack={() => setView(selected.type === "car" ? "cars" : selected.type === "auction" ? "auctions" : "browse")}
            onSave={() => toggleSave(selected.id)}
            onMessage={() => startConversation(selected.sellerId, selected.id, selected.type === "auction" ? "auction" : "listing")}
            onOffer={() => { if (requireAuth()) setShowOfferModal(true); }}
            onBid={() => { if (requireAuth()) { setBidDraft(""); setShowBidModal(true); } }}
            onProfile={() => { setProfileUserId(selected.sellerId); setView("profile"); }}
            onDelete={() => deleteListing(selected)} user={user} />
        )}

        {/* VIDEOS */}
        {view === "videos" && !activeVideo && (
          <>
            <section style={styles.videoHero}>
              <div style={styles.auctionBadge}>REPAIR LIBRARY</div>
              <h1 style={styles.carsTitle}>Tutorials and how-to guides.</h1>
              <p style={styles.heroSub}>Step-by-step repair videos from verified mechanics and shop owners. Save money on labor and learn to wrench with confidence.</p>
            </section>

            <section style={styles.filterBar}>
              <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>🔍</span>
                <input style={styles.searchInput} placeholder="Search tutorials, repairs, parts..." value={videoSearch} onChange={e => setVideoSearch(e.target.value)} />
              </div>
              <div style={styles.locModeRow}>
                <span style={styles.locModeLabel}>📊 SKILL LEVEL</span>
                {videoLevels.map(lv => (
                  <button key={lv} onClick={() => setVideoLevel(lv)}
                    style={{ ...styles.locModeBtn, ...(videoLevel === lv ? styles.locModeBtnActive : {}) }}>{lv}</button>
                ))}
                <span style={{ marginLeft: "auto", color: C.muted, fontSize: 12 }}>
                  {videos.filter(v => (videoCat === "All" || v.category === videoCat) && (videoLevel === "Any Level" || v.level === videoLevel) && (v.title.toLowerCase().includes(videoSearch.toLowerCase()) || v.tags.some(t => t.includes(videoSearch.toLowerCase())))).length} videos
                </span>
              </div>
              <div style={styles.catRow}>
                {videoCategories.map(c => (
                  <button key={c} onClick={() => setVideoCat(c)} style={{ ...styles.catBtn, ...(videoCat === c ? styles.catBtnActive : {}) }}>{c}</button>
                ))}
              </div>
            </section>

            <section style={styles.videoGrid}>
              {videos
                .filter(v => videoCat === "All" || v.category === videoCat)
                .filter(v => videoLevel === "Any Level" || v.level === videoLevel)
                .filter(v => v.title.toLowerCase().includes(videoSearch.toLowerCase()) || v.tags.some(t => t.includes(videoSearch.toLowerCase())))
                .map(v => (
                  <VideoCard key={v.id} video={v} onClick={() => setActiveVideo(v)} />
                ))}
            </section>
          </>
        )}

        {/* VIDEO PLAYER */}
        {view === "videos" && activeVideo && (
          <VideoPlayer video={activeVideo} videos={videos} channel={users[activeVideo.channelId]}
            onBack={() => setActiveVideo(null)}
            onSelectVideo={(v) => setActiveVideo(v)}
            onProfile={() => { setProfileUserId(activeVideo.channelId); setView("profile"); }}
            comments={videoComments[activeVideo.id] || []}
            commentDraft={commentDraft}
            setCommentDraft={setCommentDraft}
            onPostComment={() => {
              if (!user) { setView("auth"); return; }
              if (!commentDraft.trim()) return;
              const list = videoComments[activeVideo.id] || [];
              setVideoComments({ ...videoComments, [activeVideo.id]: [{ id: Date.now(), name: user.name, text: commentDraft, time: "just now" }, ...list] });
              setCommentDraft("");
            }}
            liked={likedVideos.includes(activeVideo.id)}
            onLike={() => {
              if (!user) { setView("auth"); return; }
              setLikedVideos(likedVideos.includes(activeVideo.id) ? likedVideos.filter(id => id !== activeVideo.id) : [...likedVideos, activeVideo.id]);
            }}
            user={user}
          />
        )}

        {/* SAVED */}
        {view === "saved" && (
          <section style={styles.pageWrap}>
            <h2 style={styles.pageTitle}>❤️ Saved Listings</h2>
            {savedListings.length === 0 ? (
              <div style={styles.emptyState}><div style={styles.emptyIcon}>💔</div><p>No saved listings yet.</p>
                <button style={styles.shopBtn} onClick={() => setView("browse")}>Browse</button></div>
            ) : (
              <div style={styles.savedGrid}>
                {savedListings.map(item => item.type === "car" ? (
                  <CarCard key={item.id} car={item} seller={sellerOf(item)} saved={true}
                    onClick={() => { setSelected(item); setView("detail"); }}
                    onSave={(e) => { e.stopPropagation(); toggleSave(item.id); }} />
                ) : item.type === "auction" ? (
                  <AuctionCard key={item.id} auction={item} seller={sellerOf(item)} saved={true}
                    onClick={() => { setSelected(item); setView("detail"); }}
                    onSave={(e) => { e.stopPropagation(); toggleSave(item.id); }} />
                ) : (
                  <PartCard key={item.id} item={item} seller={sellerOf(item)} saved={true}
                    onClick={() => { setSelected(item); setView("detail"); }}
                    onSave={(e) => { e.stopPropagation(); toggleSave(item.id); }} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* MESSAGES */}
        {view === "messages" && user && (
          <section style={styles.pageWrap}>
            <h2 style={styles.pageTitle}>💬 Messages</h2>
            {conversations.length === 0 ? (
              <div style={styles.emptyState}><div style={styles.emptyIcon}>📭</div><p>No conversations yet.</p>
                <button style={styles.shopBtn} onClick={() => setView("browse")}>Browse Listings</button></div>
            ) : (
              <div className="ps-msg-layout" style={styles.msgLayout}>
                <div className="ps-convo-list" style={styles.convoList}>
                  {conversations.map(c => {
                    const otherId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
                    const other = (c.buyer_id === user.id ? c.seller : c.buyer) || users[otherId] || { name: "Unknown", avatar: "👤" };
                    const listing = allListings.find(l => l.id === c.listing_id);
                    const listingTitle = listing
                      ? (listing.title || `${listing.year || ""} ${listing.make || ""} ${listing.model || ""}`.trim() || "Listing")
                      : "Conversation";
                    const isUnread = unreadConvoIds.includes(c.id);
                    const lastMsgPreview = activeConvo === c.id && activeMessages.length > 0
                      ? activeMessages[activeMessages.length - 1].text
                      : "";
                    return (
                      <div key={c.id} onClick={() => setActiveConvo(c.id)}
                        style={{ ...styles.convoItem, ...(activeConvo === c.id ? styles.convoItemActive : {}), ...(isUnread ? styles.convoItemUnread : {}) }}>
                        <div style={styles.convoAvatar}>{other?.avatar || "👤"}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.convoNameRow}>
                            <span style={{ ...styles.convoName, fontWeight: isUnread ? 800 : 700 }}>{other?.name || "Unknown"}</span>
                            {isUnread && <span style={styles.unreadDot}></span>}
                          </div>
                          <div style={styles.convoListing}>{listingTitle.length > 38 ? listingTitle.slice(0, 38) + "…" : listingTitle}</div>
                          <div style={{ ...styles.convoLast, fontWeight: isUnread ? 600 : 400, color: isUnread ? C.text : C.muted }}>
                            {lastMsgPreview ? (lastMsgPreview.length > 42 ? lastMsgPreview.slice(0, 42) + "…" : lastMsgPreview) : "Open to view messages"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="ps-msg-panel" style={styles.msgPanel}>
                  {activeConvo ? (() => {
                    const c = conversations.find(x => x.id === activeConvo);
                    if (!c) return <div style={{ padding: 80, textAlign: "center", color: C.muted }}>Loading conversation...</div>;
                    const otherId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
                    const other = (c.buyer_id === user.id ? c.seller : c.buyer) || users[otherId] || { name: "Unknown", avatar: "👤", rating: 0 };
                    const listing = allListings.find(l => l.id === c.listing_id);
                    const typing = typingMap[activeConvo];

                    return (
                      <>
                        <div style={styles.msgHeader}>
                          <span style={{ fontSize: 24 }}>{other?.avatar || "👤"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{other?.name || "Unknown"}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>
                              {other?.rating ? `★ ${other.rating} · ` : ""}{other?.city ? `${other.city}, ${other.state}` : ""}
                            </div>
                          </div>
                          {/* Listing context card replaces the plain "Test3" badge */}
                          {listing && (
                            <div
                              style={styles.listingContextCard}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(listing);
                                setView("detail");
                              }}
                              title="Open listing"
                            >
                              {listing.image_url || listing.image ? (
                                <img src={listing.image_url || listing.image} alt="" style={styles.listingContextImg} />
                              ) : (
                                <div style={styles.listingContextImgPlaceholder}>📦</div>
                              )}
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={styles.listingContextLabel}>About</div>
                                <div style={styles.listingContextTitle}>
                                  {(() => {
                                    const t = listing.title || `${listing.year || ""} ${listing.make || ""} ${listing.model || ""}`.trim();
                                    return t.length > 30 ? t.slice(0, 30) + "…" : t;
                                  })()}
                                </div>
                                {listing.price && <div style={styles.listingContextPrice}>${Number(listing.price).toLocaleString()}</div>}
                                {listing.current_bid && <div style={styles.listingContextPrice}>Bid: ${Number(listing.current_bid).toLocaleString()}</div>}
                              </div>
                              <span style={styles.listingContextArrow}>→</span>
                            </div>
                          )}
                        </div>
                        <div style={styles.msgScroll} ref={messagesScrollRef}>
                          {activeMessages.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: 40 }}>Send the first message.</div>}
                          {activeMessages.map((m, idx) => {
                            const mine = m.sender_id === user.id;
                            const prev = activeMessages[idx - 1];
                            const prevTime = prev ? new Date(prev.created_at).getTime() : 0;
                            const thisTime = new Date(m.created_at).getTime();
                            const showSeparator = !prev || (thisTime - prevTime) > 5 * 60 * 1000;
                            return (
                              <div key={m.id} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                                {showSeparator && (
                                  <div style={styles.msgTimeSeparator}>{formatChatTime(m.created_at)}</div>
                                )}
                                <div style={{
                                  ...styles.msgBubble,
                                  ...(mine ? styles.msgMine : styles.msgTheirs),
                                  ...(m.is_offer ? styles.msgOffer : {}),
                                  alignSelf: mine ? "flex-end" : "flex-start",
                                }}>
                                  {m.text}
                                </div>
                                <div style={{
                                  ...styles.msgTimeStamp,
                                  alignSelf: mine ? "flex-end" : "flex-start",
                                }}>
                                  {formatChatTime(m.created_at)}
                                </div>
                              </div>
                            );
                          })}
                          {typing && typing.until > Date.now() && (
                            <div style={styles.typingRow}>
                              <div style={styles.typingBubble}>
                                <span style={styles.typingDotMsg}></span>
                                <span style={{ ...styles.typingDotMsg, animationDelay: "0.15s" }}></span>
                                <span style={{ ...styles.typingDotMsg, animationDelay: "0.3s" }}></span>
                              </div>
                              <span style={styles.typingLabel}>{typing.name} is typing…</span>
                            </div>
                          )}
                        </div>
                        <div style={styles.msgInputRow}>
                          <input
                            style={styles.msgInput}
                            placeholder="Type a message..."
                            value={msgDraft}
                            onChange={e => {
                              setMsgDraft(e.target.value);
                              if (e.target.value.trim()) sendTypingBroadcast();
                            }}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                          />
                          <button style={styles.msgSendBtn} onClick={sendMessage}>Send</button>
                        </div>
                      </>
                    );
                  })() : <div style={{ padding: 80, textAlign: "center", color: C.muted }}>Select a conversation</div>}
                </div>
              </div>
            )}
          </section>
        )}

        {/* PROFILE */}
        {view === "profile" && profileUserId && (() => {
          const u = users[profileUserId];
          const userListings = allListings.filter(l => l.sellerId === profileUserId);
          const userReviews = sellerReviews(profileUserId);
          const isMe = user && u.id === user.id;

          // Load referral stats when viewing own profile
          if (isMe && referralStats === null) {
            api.fetchReferralStats().then(stats => setReferralStats(stats));
          }

          const referralLink = referralStats?.code
            ? `${window.location.origin}${window.location.pathname}?ref=${referralStats.code}`
            : null;

          const copyReferralLink = () => {
            if (!referralLink) return;
            navigator.clipboard.writeText(referralLink).then(() => alert("Referral link copied!"));
          };

          const shareOnX = () => {
            if (!referralLink) return;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Buy, sell, and bid on car parts with verified enthusiasts on PartShift! Use my link to join: " + referralLink)}`, "_blank");
          };

          return (
            <section style={styles.pageWrap}>
              <button onClick={() => setView("browse")} style={styles.backBtn}>← Back</button>
              <div style={styles.profileHeader}>
                <div style={styles.profileAvatar}>{u.avatar}</div>
                <div style={{ flex: 1 }}>
                  <h2 style={styles.profileName}>{u.name} {isMe && <span style={styles.youBadge}>YOU</span>}</h2>
                  <div style={styles.profileMeta}>
                    {u.rating > 0 && <span>★ {u.rating} ({userReviews.length} reviews)</span>}
                    <span>{u.totalSales} sales</span>
                    <span>📍 {u.city}, {u.state}</span>
                    <span>Member since {u.joined}</span>
                  </div>
                  {u.bio && <p style={styles.profileBio}>{u.bio}</p>}
                </div>
                {isMe && <button style={styles.signOutBtn} onClick={() => { setUser(null); setView("browse"); }}>Sign Out</button>}
              </div>
              {isMe && referralStats !== null && (
                <div style={{ marginBottom: 36, background: "linear-gradient(135deg, #1a1d24 0%, #2d3142 100%)", borderRadius: 16, padding: 28, color: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 28 }}>🎁</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>Invite Friends &amp; Earn</h3>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>Earn $5 in PartShift credits for every friend who joins using your link.</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 100, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 18px", textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: C.accent }}>{referralStats.referrals.length}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Friends Joined</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 100, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 18px", textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: C.green }}>${referralStats.credits}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Credits Earned</div>
                    </div>
                  </div>

                  {referralStats.code ? (
                    <>
                      <div style={{ marginTop: 20 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Your Referral Code</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 15, fontWeight: 700, letterSpacing: 2, color: C.accent }}>{referralStats.code}</div>
                          <button onClick={copyReferralLink} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>Copy Link</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button onClick={shareOnX} style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>𝕏 Share on X</button>
                        <button onClick={() => { if (navigator.share && referralLink) navigator.share({ title: "Join PartShift", text: "Buy, sell & bid on car parts with verified enthusiasts.", url: referralLink }); else copyReferralLink(); }} style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>↑ Share</button>
                      </div>
                    </>
                  ) : (
                    <button onClick={async () => { const { data } = await api.generateReferralCode(); if (data) setReferralStats(prev => ({ ...prev, code: data })); }} style={{ marginTop: 20, width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Generate My Referral Code</button>
                  )}

                  {referralStats.referrals.length > 0 && (
                    <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Who You've Referred</div>
                      {referralStats.referrals.slice(0, 5).map(r => (
                        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{r.referred?.name || "New Member"}</span>
                          <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>+$5</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={styles.profileTabs}>
                <h3 style={styles.profileSection}>Listings ({userListings.length})</h3>
                {userListings.length === 0 ? <p style={{ color: C.muted }}>No active listings.</p> : (
                  <div style={styles.savedGrid}>
                    {userListings.map(l => (
                      <div key={l.id} style={styles.profileListingWrap}>
                        {l.type === "car" ? (
                          <CarCard car={l} seller={u} saved={saved.includes(l.id)}
                            onClick={() => { setSelected(l); setView("detail"); }} onSave={(e) => { e.stopPropagation(); toggleSave(l.id); }} />
                        ) : l.type === "auction" ? (
                          <AuctionCard auction={l} seller={u} saved={saved.includes(l.id)}
                            onClick={() => { setSelected(l); setView("detail"); }} onSave={(e) => { e.stopPropagation(); toggleSave(l.id); }} />
                        ) : (
                          <PartCard item={l} seller={u} saved={saved.includes(l.id)}
                            onClick={() => { setSelected(l); setView("detail"); }} onSave={(e) => { e.stopPropagation(); toggleSave(l.id); }} />
                        )}
                        {isMe && (
                          <button
                            style={styles.profileDeleteBtn}
                            onClick={(e) => { e.stopPropagation(); deleteListing(l); }}
                            title="Delete this listing"
                          >
                            🗑 Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={styles.profileTabs}>
                <h3 style={styles.profileSection}>Reviews ({userReviews.length})</h3>
                {!isMe && user && (
                  <div style={styles.reviewForm}>
                    <div style={styles.starRow}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setReviewDraft({ ...reviewDraft, rating: n })}
                          style={{ ...styles.starBtn, color: n <= reviewDraft.rating ? "#ffd700" : C.muted }}>★</button>
                      ))}
                    </div>
                    <textarea style={{ ...styles.formInput, height: 80, resize: "vertical" }}
                      placeholder="Share your experience..." value={reviewDraft.text}
                      onChange={e => setReviewDraft({ ...reviewDraft, text: e.target.value })} />
                    <button style={styles.submitBtnSmall} onClick={() => submitReview(profileUserId)}>Post Review</button>
                  </div>
                )}
                {userReviews.length === 0 ? <p style={{ color: C.muted }}>No reviews yet.</p> : (
                  <div style={styles.reviewList}>
                    {userReviews.map(r => (
                      <div key={r.id} style={styles.reviewCard}>
                        <div style={styles.reviewTop}>
                          <strong>{r.buyerName}</strong>
                          <span style={{ color: "#ffd700" }}>{"★".repeat(r.rating)}</span>
                          <span style={{ color: C.muted, fontSize: 12, marginLeft: "auto" }}>{r.date}</span>
                        </div>
                        <p style={styles.reviewText}>{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })()}

        {/* SELL */}
        {view === "sell" && (!user ? (
          <section style={styles.pageWrap}>
            <div style={styles.emptyState}><div style={styles.emptyIcon}>🔐</div><p>Sign in to list items for sale.</p>
              <button style={styles.shopBtn} onClick={() => setView("auth")}>Sign In</button></div>
          </section>
        ) : (
          <section style={styles.sellWrap}>
            <div style={styles.sellHeader}>
              <h2 style={styles.sellTitle}>What are you selling?</h2>
              <p style={styles.sellSub}>Free to list. 3% on parts, $99 on cars, 5% on auction wins.</p>
            </div>
            <div style={styles.sellToggle}>
              <button onClick={() => setSellMode("part")} style={{ ...styles.toggleBtn, ...(sellMode === "part" ? styles.toggleBtnActive : {}) }}>🔧 Part or Tool</button>
              <button onClick={() => setSellMode("car")} style={{ ...styles.toggleBtn, ...(sellMode === "car" ? styles.toggleBtnActive : {}) }}>🚗 Used Car</button>
            </div>
            {sellSuccess ? (
              <div style={styles.successBox}>
                <div style={styles.successIcon}>✅</div>
                <h3 style={styles.successTitle}>Listing Live!</h3>
                <p style={styles.successMsg}>Your item is now visible to buyers.</p>
              </div>
            ) : sellMode === "part" ? (
              <PartSellForm form={sellForm} setForm={setSellForm} onSubmit={handleSellSubmit} />
            ) : (
              <CarSellForm form={carForm} setForm={setCarForm} onSubmit={handleSellSubmit} />
            )}
          </section>
        ))}

        {/* PRIVACY POLICY */}
        {view === "privacy" && (
          <section style={styles.legalWrap}>
            <button onClick={() => setView("browse")} style={styles.backBtn}>← Back</button>
            <h1 style={styles.legalTitle}>Privacy Policy</h1>
            <p style={styles.legalDate}>Last updated: May 2026</p>

            <h2 style={styles.legalH2}>1. Information we collect</h2>
            <p style={styles.legalP}>When you create a PartShift account, we collect your email address, name, password (hashed), and zip code so we can show you nearby listings. When you list an item, we collect the listing details and photos you upload. When you message another user or place a bid, we store those interactions to deliver the service.</p>

            <h2 style={styles.legalH2}>2. How we use your information</h2>
            <p style={styles.legalP}>We use your information to operate the marketplace, match buyers with sellers, process transactions, prevent fraud, and improve the platform. We never sell your personal information to advertisers.</p>

            <h2 style={styles.legalH2}>3. Information sharing</h2>
            <p style={styles.legalP}>Your public profile (name, avatar, rating, listings, reviews) is visible to all users. Your email, password, and private messages are not. We share data with service providers (Supabase for hosting, Stripe for payments) only as needed to operate the service.</p>

            <h2 style={styles.legalH2}>4. Cookies and tracking</h2>
            <p style={styles.legalP}>We use cookies to keep you signed in and remember your preferences. We do not use third-party advertising trackers.</p>

            <h2 style={styles.legalH2}>5. Your rights</h2>
            <p style={styles.legalP}>You can update or delete your account at any time from your profile page. You can request a copy of your data or its full deletion by emailing <a style={styles.legalLink} href="mailto:privacy@partshift.com">privacy@partshift.com</a>.</p>

            <h2 style={styles.legalH2}>6. Data retention</h2>
            <p style={styles.legalP}>We retain account data while your account is active. Deleted listings and messages are removed within 30 days. Transaction records are kept for 7 years to meet tax and audit requirements.</p>

            <h2 style={styles.legalH2}>7. Children</h2>
            <p style={styles.legalP}>PartShift is not intended for users under 18. We do not knowingly collect data from minors.</p>

            <h2 style={styles.legalH2}>8. Changes to this policy</h2>
            <p style={styles.legalP}>If we make material changes to this policy, we will notify users by email or in-app notice at least 30 days in advance.</p>

            <h2 style={styles.legalH2}>9. Contact</h2>
            <p style={styles.legalP}>Questions? Email <a style={styles.legalLink} href="mailto:privacy@partshift.com">privacy@partshift.com</a>.</p>
          </section>
        )}

        {/* TERMS OF SERVICE */}
        {view === "terms" && (
          <section style={styles.legalWrap}>
            <button onClick={() => setView("browse")} style={styles.backBtn}>← Back</button>
            <h1 style={styles.legalTitle}>Terms of Service</h1>
            <p style={styles.legalDate}>Last updated: May 2026</p>

            <h2 style={styles.legalH2}>1. Acceptance</h2>
            <p style={styles.legalP}>By using PartShift, you agree to these Terms. If you do not agree, you may not use the service.</p>

            <h2 style={styles.legalH2}>2. Eligibility</h2>
            <p style={styles.legalP}>You must be at least 18 years old and legally able to enter contracts in your jurisdiction. By creating an account, you confirm both.</p>

            <h2 style={styles.legalH2}>3. Listings</h2>
            <p style={styles.legalP}>You are responsible for the accuracy of your listings, including condition, fitment, photos, and price. Misrepresenting an item, listing stolen goods, or selling counterfeit parts will result in removal and account termination. Vehicle auctions require a valid 17-character VIN.</p>

            <h2 style={styles.legalH2}>4. Auctions and bids</h2>
            <p style={styles.legalP}>A bid is a binding offer. If you are the high bidder when an auction ends and the reserve is met, you have committed to purchase. Sellers may not retract listings during the final hour. Shill bidding (bidding on your own listing) results in immediate ban.</p>

            <h2 style={styles.legalH2}>5. Fees</h2>
            <p style={styles.legalP}>Listing is free. We charge a 3% transaction fee on parts and tools, a flat $99 fee on car sales, and 5% on auction wins. Fees are due from the seller upon completed transaction.</p>

            <h2 style={styles.legalH2}>6. Payments</h2>
            <p style={styles.legalP}>Buyers and sellers arrange payment outside the platform unless using PartShift Pay (escrow). PartShift is not a party to the underlying sale and is not responsible for shipping, payment, or condition disputes between users.</p>

            <h2 style={styles.legalH2}>7. Prohibited items</h2>
            <p style={styles.legalP}>The following may not be listed: stolen parts, counterfeit goods, parts with removed serial numbers, vehicles without clean title (unless explicitly noted as "salvage" or "rebuilt"), tampered odometers, illegal emissions defeat devices, weapons, or anything otherwise restricted by law.</p>

            <h2 style={styles.legalH2}>8. User conduct</h2>
            <p style={styles.legalP}>Treat others respectfully. Harassment, hate speech, spam, or attempts to circumvent platform fees by directing users off-platform are grounds for account termination.</p>

            <h2 style={styles.legalH2}>9. Disclaimers</h2>
            <p style={styles.legalP}>PartShift provides the marketplace "as is" without warranties of any kind. We do not guarantee the condition, authenticity, or legality of any listed item. Always inspect parts and vehicles before purchase.</p>

            <h2 style={styles.legalH2}>10. Limitation of liability</h2>
            <p style={styles.legalP}>To the extent permitted by law, PartShift's total liability to you for any claim is limited to the fees you paid us in the 12 months preceding the claim.</p>

            <h2 style={styles.legalH2}>11. Termination</h2>
            <p style={styles.legalP}>You may close your account at any time. We may suspend or terminate accounts that violate these Terms.</p>

            <h2 style={styles.legalH2}>12. Governing law</h2>
            <p style={styles.legalP}>These Terms are governed by the laws of the State of Delaware, USA. Disputes will be resolved by binding arbitration except where prohibited.</p>

            <h2 style={styles.legalH2}>13. Contact</h2>
            <p style={styles.legalP}>Questions? Email <a style={styles.legalLink} href="mailto:legal@partshift.com">legal@partshift.com</a>.</p>
          </section>
        )}

        {/* SUPPORT */}
        {view === "support" && (
          <section style={styles.legalWrap}>
            <button onClick={() => setView("browse")} style={styles.backBtn}>← Back</button>
            <h1 style={styles.legalTitle}>Support Center</h1>
            <p style={styles.legalDate}>We're here to help. Most questions are answered below — if not, reach out and a real person will get back to you within one business day.</p>

            <div style={styles.supportCardRow}>
              <div style={styles.supportCard}>
                <div style={styles.supportIcon}>💬</div>
                <h3 style={styles.supportCardTitle}>Live Chat</h3>
                <p style={styles.supportCardText}>Open the chat icon in the bottom-right corner of any page. Our assistant handles common questions instantly and connects you with a live agent when you need one.</p>
                <button style={styles.supportCardBtn} onClick={() => setChatOpen(true)}>Open Chat</button>
              </div>
              <div style={styles.supportCard}>
                <div style={styles.supportIcon}>📧</div>
                <h3 style={styles.supportCardTitle}>Email Support</h3>
                <p style={styles.supportCardText}>For account, billing, or trust & safety issues, email us directly. Typical response time is under 24 hours.</p>
                <a href="mailto:support@partshift.com" style={styles.supportCardBtn}>support@partshift.com</a>
              </div>
              <div style={styles.supportCard}>
                <div style={styles.supportIcon}>🚩</div>
                <h3 style={styles.supportCardTitle}>Report a Listing</h3>
                <p style={styles.supportCardText}>See something suspicious — counterfeit parts, stolen goods, or a scam? Report it and our trust team will investigate within 4 hours.</p>
                <a href="mailto:trust@partshift.com" style={styles.supportCardBtn}>trust@partshift.com</a>
              </div>
            </div>

            <h2 style={styles.legalH2}>Frequently asked questions</h2>

            <div style={styles.faqItem}>
              <h3 style={styles.faqQ}>How do I get paid after selling?</h3>
              <p style={styles.legalP}>Buyers and sellers currently arrange payment directly. We recommend Venmo, Zelle, or wire transfer for parts and tools, and a cashier's check or wire for vehicles. PartShift Pay (escrow) is rolling out soon for high-value items.</p>
            </div>
            <div style={styles.faqItem}>
              <h3 style={styles.faqQ}>What if my purchase doesn't match the listing?</h3>
              <p style={styles.legalP}>Message the seller first to resolve directly. If you can't reach a resolution within 7 days, email <a style={styles.legalLink} href="mailto:trust@partshift.com">trust@partshift.com</a> with photos and your conversation history. We mediate disputes between buyers and sellers in good faith.</p>
            </div>
            <div style={styles.faqItem}>
              <h3 style={styles.faqQ}>How do auctions and reserves work?</h3>
              <p style={styles.legalP}>The highest bidder when the timer ends wins. If a reserve was set and the high bid did not meet it, the auction ends with no sale. "No reserve" auctions always sell to the high bidder. You'll see reserve status live on every auction listing.</p>
            </div>
            <div style={styles.faqItem}>
              <h3 style={styles.faqQ}>Can I cancel a bid?</h3>
              <p style={styles.legalP}>Bids are binding and generally cannot be retracted. If you bid by mistake (typo on the amount), email <a style={styles.legalLink} href="mailto:support@partshift.com">support@partshift.com</a> immediately and we'll review.</p>
            </div>
            <div style={styles.faqItem}>
              <h3 style={styles.faqQ}>How do I delete my account?</h3>
              <p style={styles.legalP}>Go to your profile and click "Sign Out". For full deletion of your account and listings, email <a style={styles.legalLink} href="mailto:privacy@partshift.com">privacy@partshift.com</a> from your registered email.</p>
            </div>
            <div style={styles.faqItem}>
              <h3 style={styles.faqQ}>Is PartShift available outside the United States?</h3>
              <p style={styles.legalP}>Currently we operate in the US only. Canada and UK are on our 2026 roadmap.</p>
            </div>
          </section>
        )}
      </main>

      {/* OFFER MODAL */}
      {showOfferModal && selected && (
        <div style={styles.modalBackdrop} onClick={() => setShowOfferModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>💰 Make an Offer</h3>
            <p style={styles.modalSub}>Listing: <strong>{selected.title || `${selected.year} ${selected.make} ${selected.model}`}</strong></p>
            <p style={styles.modalSub}>Asking: <strong style={{ color: C.accent }}>${selected.price.toLocaleString()}</strong></p>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Your Offer (USD)</label>
              <input type="number" style={styles.formInput} value={offerDraft} onChange={e => setOfferDraft(e.target.value)} placeholder={Math.round(selected.price * 0.9).toString()} />
            </div>
            <div style={styles.modalActions}>
              <button style={styles.msgBtn} onClick={() => setShowOfferModal(false)}>Cancel</button>
              <button style={styles.buyBtn} onClick={submitOffer}>Send Offer →</button>
            </div>
          </div>
        </div>
      )}

      {/* BID MODAL */}
      {showBidModal && selected && (
        <div style={styles.modalBackdrop} onClick={() => setShowBidModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>🔨 Place a Bid</h3>
            <p style={styles.modalSub}>{selected.title}</p>
            <p style={styles.modalSub}>Current Bid: <strong style={{ color: C.accent }}>${selected.currentBid.toLocaleString()}</strong> · {selected.bidCount} bids</p>
            <p style={styles.modalSub}>Time Left: <strong style={{ color: selected.endsInSec < 3600 ? C.red : C.green }}>{formatTime(selected.endsInSec)}</strong></p>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Your Max Bid (USD) — must exceed ${selected.currentBid.toLocaleString()}</label>
              <input type="number" style={styles.formInput} value={bidDraft} onChange={e => setBidDraft(e.target.value)}
                placeholder={(selected.currentBid + 100).toString()} min={selected.currentBid + 1} />
            </div>
            {selected.reserve > 0 && selected.currentBid < selected.reserve && (
              <p style={{ ...styles.modalSub, color: C.red }}>⚠️ Reserve not yet met</p>
            )}
            {selected.reserve === 0 && <p style={{ ...styles.modalSub, color: C.green }}>✓ No reserve — sells to highest bidder</p>}
            <div style={styles.modalActions}>
              <button style={styles.msgBtn} onClick={() => setShowBidModal(false)}>Cancel</button>
              <button style={styles.buyBtn} onClick={submitBid}>Confirm Bid →</button>
            </div>
          </div>
        </div>
      )}

      {/* CHATBOT */}
      <div style={styles.chatFab} onClick={() => setChatOpen(!chatOpen)} title="Help">
        {chatOpen ? "✕" : "💬"}
      </div>
      {chatOpen && (
        <div style={styles.chatPanel}>
          {/* HEADER changes based on mode */}
          <div style={styles.chatHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              {chatMode === "agent" && liveAgent ? (
                <>
                  <span style={{ fontSize: 22 }}>{liveAgent.avatar}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{liveAgent.name}</div>
                    <div style={{ fontSize: 11, color: C.green }}>● {liveAgent.title}</div>
                  </div>
                </>
              ) : chatMode === "connecting" ? (
                <>
                  <span style={{ fontSize: 22 }}>⏳</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Connecting to agent...</div>
                    <div style={{ fontSize: 11, color: C.accent }}>● Hang tight</div>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 22 }}>🤖</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>PartShift Assistant</div>
                    <div style={{ fontSize: 11, color: C.green }}>● Online · usually replies instantly</div>
                  </div>
                </>
              )}
            </div>
            {chatMode === "agent" && (
              <button onClick={endAgentChat} style={styles.chatEndBtn} title="End chat with agent">End</button>
            )}
            <button onClick={() => setChatOpen(false)} style={styles.chatCloseBtn}>✕</button>
          </div>

          {/* MESSAGE LIST */}
          <div style={styles.chatScroll} ref={chatScrollRef}>
            {chatMessages.map((m, i) => {
              if (m.from === "system") {
                return <div key={i} style={styles.chatSystem}>{m.text}</div>;
              }
              const bubbleStyle =
                m.from === "user"
                  ? { ...styles.chatBubble, ...styles.chatMine }
                  : m.from === "agent"
                  ? { ...styles.chatBubble, ...styles.chatAgent }
                  : { ...styles.chatBubble, ...styles.chatBot };
              return (
                <div key={i}>
                  {m.from !== "user" && (m.from === "agent" || m.from === "bot") && (
                    <div style={styles.chatSenderLabel}>
                      {m.from === "agent" ? `${liveAgent?.name?.split(" ")[0] || "Agent"} · live agent` : "Assistant"}
                    </div>
                  )}
                  <div style={bubbleStyle}>{m.text}</div>
                  {m.showAgentButton && chatMode === "bot" && (
                    <button style={styles.connectAgentBtn} onClick={connectToAgent}>
                      🎧 Talk to a live agent
                    </button>
                  )}
                </div>
              );
            })}
            {chatMode === "connecting" && (
              <div style={styles.typingIndicator}>
                <span style={styles.typingDot}></span>
                <span style={{ ...styles.typingDot, animationDelay: "0.2s" }}></span>
                <span style={{ ...styles.typingDot, animationDelay: "0.4s" }}></span>
              </div>
            )}
          </div>

          {/* QUICK CHIPS — only show when chatting with the bot */}
          {chatMode === "bot" && (
            <div style={styles.chatChips}>
              {["How do auctions work?", "Watch repair videos", "How do I sell?", "Talk to an agent"].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    if (s === "Talk to an agent") {
                      connectToAgent();
                    } else {
                      setChatDraft(s);
                      setTimeout(() => sendChat(), 50);
                    }
                  }}
                  style={styles.chatChip}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div style={styles.chatInputRow}>
            <input
              style={styles.chatInput}
              placeholder={
                chatMode === "agent" ? `Message ${liveAgent?.name?.split(" ")[0] || "agent"}...`
                : chatMode === "connecting" ? "Waiting for agent..."
                : "Ask anything..."
              }
              value={chatDraft}
              disabled={chatMode === "connecting"}
              onChange={e => setChatDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
            />
            <button style={styles.chatSendBtn} onClick={sendChat} disabled={chatMode === "connecting"}>→</button>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span style={styles.footerLogo}>⚙ PARTSHIFT</span>
          <span style={styles.footerLinks}>© 2026 · Parts · Cars · Auctions</span>
          <div style={styles.footerLinkRow}>
            <button style={styles.footerLinkBtn} onClick={() => setView("privacy")}>Privacy</button>
            <span style={styles.footerSep}>·</span>
            <button style={styles.footerLinkBtn} onClick={() => setView("terms")}>Terms</button>
            <span style={styles.footerSep}>·</span>
            <button style={styles.footerLinkBtn} onClick={() => setView("support")}>Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============== SUB-COMPONENTS ============== */
function FilterBar({ search, setSearch, chips, active, setActive, sortBy, setSortBy, sortOpts, placeholder, locMode, setLocMode, filterRegion, setFilterRegion, filterState, setFilterState, zipFilter, setZipFilter, maxDistance, setMaxDistance }) {
  return (
    <section style={styles.filterBar}>
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input style={styles.searchInput} placeholder={placeholder} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={styles.locModeRow}>
        <span style={styles.locModeLabel}>📍 LOCATION</span>
        {[["any", "Anywhere"], ["region", "By Region"], ["state", "By State"], ["zip", "Near Me"]].map(([v, l]) => (
          <button key={v} onClick={() => setLocMode(v)} style={{ ...styles.locModeBtn, ...(locMode === v ? styles.locModeBtnActive : {}) }}>{l}</button>
        ))}
        <select style={{ ...styles.sortSelect, marginLeft: "auto" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {sortOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {locMode === "region" && (
        <div style={styles.locSubRow}>
          {Object.keys(REGIONS).map(r => (
            <button key={r} onClick={() => setFilterRegion(filterRegion === r ? "" : r)}
              style={{ ...styles.regionBtn, ...(filterRegion === r ? styles.regionBtnActive : {}) }}>
              {r}<span style={styles.regionCount}>{REGIONS[r].length} states</span>
            </button>
          ))}
        </div>
      )}
      {locMode === "state" && (
        <div style={styles.locSubRow}>
          <select style={styles.stateSelect} value={filterState} onChange={e => setFilterState(e.target.value)}>
            <option value="">— Select a state —</option>
            {ALL_STATES.map(s => <option key={s} value={s}>{s} ({STATE_TO_REGION[s]})</option>)}
          </select>
          {filterState && <span style={styles.stateBadge}>Showing: {filterState} · {STATE_TO_REGION[filterState]}</span>}
        </div>
      )}
      {locMode === "zip" && (
        <div style={styles.locSubRow}>
          <input style={styles.locInput} placeholder="Your zip" value={zipFilter} onChange={e => setZipFilter(e.target.value)} maxLength="5" />
          <select style={styles.distSelect} value={maxDistance} onChange={e => setMaxDistance(e.target.value)}>
            <option value="25">Within 25 mi</option><option value="50">Within 50 mi</option>
            <option value="100">Within 100 mi</option><option value="250">Within 250 mi</option>
            <option value="500">Within 500 mi</option>
          </select>
          {zipFilter && <span style={styles.stateBadge}>📍 Within {maxDistance} mi of {zipFilter}</span>}
        </div>
      )}
      <div style={styles.catRow}>
        {chips.map(c => (
          <button key={c} onClick={() => setActive(c)} style={{ ...styles.catBtn, ...(active === c ? styles.catBtnActive : {}) }}>{c}</button>
        ))}
      </div>
    </section>
  );
}

function PartCard({ item, seller, saved, onClick, onSave, distance }) {
  const isNewItem = isNew(item.condition);
  const isUrl = typeof item.image === "string" && item.image.startsWith("http");
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.cardImg}>
        {isUrl ? <img src={item.image} alt={item.title} style={styles.imgFill} /> : <span>{item.image}</span>}
        <button style={styles.saveHeart} onClick={onSave}>{saved ? "♥" : "♡"}</button>
        <span style={{ ...styles.condBadge, background: isNewItem ? C.green : "#6b7280", color: "#fff" }}>{isNewItem ? "NEW" : "USED"}</span>
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardTop}>
          <span style={styles.cardCat}>{item.category}</span>
          {item.tag && <span style={{ ...styles.tag, background: tagColors[item.tag] }}>{item.tag}</span>}
        </div>
        <h3 style={styles.cardTitle}>{item.title}</h3>
        <div style={styles.cardCond}>{item.condition}</div>
        <div style={styles.cardPrice}>${item.price.toLocaleString()}</div>
        <div style={styles.cardFoot}>
          <span style={styles.cardSeller}>{seller.avatar} {seller.name}</span>
          <span style={styles.cardRating}>★ {seller.rating}</span>
        </div>
        <div style={styles.cardLoc}>📍 {item.city}, {item.state}{distance != null && ` · ~${Math.round(distance)} mi`}</div>
      </div>
    </div>
  );
}

function CarCard({ car, seller, saved, onClick, onSave, distance }) {
  const isUrl = typeof car.image === "string" && car.image.startsWith("http");
  return (
    <div style={styles.carCard} onClick={onClick}>
      <div style={styles.carImg}>
        {isUrl ? <img src={car.image} alt={`${car.make} ${car.model}`} style={styles.imgFill} /> : <span>{car.image}</span>}
        {car.tag && <span style={{ ...styles.tag, ...styles.carTag, background: tagColors[car.tag] }}>{car.tag}</span>}
        <button style={{ ...styles.saveHeart, top: 14, right: 14, left: "auto" }} onClick={onSave}>{saved ? "♥" : "♡"}</button>
      </div>
      <div style={styles.carBody}>
        <div style={styles.carYear}>{car.year}</div>
        <h3 style={styles.carTitle}>{car.make} {car.model}</h3>
        <div style={styles.carTrim}>{car.trim} · {car.color}</div>
        <div style={styles.carSpecs}>
          <span>📊 {car.mileage.toLocaleString()} mi</span><span>⚙️ {car.transmission}</span>
          <span>🔧 {car.drivetrain}</span><span>⛽ {car.fuel}</span>
        </div>
        <div style={styles.carPrice}>${car.price.toLocaleString()}</div>
        <div style={styles.carFoot}>
          <span style={styles.cardSeller}>{seller.avatar} {seller.name}</span>
          <span style={styles.cardSeller}>📍 {car.city}, {car.state}{distance != null && ` · ~${Math.round(distance)} mi`}</span>
        </div>
      </div>
    </div>
  );
}

function AuctionCard({ auction, seller, saved, onClick, onSave }) {
  const ended = auction.endsInSec <= 0;
  const ending = auction.endsInSec < 3600 && auction.endsInSec > 0;
  const reserveMet = auction.reserve === 0 || auction.currentBid >= auction.reserve;
  const isUrl = typeof auction.image === "string" && auction.image.startsWith("http");
  return (
    <div style={{ ...styles.carCard, borderColor: ending ? C.red : C.border }} onClick={onClick}>
      <div style={styles.auctionImg}>
        {isUrl ? <img src={auction.image} alt={auction.title} style={styles.imgFill} /> : <span>{auction.image}</span>}
        <button style={{ ...styles.saveHeart, top: 14, right: 14, left: "auto" }} onClick={onSave}>{saved ? "♥" : "♡"}</button>
        <span style={styles.auctionTypeBadge}>{auction.itemType === "car" ? "VEHICLE AUCTION" : "PARTS AUCTION"}</span>
        {auction.tag && <span style={{ ...styles.tag, ...styles.carTag, background: tagColors[auction.tag], top: 50 }}>{auction.tag}</span>}
      </div>
      <div style={{ ...styles.auctionTimer, background: ended ? "#444" : ending ? C.red : "#000" }}>
        {ended ? "🏁 ENDED" : `⏱ ${formatTime(auction.endsInSec)}`}
      </div>
      <div style={styles.carBody}>
        <h3 style={styles.carTitle}>{auction.title}</h3>
        <div style={styles.carTrim}>{auction.itemType === "car" ? `${auction.year} · ${auction.mileage?.toLocaleString()} mi` : auction.category}</div>
        <div style={styles.bidStatRow}>
          <div>
            <div style={styles.bidLabel}>CURRENT BID</div>
            <div style={styles.carPrice}>${auction.currentBid.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={styles.bidLabel}>{auction.bidCount} BIDS</div>
            <div style={{ fontSize: 11, color: reserveMet ? C.green : C.red, fontWeight: 700 }}>
              {auction.reserve === 0 ? "NO RESERVE" : reserveMet ? "✓ RESERVE MET" : "RESERVE NOT MET"}
            </div>
          </div>
        </div>
        <div style={styles.carFoot}>
          <span style={styles.cardSeller}>{seller.avatar} {seller.name}</span>
          <span style={styles.cardSeller}>📍 {auction.city}, {auction.state}</span>
        </div>
      </div>
    </div>
  );
}

function DetailView({ item, seller, reviews, saved, onBack, onSave, onMessage, onOffer, onBid, onProfile, onDelete, user }) {
  const isCar = item.type === "car";
  const isAuction = item.type === "auction";
  const isMine = user && item.sellerId === user.id;
  const ended = isAuction && item.endsInSec <= 0;
  const reserveMet = isAuction && (item.reserve === 0 || item.currentBid >= item.reserve);
  const isUrl = typeof item.image === "string" && item.image.startsWith("http");

  return (
    <div style={styles.detailWrap}>
      <button onClick={onBack} style={styles.backBtn}>← Back</button>
      <div style={styles.detailCard}>
        <div style={isCar || isAuction ? styles.carDetailImg : styles.detailImg}>
          {isUrl ? <img src={item.image} alt={item.title || `${item.make} ${item.model}`} style={{ ...styles.imgFill, borderRadius: 12 }} /> : <span>{item.image}</span>}
        </div>
        <div style={styles.detailInfo}>
          <div style={styles.detailMeta}>
            {isAuction && <span style={{ ...styles.tag, background: C.purple }}>🔨 LIVE AUCTION</span>}
            {isCar && <span style={styles.detailCat}>{item.year} · {item.make}</span>}
            {!isCar && !isAuction && <span style={styles.detailCat}>{item.category}</span>}
            {!isCar && !isAuction && <span style={{ ...styles.condBadge, position: "static", background: isNew(item.condition) ? C.green : "#888" }}>{isNew(item.condition) ? "NEW" : "USED"}</span>}
            {item.tag && <span style={{ ...styles.tag, background: tagColors[item.tag] }}>{item.tag}</span>}
          </div>
          <h2 style={styles.detailTitle}>{isCar ? `${item.make} ${item.model}` : item.title}</h2>
          {isCar && <p style={{ color: C.muted, fontSize: 14, marginBottom: 14 }}>{item.trim} · {item.color}</p>}

          {isAuction ? (
            <div style={styles.auctionDetailBox}>
              <div style={styles.auctionDetailRow}>
                <div>
                  <div style={styles.bidLabel}>CURRENT BID</div>
                  <div style={{ ...styles.detailPrice, marginBottom: 0 }}>${item.currentBid.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{item.bidCount} bids · started at ${item.startBid.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={styles.bidLabel}>TIME LEFT</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: ended ? "#888" : item.endsInSec < 3600 ? C.red : C.green }}>
                    {formatTime(item.endsInSec)}
                  </div>
                  <div style={{ fontSize: 12, color: reserveMet ? C.green : C.red, fontWeight: 700 }}>
                    {item.reserve === 0 ? "✓ NO RESERVE" : reserveMet ? "✓ RESERVE MET" : `Reserve not met`}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.detailPrice}>${item.price.toLocaleString()}</div>
          )}

          {isCar && (
            <div style={styles.specGrid}>
              {[
                ["Mileage", `${item.mileage.toLocaleString()} mi`], ["Transmission", item.transmission],
                ["Drivetrain", item.drivetrain], ["Fuel", item.fuel],
                ["Color", item.color], ["VIN", item.vin],
              ].map(([k, v]) => (
                <div key={k} style={styles.specItem}>
                  <div style={styles.specLabel}>{k}</div><div style={styles.specVal}>{v}</div>
                </div>
              ))}
            </div>
          )}

          {!isCar && !isAuction && <div style={styles.detailRow}><span>Condition:</span><strong>{item.condition}</strong></div>}

          <div style={styles.detailRow}>
            <span>Seller:</span>
            <strong onClick={onProfile} style={{ cursor: "pointer", color: C.accent }}>{seller.avatar} {seller.name}</strong>
            <span style={{ color: "#ffd700" }}>★ {seller.rating}</span>
            <span style={{ color: C.muted }}>· {seller.totalSales} sales</span>
          </div>
          <div style={styles.detailRow}>
            <span>Location:</span><strong>📍 {item.city}, {item.state}</strong>
            <span style={{ color: C.muted }}>· {STATE_TO_REGION[item.state]}</span>
          </div>
          <p style={styles.detailDesc}>{item.desc}</p>

          {!isMine && !ended ? (
            <div style={styles.detailActions}>
              {isAuction ? (
                <button style={{ ...styles.buyBtn, background: C.purple, color: "#fff" }} onClick={onBid}>🔨 Place Bid</button>
              ) : (
                <button style={styles.buyBtn} onClick={onOffer}>💰 Make an Offer</button>
              )}
              <button style={styles.msgBtn} onClick={onMessage}>💬 Message</button>
              <button style={styles.msgBtn} onClick={onSave}>{saved ? "❤️ Saved" : "🤍 Save"}</button>
            </div>
          ) : isMine ? (
            <div style={styles.detailActions}>
              <span style={styles.yourListingBadge}>✓ Your listing</span>
              <button style={styles.deleteBtn} onClick={onDelete}>🗑 Delete Listing</button>
            </div>
          ) : (
            <div style={styles.detailActions}><span style={{ padding: "12px 0", color: C.muted }}>This auction has ended.</span></div>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={styles.profileSection}>Recent reviews of {seller.name}</h3>
          <div style={styles.reviewList}>
            {reviews.slice(0, 3).map(r => (
              <div key={r.id} style={styles.reviewCard}>
                <div style={styles.reviewTop}>
                  <strong>{r.buyerName}</strong>
                  <span style={{ color: "#ffd700" }}>{"★".repeat(r.rating)}</span>
                  <span style={{ color: C.muted, fontSize: 12, marginLeft: "auto" }}>{r.date}</span>
                </div>
                <p style={styles.reviewText}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PartSellForm({ form, setForm, onSubmit }) {
  const update = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div style={styles.sellForm}>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Title *</label>
        <input style={styles.formInput} placeholder="Brembo GT Big Brake Kit" value={form.title} onChange={e => update("title", e.target.value)} />
      </div>
      <label style={styles.checkRow}>
        <input type="checkbox" checked={form.listAsAuction} onChange={e => update("listAsAuction", e.target.checked)} />
        🔨 List as Auction (let buyers bid)
      </label>
      {!form.listAsAuction ? (
        <div style={styles.formRow}>
          <div style={styles.formGroup}><label style={styles.formLabel}>Price (USD) *</label>
            <input type="number" style={styles.formInput} placeholder="1249" value={form.price} onChange={e => update("price", e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>Category</label>
            <select style={styles.formInput} value={form.category} onChange={e => update("category", e.target.value)}>
              {partCategories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>Condition</label>
            <select style={styles.formInput} value={form.condition} onChange={e => update("condition", e.target.value)}>
              {["New", "Used – Excellent", "Used – Good", "Used – Fair"].map(c => <option key={c}>{c}</option>)}
            </select></div>
        </div>
      ) : (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}><label style={styles.formLabel}>Starting Bid (USD) *</label>
              <input type="number" style={styles.formInput} placeholder="100" value={form.startBid} onChange={e => update("startBid", e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.formLabel}>Reserve (optional)</label>
              <input type="number" style={styles.formInput} placeholder="0 = no reserve" value={form.reserve} onChange={e => update("reserve", e.target.value)} /></div>
            <div style={styles.formGroup}><label style={styles.formLabel}>Duration</label>
              <select style={styles.formInput} value={form.duration} onChange={e => update("duration", e.target.value)}>
                <option value="1">1 day</option><option value="3">3 days</option>
                <option value="7">7 days</option><option value="14">14 days</option>
              </select></div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}><label style={styles.formLabel}>Category</label>
              <select style={styles.formInput} value={form.category} onChange={e => update("category", e.target.value)}>
                {partCategories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select></div>
          </div>
        </>
      )}
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>City</label><input style={styles.formInput} placeholder="Los Angeles" value={form.city} onChange={e => update("city", e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>State</label>
          <select style={styles.formInput} value={form.state} onChange={e => update("state", e.target.value)}>
            <option value="">—</option>{ALL_STATES.map(s => <option key={s}>{s}</option>)}
          </select></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Zip</label><input style={styles.formInput} placeholder="90001" value={form.zip} onChange={e => update("zip", e.target.value)} maxLength="5" /></div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Description</label>
        <textarea style={{ ...styles.formInput, height: 120, resize: "vertical" }} placeholder="Fitment, history, defects..." value={form.description} onChange={e => update("description", e.target.value)} />
      </div>
      <PhotoUploader
        value={form.photos || []}
        maxFiles={10}
        onUpload={(urls) => update("photos", urls)}
      />
      <button style={styles.submitBtn} onClick={onSubmit}>{form.listAsAuction ? "Start Auction →" : "Publish Listing →"}</button>
    </div>
  );
}

// =====================================================================
// VIN VALIDATION & LOOKUP
// =====================================================================
// VIN check digit (position 9) — validates that the VIN is mathematically
// valid before we hit the network. Catches typos for free.
const VIN_TRANSLITERATION = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5,         P: 7,        R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

function isValidVinChecksum(vin) {
  const v = (vin || "").toUpperCase().trim();
  if (v.length !== 17) return false;
  if (/[IOQ]/.test(v)) return false;
  if (!/^[A-HJ-NPR-Z0-9]+$/.test(v)) return false;
  let total = 0;
  for (let i = 0; i < 17; i++) {
    const ch = v[i];
    const num = isNaN(+ch) ? VIN_TRANSLITERATION[ch] : +ch;
    if (num === undefined) return false;
    total += num * VIN_WEIGHTS[i];
  }
  const remainder = total % 11;
  const expected = remainder === 10 ? "X" : String(remainder);
  return v[8] === expected;
}

// Calls NHTSA's free public VIN decoder. No API key required, unlimited use.
// Returns { make, model, year, trim, body, engine, fuel, drivetrain, transmission, manufacturer, plant }
async function decodeVin(vin) {
  const v = (vin || "").toUpperCase().trim();
  if (v.length !== 17) throw new Error("VIN must be exactly 17 characters.");

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(v)}?format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lookup service returned ${res.status}`);
  const data = await res.json();
  const r = (data?.Results && data.Results[0]) || {};

  if (r.ErrorCode && r.ErrorCode !== "0" && r.ErrorCode !== "" && r.ErrorCode !== "1" && !r.Make) {
    // ErrorCode 1 means partial match, still useful. Anything else with no Make = bad VIN.
    throw new Error(r.ErrorText || "Couldn't decode that VIN. Double-check the characters.");
  }

  // Map NHTSA fields → our form fields
  const fuel = (r.FuelTypePrimary || "").toLowerCase();
  let normalizedFuel = "Gasoline";
  if (fuel.includes("diesel")) normalizedFuel = "Diesel";
  else if (fuel.includes("electric") && !fuel.includes("hybrid")) normalizedFuel = "Electric";
  else if (fuel.includes("hybrid") && fuel.includes("plug")) normalizedFuel = "Plug-in Hybrid";
  else if (fuel.includes("hybrid") || fuel.includes("electric")) normalizedFuel = "Hybrid";

  const drive = (r.DriveType || "").toLowerCase();
  let normalizedDrive = "FWD";
  if (drive.includes("4wd") || drive.includes("4x4")) normalizedDrive = "4WD";
  else if (drive.includes("awd") || drive.includes("all")) normalizedDrive = "AWD";
  else if (drive.includes("rwd") || drive.includes("rear")) normalizedDrive = "RWD";
  else if (drive.includes("fwd") || drive.includes("front")) normalizedDrive = "FWD";

  const trans = (r.TransmissionStyle || "").toLowerCase();
  let normalizedTrans = "Automatic";
  if (trans.includes("manual")) normalizedTrans = "Manual";
  else if (trans.includes("dual") || trans.includes("dct") || trans.includes("dsg")) normalizedTrans = "Dual-Clutch";
  else if (trans.includes("cvt") || trans.includes("continuously")) normalizedTrans = "CVT";

  return {
    make: r.Make || "",
    model: r.Model || "",
    year: r.ModelYear || "",
    trim: r.Trim || r.Series || "",
    bodyClass: r.BodyClass || "",
    engine: r.EngineModel || r.DisplacementL ? `${r.DisplacementL || ""}L ${r.EngineCylinders ? r.EngineCylinders + "-cyl" : ""}`.trim() : "",
    fuel: normalizedFuel,
    drivetrain: normalizedDrive,
    transmission: normalizedTrans,
    manufacturer: r.Manufacturer || "",
    plant: [r.PlantCity, r.PlantState, r.PlantCountry].filter(Boolean).join(", "),
  };
}

function CarSellForm({ form, setForm, onSubmit }) {
  const update = (k, v) => setForm({ ...form, [k]: v });
  const updateMany = (patch) => setForm({ ...form, ...patch });

  const [vinLookup, setVinLookup] = useState({ status: "idle", message: "", data: null });
  // status: idle | invalid | checking | success | error

  const onVinChange = (raw) => {
    const v = raw.toUpperCase().slice(0, 17);
    update("vin", v);
    // Reset status as user types
    if (vinLookup.status !== "idle") setVinLookup({ status: "idle", message: "", data: null });
  };

  const handleVinLookup = async () => {
    const v = (form.vin || "").trim().toUpperCase();
    if (v.length !== 17) {
      setVinLookup({ status: "invalid", message: `VIN must be 17 characters (you have ${v.length}).`, data: null });
      return;
    }
    if (/[IOQ]/.test(v)) {
      setVinLookup({ status: "invalid", message: "VIN cannot contain the letters I, O, or Q.", data: null });
      return;
    }
    if (!isValidVinChecksum(v)) {
      setVinLookup({ status: "invalid", message: "VIN check digit doesn't match. Double-check for typos.", data: null });
      return;
    }

    setVinLookup({ status: "checking", message: "Looking up vehicle...", data: null });
    try {
      const decoded = await decodeVin(v);
      if (!decoded.make || !decoded.model) {
        setVinLookup({ status: "error", message: "Couldn't find a vehicle for this VIN. You can still fill the form manually.", data: null });
        return;
      }
      // Autofill — only update fields that are currently empty so we don't overwrite user edits
      const patch = { vin: v };
      if (!form.make) patch.make = decoded.make;
      if (!form.model) patch.model = decoded.model;
      if (!form.year && decoded.year) patch.year = decoded.year;
      if (!form.trim && decoded.trim) patch.trim = decoded.trim;
      if (decoded.fuel) patch.fuel = decoded.fuel;
      if (decoded.drivetrain) patch.drivetrain = decoded.drivetrain;
      if (decoded.transmission) patch.transmission = decoded.transmission;
      updateMany(patch);
      setVinLookup({
        status: "success",
        message: `${decoded.year} ${decoded.make} ${decoded.model}${decoded.trim ? " " + decoded.trim : ""}`,
        data: decoded,
      });
    } catch (err) {
      setVinLookup({ status: "error", message: err.message || "Lookup failed. You can fill the form manually.", data: null });
    }
  };

  const vinValid = isValidVinChecksum(form.vin || "");
  const vinHelperColor =
    vinLookup.status === "success" ? C.green :
    vinLookup.status === "checking" ? C.muted :
    vinLookup.status === "invalid" || vinLookup.status === "error" ? C.red :
    form.vin && form.vin.length === 17 && vinValid ? C.green :
    form.vin && form.vin.length > 0 ? C.red : C.muted;

  return (
    <div style={styles.sellForm}>

      {/* ============== VIN LOOKUP — top of form ============== */}
      <div style={styles.vinLookupCard}>
        <div style={styles.vinHeader}>
          <span style={styles.vinHeaderIcon}>🔍</span>
          <div style={{ flex: 1 }}>
            <div style={styles.vinHeaderTitle}>Quick start: enter your VIN</div>
            <div style={styles.vinHeaderSub}>We'll look up the make, model, year, trim, and drivetrain automatically.</div>
          </div>
        </div>
        <div style={styles.vinInputRow}>
          <input
            style={{
              ...styles.vinInput,
              borderColor:
                vinLookup.status === "success" ? C.green :
                vinLookup.status === "invalid" || vinLookup.status === "error" ? C.red :
                C.border,
              textTransform: "uppercase",
            }}
            placeholder="17-character VIN — e.g. 1HGCM82633A123456"
            value={form.vin || ""}
            onChange={(e) => onVinChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleVinLookup(); } }}
            maxLength="17"
          />
          <button
            type="button"
            style={{
              ...styles.vinLookupBtn,
              opacity: vinLookup.status === "checking" ? 0.6 : 1,
              cursor: vinLookup.status === "checking" ? "wait" : "pointer",
            }}
            onClick={handleVinLookup}
            disabled={vinLookup.status === "checking"}
          >
            {vinLookup.status === "checking" ? "Looking up..." : "Look Up VIN"}
          </button>
        </div>

        {/* Live feedback row */}
        <div style={{ ...styles.vinHelper, color: vinHelperColor }}>
          {vinLookup.status === "success" && (
            <>✓ Found: <strong>{vinLookup.message}</strong> — fields below have been filled in.</>
          )}
          {vinLookup.status === "checking" && <>⏳ {vinLookup.message}</>}
          {(vinLookup.status === "invalid" || vinLookup.status === "error") && <>⚠ {vinLookup.message}</>}
          {vinLookup.status === "idle" && form.vin && form.vin.length === 17 && vinValid && (
            <>✓ VIN is valid. Click "Look Up VIN" to autofill.</>
          )}
          {vinLookup.status === "idle" && form.vin && form.vin.length === 17 && !vinValid && (
            <>⚠ VIN check digit doesn't match — please verify.</>
          )}
          {vinLookup.status === "idle" && form.vin && form.vin.length > 0 && form.vin.length < 17 && (
            <>{form.vin.length}/17 characters</>
          )}
          {form.listAsAuction && !form.vin && (
            <span style={{ color: C.red }}>VIN is required for auction listings.</span>
          )}
          {!form.vin && !form.listAsAuction && (
            <>Optional but recommended — buyers trust listings with verified VINs more.</>
          )}
        </div>

        {/* Decoded details panel */}
        {vinLookup.data && (
          <div style={styles.vinDecodedPanel}>
            {[
              ["Year", vinLookup.data.year],
              ["Make", vinLookup.data.make],
              ["Model", vinLookup.data.model],
              ["Trim", vinLookup.data.trim],
              ["Body", vinLookup.data.bodyClass],
              ["Engine", vinLookup.data.engine],
              ["Drivetrain", vinLookup.data.drivetrain],
              ["Transmission", vinLookup.data.transmission],
              ["Fuel", vinLookup.data.fuel],
              ["Manufactured", vinLookup.data.plant],
            ].filter(([, v]) => v && String(v).trim()).map(([k, v]) => (
              <div key={k} style={styles.vinDecodedItem}>
                <div style={styles.vinDecodedLabel}>{k}</div>
                <div style={styles.vinDecodedValue}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============== REGULAR FORM (autofilled by VIN lookup if used) ============== */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>Make *</label><input style={styles.formInput} placeholder="Toyota" value={form.make} onChange={e => update("make", e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Model *</label><input style={styles.formInput} placeholder="Tacoma" value={form.model} onChange={e => update("model", e.target.value)} /></div>
      </div>
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>Year *</label><input type="number" style={styles.formInput} placeholder="2021" value={form.year} onChange={e => update("year", e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Trim</label><input style={styles.formInput} placeholder="TRD" value={form.trim} onChange={e => update("trim", e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Mileage</label><input type="number" style={styles.formInput} placeholder="28500" value={form.mileage} onChange={e => update("mileage", e.target.value)} /></div>
      </div>
      <label style={styles.checkRow}>
        <input type="checkbox" checked={form.listAsAuction} onChange={e => update("listAsAuction", e.target.checked)} />
        🔨 List as Auction (let buyers bid)
      </label>
      {!form.listAsAuction ? (
        <div style={styles.formGroup}><label style={styles.formLabel}>Price (USD) *</label>
          <input type="number" style={styles.formInput} placeholder="38900" value={form.price} onChange={e => update("price", e.target.value)} /></div>
      ) : (
        <div style={styles.formRow}>
          <div style={styles.formGroup}><label style={styles.formLabel}>Starting Bid *</label>
            <input type="number" style={styles.formInput} placeholder="20000" value={form.startBid} onChange={e => update("startBid", e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>Reserve (optional)</label>
            <input type="number" style={styles.formInput} placeholder="0 = no reserve" value={form.reserve} onChange={e => update("reserve", e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.formLabel}>Duration</label>
            <select style={styles.formInput} value={form.duration} onChange={e => update("duration", e.target.value)}>
              <option value="3">3 days</option><option value="5">5 days</option>
              <option value="7">7 days</option><option value="10">10 days</option>
            </select></div>
        </div>
      )}
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>Transmission</label>
          <select style={styles.formInput} value={form.transmission} onChange={e => update("transmission", e.target.value)}>
            {["Automatic", "Manual", "CVT", "Dual-Clutch"].map(t => <option key={t}>{t}</option>)}
          </select></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Drivetrain</label>
          <select style={styles.formInput} value={form.drivetrain} onChange={e => update("drivetrain", e.target.value)}>
            {["FWD", "RWD", "AWD", "4WD"].map(d => <option key={d}>{d}</option>)}
          </select></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Fuel</label>
          <select style={styles.formInput} value={form.fuel} onChange={e => update("fuel", e.target.value)}>
            {["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"].map(f => <option key={f}>{f}</option>)}
          </select></div>
      </div>
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>Color</label><input style={styles.formInput} placeholder="Cement Gray" value={form.color} onChange={e => update("color", e.target.value)} /></div>
      </div>
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>City</label><input style={styles.formInput} placeholder="Denver" value={form.city} onChange={e => update("city", e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>State</label>
          <select style={styles.formInput} value={form.state} onChange={e => update("state", e.target.value)}>
            <option value="">—</option>{ALL_STATES.map(s => <option key={s}>{s}</option>)}
          </select></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Zip</label><input style={styles.formInput} placeholder="80201" value={form.zip} onChange={e => update("zip", e.target.value)} maxLength="5" /></div>
      </div>
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>Transmission</label>
          <select style={styles.formInput} value={form.transmission} onChange={e => update("transmission", e.target.value)}>
            {["Automatic", "Manual", "CVT", "Dual-Clutch"].map(t => <option key={t}>{t}</option>)}
          </select></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Drivetrain</label>
          <select style={styles.formInput} value={form.drivetrain} onChange={e => update("drivetrain", e.target.value)}>
            {["FWD", "RWD", "AWD", "4WD"].map(d => <option key={d}>{d}</option>)}
          </select></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Fuel</label>
          <select style={styles.formInput} value={form.fuel} onChange={e => update("fuel", e.target.value)}>
            {["Gasoline", "Diesel", "Electric", "Hybrid"].map(f => <option key={f}>{f}</option>)}
          </select></div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Description</label>
        <textarea style={{ ...styles.formInput, height: 140, resize: "vertical" }} placeholder="Maintenance, mods, condition..." value={form.description} onChange={e => update("description", e.target.value)} />
      </div>
      <PhotoUploader
        value={form.photos || []}
        maxFiles={20}
        onUpload={(urls) => update("photos", urls)}
      />
      <button style={styles.submitBtn} onClick={onSubmit}>{form.listAsAuction ? "Start Auction →" : "List My Vehicle →"}</button>
    </div>
  );
}

function VideoCard({ video, onClick }) {
  const levelColor = video.level === "Beginner" ? C.green : video.level === "Intermediate" ? C.accent : C.red;
  const isUrl = typeof video.thumb === "string" && video.thumb.startsWith("http");
  return (
    <div style={styles.videoCard} onClick={onClick}>
      <div style={styles.videoThumb}>
        {isUrl ? <img src={video.thumb} alt={video.title} style={styles.imgFill} /> : <span style={styles.videoThumbIcon}>{video.thumb}</span>}
        <span style={styles.playOverlay}>▶</span>
        <span style={styles.videoDuration}>{video.duration}</span>
        <span style={{ ...styles.videoLevel, background: levelColor, color: "#fff" }}>{video.level}</span>
      </div>
      <div style={styles.videoBody}>
        <h3 style={styles.videoTitle}>{video.title}</h3>
        <div style={styles.videoChannel}>{video.channel}</div>
        <div style={styles.videoStats}>
          <span>{(video.views / 1000).toFixed(0)}K views</span>
          <span>·</span>
          <span>👍 {(video.likes / 1000).toFixed(1)}K</span>
          <span>·</span>
          <span style={{ color: C.accent }}>{video.category}</span>
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ video, videos, channel, onBack, onSelectVideo, onProfile, comments, commentDraft, setCommentDraft, onPostComment, liked, onLike, user }) {
  const related = videos.filter(v => v.id !== video.id && (v.category === video.category || v.channelId === video.channelId)).slice(0, 6);
  const isUrl = typeof video.thumb === "string" && video.thumb.startsWith("http");
  return (
    <div style={styles.videoPlayerWrap}>
      <button onClick={onBack} style={styles.backBtn}>← Back to Videos</button>
      <div style={styles.videoPlayerLayout}>
        <div style={styles.videoMain}>
          <div style={styles.videoPlayer}>
            <div style={styles.videoPlayerInner}>
              {isUrl ? <img src={video.thumb} alt={video.title} style={{ ...styles.imgFill, opacity: 0.55 }} /> : <span style={styles.videoPlayerIcon}>{video.thumb}</span>}
              <div style={styles.playButton}>▶</div>
              <div style={styles.videoControls}>
                <span style={styles.controlBtn}>▶</span>
                <div style={styles.progressBar}><div style={styles.progressFilled} /></div>
                <span style={styles.controlTime}>0:00 / {video.duration}</span>
                <span style={styles.controlBtn}>⚙</span>
                <span style={styles.controlBtn}>⛶</span>
              </div>
            </div>
          </div>

          <h1 style={styles.videoBigTitle}>{video.title}</h1>
          <div style={styles.videoBigStats}>
            <span>{video.views.toLocaleString()} views</span>
            <span>·</span>
            <span>{video.duration}</span>
            <span>·</span>
            <span style={{ ...styles.tag, background: video.level === "Beginner" ? C.green : video.level === "Intermediate" ? C.accent : C.red }}>{video.level}</span>
            <span style={{ ...styles.tag, background: C.purple }}>{video.category}</span>
          </div>

          <div style={styles.videoActions}>
            <button onClick={onLike} style={{ ...styles.videoActionBtn, ...(liked ? styles.videoActionBtnActive : {}) }}>
              {liked ? "👍 Liked" : "👍 Like"} ({video.likes.toLocaleString()})
            </button>
            <button style={styles.videoActionBtn}>💾 Save</button>
            <button style={styles.videoActionBtn}>↗️ Share</button>
            <button style={styles.videoActionBtn}>🚩 Report</button>
          </div>

          <div style={styles.channelBar} onClick={onProfile}>
            <div style={styles.channelAvatar}>{channel?.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.channelName}>{channel?.name}</div>
              <div style={styles.channelMeta}>★ {channel?.rating} · {channel?.totalSales} sales · {channel?.city}, {channel?.state}</div>
            </div>
            <button style={styles.subscribeBtn}>+ Follow</button>
          </div>

          <div style={styles.videoDescBox}>
            <p style={styles.videoDescText}>{video.desc}</p>
            <div style={styles.videoTagsRow}>
              {video.tags.map(t => <span key={t} style={styles.videoTag}>#{t}</span>)}
            </div>
          </div>

          <div style={styles.commentsSection}>
            <h3 style={styles.profileSection}>💬 Comments ({comments.length})</h3>
            <div style={styles.commentInputWrap}>
              <input style={styles.formInput} placeholder={user ? "Ask a question or leave feedback..." : "Sign in to comment"}
                value={commentDraft} onChange={e => setCommentDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onPostComment()} disabled={!user} />
              <button style={styles.submitBtnSmall} onClick={onPostComment} disabled={!user}>Post</button>
            </div>
            {comments.length === 0 ? (
              <p style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: 24 }}>Be the first to comment.</p>
            ) : (
              <div style={styles.reviewList}>
                {comments.map(c => (
                  <div key={c.id} style={styles.commentCard}>
                    <div style={styles.commentTop}>
                      <strong>{c.name}</strong>
                      <span style={{ color: C.muted, fontSize: 12 }}>{c.time}</span>
                    </div>
                    <p style={styles.reviewText}>{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside style={styles.relatedPanel}>
          <h3 style={styles.profileSection}>🎬 More Videos</h3>
          <div style={styles.relatedList}>
            {related.map(v => {
              const rIsUrl = typeof v.thumb === "string" && v.thumb.startsWith("http");
              return (
                <div key={v.id} style={styles.relatedItem} onClick={() => onSelectVideo(v)}>
                  <div style={styles.relatedThumb}>
                    {rIsUrl ? <img src={v.thumb} alt={v.title} style={{ ...styles.imgFill, borderRadius: 8 }} /> : v.thumb}
                    <span style={styles.relatedDuration}>{v.duration}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.relatedTitle}>{v.title}</div>
                    <div style={styles.relatedChannel}>{v.channel}</div>
                    <div style={styles.relatedStats}>{(v.views / 1000).toFixed(0)}K views · {v.level}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============== STYLES ============== */
const styles = {
  root: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: C.bg, color: C.text, minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", margin: 0 },
  imgFill: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  header: { background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100, width: "100%" },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "0 16px", minHeight: 64, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  logo: { display: "flex", alignItems: "center", gap: 10, marginRight: "auto", cursor: "pointer", flexShrink: 0 },
  logoIcon: { fontSize: 28, color: C.accent },
  logoText: { fontSize: 20, fontWeight: 700, letterSpacing: 3 },
  nav: { display: "flex", gap: 4, flexWrap: "wrap" },
  navBtn: { background: "none", border: "none", color: C.muted, cursor: "pointer", padding: "8px 12px", borderRadius: 6, fontSize: 13, letterSpacing: 1, fontFamily: "inherit", whiteSpace: "nowrap" },
  navBtnActive: { color: C.accent, background: "rgba(240,165,0,.1)" },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "8px 10px", borderRadius: 8, position: "relative", color: C.text },
  dot: { background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px", position: "absolute", top: 0, right: 0 },
  userPill: { display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, color: C.text, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  authBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", letterSpacing: 1 },
  main: { flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "0 16px" },
  hero: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "64px 0 40px", gap: 32, flexWrap: "wrap" },
  heroContent: { flex: 1 },
  heroEyebrow: { fontSize: 11, letterSpacing: 4, color: C.accent, textTransform: "uppercase", marginBottom: 16 },
  heroTitle: { fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", fontFamily: "'Georgia', serif", wordBreak: "break-word" },
  heroSub: { color: C.muted, fontSize: 17, lineHeight: 1.6, maxWidth: 480, marginBottom: 32 },
  heroStats: { display: "flex", gap: 36, marginBottom: 28 },
  heroStat: { display: "flex", flexDirection: "column", gap: 4 },
  heroStatVal: { fontSize: 24, fontWeight: 700, color: C.accent },
  heroStatLab: { fontSize: 12, color: C.muted, letterSpacing: 1 },
  heroCtas: { display: "flex", gap: 12 },
  heroCta: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "13px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit", letterSpacing: 1 },
  heroCtaGhost: { background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "13px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
  heroVisual: { flex: "1 1 320px", maxWidth: 480, minWidth: 0 },
  heroGear: { fontSize: 180, opacity: 0.07 },
  carsHero: { padding: "48px 0 28px" },
  carsTitle: { fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 14px", fontFamily: "'Georgia', serif", wordBreak: "break-word" },
  auctionHero: { padding: "48px 0 28px" },
  auctionBadge: { display: "inline-block", background: C.purple, color: "#fff", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: 2, marginBottom: 14 },
  conditionRow: { display: "flex", gap: 8, marginBottom: 16 },
  condBtn: { background: C.surface, border: `1px solid ${C.border}`, color: C.muted, padding: "10px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "inherit", letterSpacing: 1, fontWeight: 600 },
  condBtnActive: { background: C.accent, borderColor: C.accent, color: "#000", fontWeight: 800 },
  filterBar: { padding: "0 0 24px", display: "flex", flexDirection: "column", gap: 12 },
  searchWrap: { display: "flex", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0 16px", gap: 10 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, background: "none", border: "none", outline: "none", color: C.text, fontSize: 15, padding: "14px 0", fontFamily: "inherit" },
  locModeRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10 },
  locModeLabel: { fontSize: 11, color: C.accent, letterSpacing: 2, fontWeight: 700, marginRight: 4 },
  locModeBtn: { background: "transparent", border: "none", color: C.muted, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  locModeBtnActive: { background: C.accent, color: "#000", fontWeight: 700 },
  locSubRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "4px 0" },
  regionBtn: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 },
  regionBtnActive: { background: "rgba(240,165,0,.15)", borderColor: C.accent, color: C.accent },
  regionCount: { fontSize: 10, color: C.muted, letterSpacing: 1, fontWeight: 400 },
  stateSelect: { background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", cursor: "pointer", minWidth: 220 },
  stateBadge: { background: "rgba(240,165,0,.1)", color: C.accent, padding: "6px 12px", borderRadius: 6, fontSize: 12, letterSpacing: 1 },
  locInput: { background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "10px 14px", borderRadius: 8, width: 110, fontSize: 13, fontFamily: "inherit", outline: "none" },
  distSelect: { background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  sortSelect: { background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "8px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  catRow: { display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 },
  catBtn: { background: "none", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontFamily: "inherit", letterSpacing: 1 },
  catBtnActive: { background: C.accent, borderColor: C.accent, color: "#000", fontWeight: 700 },
  auctionToggleRow: { display: "flex", alignItems: "center", gap: 16, padding: "0 4px 16px" },
  checkRow: { display: "flex", alignItems: "center", gap: 8, color: C.text, fontSize: 13, cursor: "pointer", padding: 4 },
  auctionStat: { marginLeft: "auto", color: C.green, fontSize: 13, fontWeight: 700 },
  sliderRow: { display: "flex", gap: 32, padding: "0 4px 24px" },
  sliderGroup: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  sliderLabel: { fontSize: 12, color: C.muted, letterSpacing: 1 },
  slider: { accentColor: C.accent, width: "100%" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20, paddingBottom: 64 },
  empty: { gridColumn: "1/-1", textAlign: "center", color: C.muted, padding: 64, fontSize: 16 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "transform .2s, box-shadow .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  cardImg: { height: 160, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative" },
  saveHeart: { position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 32, height: 32, fontSize: 14, cursor: "pointer", color: "#fff" },
  condBadge: { position: "absolute", top: 10, left: 10, color: "#000", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 8px", borderRadius: 4 },
  cardBody: { padding: 16 },
  cardTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  cardCat: { fontSize: 11, letterSpacing: 2, color: C.muted, textTransform: "uppercase" },
  tag: { fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 7px", borderRadius: 4, color: "#fff" },
  cardTitle: { fontSize: 15, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 },
  cardCond: { fontSize: 12, color: C.muted, marginBottom: 8 },
  cardPrice: { fontSize: 22, fontWeight: 800, color: C.accent, marginBottom: 8 },
  cardFoot: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  cardSeller: { fontSize: 12, color: C.muted },
  cardRating: { fontSize: 12, color: "#ffd700" },
  cardLoc: { fontSize: 11, color: C.muted },
  carGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 22, paddingBottom: 64 },
  carCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "transform .2s, box-shadow .2s", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  carImg: { height: 200, background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, position: "relative" },
  carTag: { position: "absolute", top: 14, left: 14 },
  carBody: { padding: 22 },
  carYear: { fontSize: 12, color: C.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 4 },
  carTitle: { fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: "'Georgia', serif" },
  carTrim: { fontSize: 13, color: C.muted, marginBottom: 14 },
  carSpecs: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: C.muted, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` },
  carPrice: { fontSize: 26, fontWeight: 800, color: C.accent, marginBottom: 0 },
  carFoot: { display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 10 },
  // Auction card
  auctionImg: { height: 200, background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, position: "relative" },
  auctionTypeBadge: { position: "absolute", top: 14, left: 14, background: "rgba(124, 58, 237, 0.95)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, padding: "5px 10px", borderRadius: 4 },
  auctionTimer: { color: "#fff", padding: "8px 22px", fontSize: 14, fontWeight: 800, letterSpacing: 2, fontFamily: "monospace" },
  bidStatRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}` },
  bidLabel: { fontSize: 10, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 2 },
  detailWrap: { padding: "32px 0 64px" },
  backBtn: { background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, fontFamily: "inherit", marginBottom: 24, padding: 0, letterSpacing: 1 },
  detailCard: { display: "flex", gap: 48, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 40, flexWrap: "wrap" },
  detailImg: { width: 240, height: 240, background: C.surface, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, flexShrink: 0 },
  carDetailImg: { width: 320, height: 280, background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 140, flexShrink: 0 },
  detailInfo: { flex: 1, minWidth: 280 },
  detailMeta: { display: "flex", gap: 10, marginBottom: 12, alignItems: "center", flexWrap: "wrap" },
  detailCat: { fontSize: 11, letterSpacing: 2, color: C.muted, textTransform: "uppercase" },
  detailTitle: { fontSize: 32, fontWeight: 800, margin: "0 0 14px", fontFamily: "'Georgia', serif" },
  detailPrice: { fontSize: 40, fontWeight: 800, color: C.accent, marginBottom: 24 },
  auctionDetailBox: { background: "rgba(168, 85, 247, .08)", border: `1px solid ${C.purple}`, borderRadius: 12, padding: 20, marginBottom: 24 },
  auctionDetailRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 },
  detailRow: { display: "flex", gap: 12, fontSize: 14, color: C.muted, marginBottom: 10, alignItems: "center", flexWrap: "wrap" },
  specGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, padding: "20px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, marginBottom: 20 },
  specItem: { display: "flex", flexDirection: "column", gap: 4 },
  specLabel: { fontSize: 11, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase" },
  specVal: { fontSize: 14, fontWeight: 600 },
  detailDesc: { marginTop: 16, color: C.muted, lineHeight: 1.7, fontSize: 14 },
  detailActions: { marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" },
  buyBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 10, padding: "14px 28px", fontWeight: 800, cursor: "pointer", fontSize: 15, fontFamily: "inherit", letterSpacing: 1 },
  msgBtn: { background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 22px", cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
  deleteBtn: { background: "#fff", color: C.red, border: `1.5px solid ${C.red}`, borderRadius: 10, padding: "14px 22px", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 700, transition: "background .15s" },
  yourListingBadge: { background: "#f0fdf4", color: C.green, border: `1px solid ${C.green}`, borderRadius: 10, padding: "12px 18px", fontSize: 13, fontWeight: 700, letterSpacing: 0.5 },
  profileListingWrap: { position: "relative" },
  profileDeleteBtn: { position: "absolute", bottom: 12, right: 12, background: "rgba(255,255,255,0.95)", color: C.red, border: `1px solid ${C.red}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", zIndex: 5 },
  authWrap: { padding: "60px 0 80px", display: "flex", justifyContent: "center" },
  authCard: { width: "100%", maxWidth: 440, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 36, display: "flex", flexDirection: "column", gap: 16 },
  authTabs: { display: "flex", gap: 8, background: C.surface, padding: 6, borderRadius: 10 },
  authTab: { flex: 1, background: "transparent", border: "none", color: C.muted, padding: "10px 0", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit", letterSpacing: 1 },
  authTabActive: { background: C.accent, color: "#000", fontWeight: 700 },
  authTitle: { fontSize: 26, fontWeight: 800, margin: "8px 0 0", fontFamily: "'Georgia', serif" },
  authSub: { color: C.muted, fontSize: 14, margin: "0 0 8px" },
  authNote: { color: C.muted, fontSize: 12, textAlign: "center", margin: 0 },
  pageWrap: { padding: "40px 0 80px" },
  pageTitle: { fontSize: "clamp(24px, 4.5vw, 32px)", fontWeight: 800, marginBottom: 28, fontFamily: "'Georgia', serif" },
  emptyState: { textAlign: "center", padding: 80, color: C.muted },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  shopBtn: { marginTop: 16, background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
  savedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  msgLayout: { display: "flex", height: 560, maxHeight: "75vh", minHeight: 480, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" },
  convoList: { width: 280, minWidth: 240, flex: "0 0 280px", borderRight: `1px solid ${C.border}`, overflowY: "auto" },
  convoItem: { display: "flex", gap: 12, padding: 14, borderBottom: `1px solid ${C.border}`, cursor: "pointer", alignItems: "flex-start" },
  convoItemActive: { background: C.surface },
  convoAvatar: { fontSize: 28, flexShrink: 0 },
  convoName: { fontWeight: 700, fontSize: 14, marginBottom: 2 },
  convoNameRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 2 },
  convoListing: { fontSize: 11, color: C.accent, marginBottom: 4, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
  convoLast: { fontSize: 12, color: C.muted, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
  convoItemUnread: { background: "rgba(240,165,0,0.05)" },
  unreadDot: { width: 8, height: 8, borderRadius: "50%", background: C.red, flexShrink: 0 },
  msgPanel: { flex: "1 1 0", display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 },
  msgHeader: { display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: `1px solid ${C.border}` },
  msgListingTag: { fontSize: 11, color: C.accent, background: "rgba(240,165,0,.1)", padding: "4px 10px", borderRadius: 12 },

  // Listing context card (replaces the plain "Test3" pill)
  listingContextCard: {
    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
    cursor: "pointer", maxWidth: 280, transition: "background .15s",
  },
  listingContextImg: { width: 44, height: 44, borderRadius: 6, objectFit: "cover", flexShrink: 0 },
  listingContextImgPlaceholder: { width: 44, height: 44, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  listingContextLabel: { fontSize: 9, letterSpacing: 1, color: C.muted, textTransform: "uppercase", fontWeight: 600 },
  listingContextTitle: { fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.3, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  listingContextPrice: { fontSize: 11, color: C.accent, fontWeight: 700, marginTop: 1 },
  listingContextArrow: { color: C.muted, fontSize: 14, flexShrink: 0 },

  msgScroll: { flex: "1 1 0", overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 4, minHeight: 0 },
  msgBubble: { maxWidth: "70%", padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.4 },
  msgMine: { alignSelf: "flex-end", background: C.accent, color: "#000" },
  msgTheirs: { alignSelf: "flex-start", background: C.surface, color: C.text, border: `1px solid ${C.border}` },
  msgOffer: { background: "rgba(52, 199, 89, .15)", color: C.green, border: `1px solid ${C.green}`, fontWeight: 700 },

  // Timestamps + separators
  msgTimeStamp: { fontSize: 10, color: C.muted, marginTop: 2, marginBottom: 6, padding: "0 4px" },
  msgTimeSeparator: {
    alignSelf: "center", fontSize: 11, color: C.muted, padding: "8px 14px 4px",
    margin: "8px 0 4px", letterSpacing: 0.3,
  },

  // Typing indicator inside the chat panel
  typingRow: { display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start", marginTop: 4 },
  typingBubble: { display: "flex", gap: 4, padding: "8px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 },
  typingDotMsg: {
    width: 6, height: 6, borderRadius: "50%", background: C.muted,
    display: "inline-block", animation: "typingBounce 1.2s infinite ease-in-out",
  },
  typingLabel: { fontSize: 11, color: C.muted, fontStyle: "italic" },

  msgInputRow: { display: "flex", gap: 10, padding: 14, borderTop: `1px solid ${C.border}`, background: C.card, flexShrink: 0 },
  msgInput: { flex: 1, background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "10px 14px", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" },
  msgSendBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  profileHeader: { display: "flex", gap: 24, alignItems: "flex-start", padding: 28, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, marginBottom: 32, flexWrap: "wrap" },
  profileAvatar: { fontSize: 64, width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center", background: C.surface, borderRadius: "50%" },
  profileName: { fontSize: 28, fontWeight: 800, margin: "0 0 8px", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", gap: 10 },
  youBadge: { background: C.accent, color: "#000", padding: "2px 10px", borderRadius: 12, fontSize: 11, letterSpacing: 1 },
  profileMeta: { display: "flex", gap: 18, color: C.muted, fontSize: 13, flexWrap: "wrap" },
  profileBio: { color: C.muted, marginTop: 12, fontSize: 14, lineHeight: 1.6 },
  signOutBtn: { background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  profileTabs: { marginBottom: 36 },
  profileSection: { fontSize: 18, fontWeight: 700, margin: "0 0 16px", letterSpacing: 1 },
  reviewForm: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 },
  starRow: { display: "flex", gap: 4 },
  starBtn: { background: "none", border: "none", fontSize: 28, cursor: "pointer", padding: 0 },
  reviewList: { display: "flex", flexDirection: "column", gap: 12 },
  reviewCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 },
  reviewTop: { display: "flex", gap: 12, alignItems: "center", marginBottom: 8 },
  reviewText: { color: C.muted, fontSize: 14, lineHeight: 1.6, margin: 0 },
  sellWrap: { padding: "40px 0 80px", maxWidth: 720, margin: "0 auto" },
  sellHeader: { marginBottom: 24, textAlign: "center" },
  sellTitle: { fontSize: "clamp(26px, 4.5vw, 36px)", fontWeight: 800, margin: "0 0 10px", fontFamily: "'Georgia', serif" },
  sellSub: { color: C.muted, fontSize: 15 },
  sellToggle: { display: "flex", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, marginBottom: 24 },
  toggleBtn: { flex: 1, background: "transparent", border: "none", color: C.muted, padding: "12px 0", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
  toggleBtnActive: { background: C.accent, color: "#000", fontWeight: 700 },
  sellForm: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 18 },

  // VIN lookup card
  vinLookupCard: { background: "#f8fafc", border: `1.5px solid ${C.blue}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12, marginBottom: 4 },
  vinHeader: { display: "flex", alignItems: "flex-start", gap: 12 },
  vinHeaderIcon: { fontSize: 22, lineHeight: 1 },
  vinHeaderTitle: { fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 2 },
  vinHeaderSub: { fontSize: 12, color: C.muted, lineHeight: 1.45 },
  vinInputRow: { display: "flex", gap: 8 },
  vinInput: { flex: 1, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.text, fontSize: 14, fontFamily: "monospace", letterSpacing: 1, outline: "none" },
  vinLookupBtn: { background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "0 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  vinHelper: { fontSize: 12, lineHeight: 1.5, minHeight: 16 },
  vinDecodedPanel: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, padding: 14, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 4 },
  vinDecodedItem: { display: "flex", flexDirection: "column", gap: 2 },
  vinDecodedLabel: { fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase" },
  vinDecodedValue: { fontSize: 13, color: C.text, fontWeight: 600 },
  formGroup: { display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  formRow: { display: "flex", gap: 16, flexWrap: "wrap" },
  formLabel: { fontSize: 12, letterSpacing: 1.5, color: C.muted, textTransform: "uppercase" },
  formInput: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  uploadBox: { border: `2px dashed ${C.border}`, borderRadius: 10, padding: "26px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" },
  uploadIcon: { fontSize: 30 },
  uploadText: { color: C.muted, fontSize: 14 },
  uploadLink: { color: C.accent, cursor: "pointer" },
  uploadHint: { fontSize: 12, color: C.muted },
  submitBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 10, padding: "16px 0", fontWeight: 800, cursor: "pointer", fontSize: 16, fontFamily: "inherit", letterSpacing: 1.5 },
  submitBtnSmall: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", alignSelf: "flex-start" },
  successBox: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: "center" },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 800, marginBottom: 10 },
  successMsg: { color: C.muted, fontSize: 15 },
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, maxWidth: 460, width: "100%", display: "flex", flexDirection: "column", gap: 14 },
  modalTitle: { fontSize: 22, fontWeight: 800, margin: 0, fontFamily: "'Georgia', serif" },
  modalSub: { color: C.muted, fontSize: 14, margin: 0 },
  modalActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 },
  // Videos
  videoHero: { padding: "48px 0 28px" },
  videoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22, paddingBottom: 64 },
  videoCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "transform .2s" },
  videoThumb: { height: 180, background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  videoThumbIcon: { fontSize: 90, opacity: 0.9 },
  playOverlay: { position: "absolute", width: 56, height: 56, borderRadius: "50%", background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 4 },
  videoDuration: { position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.85)", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700, fontFamily: "monospace" },
  videoLevel: { position: "absolute", top: 10, left: 10, color: "#000", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 8px", borderRadius: 4 },
  videoBody: { padding: 16 },
  videoTitle: { fontSize: 15, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.35, fontFamily: "'Georgia', serif" },
  videoChannel: { fontSize: 12, color: C.muted, marginBottom: 6 },
  videoStats: { fontSize: 12, color: C.muted, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" },
  videoPlayerWrap: { padding: "32px 0 64px" },
  videoPlayerLayout: { display: "flex", gap: 24, flexWrap: "wrap" },
  videoMain: { flex: 1, minWidth: 320 },
  videoPlayer: { width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: 14, overflow: "hidden", position: "relative", marginBottom: 16, border: `1px solid ${C.border}` },
  videoPlayerInner: { width: "100%", height: "100%", background: "radial-gradient(circle at center, #1a1d24 0%, #000 70%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  videoPlayerIcon: { fontSize: 140, opacity: 0.4 },
  playButton: { position: "absolute", width: 80, height: 80, borderRadius: "50%", background: "rgba(240,165,0,0.9)", color: "#000", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 6, cursor: "pointer" },
  videoControls: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 18px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))", display: "flex", alignItems: "center", gap: 14 },
  controlBtn: { color: "#fff", fontSize: 18, cursor: "pointer" },
  controlTime: { color: "#fff", fontSize: 12, fontFamily: "monospace", marginLeft: "auto" },
  progressBar: { flex: 1, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" },
  progressFilled: { width: "0%", height: "100%", background: C.accent },
  videoBigTitle: { fontSize: 26, fontWeight: 800, margin: "0 0 10px", fontFamily: "'Georgia', serif", lineHeight: 1.25 },
  videoBigStats: { display: "flex", gap: 10, alignItems: "center", color: C.muted, fontSize: 13, marginBottom: 16, flexWrap: "wrap" },
  videoActions: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  videoActionBtn: { background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  videoActionBtnActive: { background: "rgba(240,165,0,.15)", borderColor: C.accent, color: C.accent },
  channelBar: { display: "flex", alignItems: "center", gap: 14, padding: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 18, cursor: "pointer" },
  channelAvatar: { fontSize: 36, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", background: C.surface, borderRadius: "50%" },
  channelName: { fontWeight: 700, fontSize: 15, marginBottom: 2 },
  channelMeta: { fontSize: 12, color: C.muted },
  subscribeBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 20, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  videoDescBox: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 24 },
  videoDescText: { color: C.text, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" },
  videoTagsRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  videoTag: { background: C.surface, color: C.muted, padding: "3px 10px", borderRadius: 12, fontSize: 11 },
  commentsSection: { marginTop: 24 },
  commentInputWrap: { display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" },
  commentCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 },
  commentTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  relatedPanel: { width: 360, flexShrink: 0 },
  relatedList: { display: "flex", flexDirection: "column", gap: 10 },
  relatedItem: { display: "flex", gap: 10, padding: 8, borderRadius: 10, cursor: "pointer", transition: "background .15s" },
  relatedThumb: { width: 140, height: 80, background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, position: "relative", flexShrink: 0 },
  relatedDuration: { position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.85)", color: "#fff", padding: "1px 5px", borderRadius: 3, fontSize: 10, fontWeight: 700, fontFamily: "monospace" },
  relatedTitle: { fontSize: 13, fontWeight: 700, lineHeight: 1.3, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  relatedChannel: { fontSize: 11, color: C.muted, marginBottom: 2 },
  relatedStats: { fontSize: 11, color: C.muted },
  // Chatbot
  chatFab: { position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: C.accent, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, cursor: "pointer", boxShadow: "0 6px 20px rgba(240,165,0,0.4)", zIndex: 90, fontWeight: 700 },
  chatPanel: { position: "fixed", bottom: 92, right: 24, width: 360, maxWidth: "calc(100vw - 48px)", height: 520, maxHeight: "calc(100vh - 120px)", background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 90, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" },
  chatHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottom: `1px solid ${C.border}`, background: C.surface },
  chatCloseBtn: { background: "transparent", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: 4 },
  chatScroll: { flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  chatBubble: { maxWidth: "85%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5 },
  chatBot: { alignSelf: "flex-start", background: C.surface, color: C.text, border: `1px solid ${C.border}` },
  chatMine: { alignSelf: "flex-end", background: C.accent, color: "#000" },
  chatAgent: { alignSelf: "flex-start", background: "#eef2ff", color: C.text, border: `1px solid ${C.blue}` },
  chatSenderLabel: { fontSize: 10, color: C.muted, marginBottom: 2, marginLeft: 4, letterSpacing: 0.5 },
  chatSystem: { alignSelf: "center", background: "#f3f4f6", color: C.muted, border: `1px solid ${C.border}`, padding: "6px 14px", borderRadius: 12, fontSize: 11, fontStyle: "italic", maxWidth: "90%", textAlign: "center" },
  chatEndBtn: { background: "transparent", border: `1px solid ${C.red}`, color: C.red, fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", marginRight: 4, fontWeight: 700 },
  connectAgentBtn: { alignSelf: "flex-start", background: C.blue, color: "#fff", border: "none", borderRadius: 18, padding: "8px 16px", marginTop: 6, marginLeft: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 6px rgba(37,99,235,0.25)" },
  typingIndicator: { display: "flex", gap: 4, padding: "8px 12px", alignSelf: "flex-start", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, width: "fit-content" },
  typingDot: { width: 8, height: 8, borderRadius: "50%", background: C.muted, display: "inline-block", animation: "typingBounce 1.2s infinite ease-in-out" },
  chatChips: { display: "flex", gap: 6, padding: "0 12px 8px", flexWrap: "wrap" },
  chatChip: { background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "5px 10px", borderRadius: 14, cursor: "pointer", fontSize: 11, fontFamily: "inherit" },
  chatInputRow: { display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${C.border}` },
  chatInput: { flex: 1, background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" },
  chatSendBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "0 16px", fontWeight: 800, cursor: "pointer", fontSize: 18, fontFamily: "inherit" },

  // Footer links
  footer: { background: C.surface, borderTop: `1px solid ${C.border}`, padding: "24px 0", marginTop: "auto" },
  footerInner: { maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  footerLogo: { fontWeight: 700, letterSpacing: 3, color: C.accent },
  footerLinks: { fontSize: 12, color: C.muted, letterSpacing: 1 },
  footerLinkRow: { display: "flex", alignItems: "center", gap: 4 },
  footerLinkBtn: { background: "transparent", border: "none", color: C.muted, fontSize: 12, letterSpacing: 1, cursor: "pointer", padding: "2px 8px", fontFamily: "inherit", textDecoration: "none" },
  footerSep: { color: C.border, fontSize: 12 },

  // Legal / Support pages
  legalWrap: { maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px", lineHeight: 1.65 },
  legalTitle: { fontSize: "clamp(26px, 4.5vw, 36px)", fontWeight: 800, margin: "16px 0 8px", color: C.text },
  legalDate: { color: C.muted, fontSize: 13, marginBottom: 28 },
  legalH2: { fontSize: 18, fontWeight: 700, margin: "32px 0 10px", color: C.text },
  legalP: { fontSize: 14, color: C.text, marginBottom: 12 },
  legalLink: { color: C.accent, textDecoration: "underline" },

  // Support page
  supportCardRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 36 },
  supportCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 },
  supportIcon: { fontSize: 28 },
  supportCardTitle: { fontSize: 17, fontWeight: 700, margin: 0 },
  supportCardText: { fontSize: 13, color: C.muted, lineHeight: 1.55, margin: "4px 0 12px" },
  supportCardBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
  faqItem: { borderTop: `1px solid ${C.border}`, paddingTop: 18, marginBottom: 18 },
  faqQ: { fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: C.text },
};
