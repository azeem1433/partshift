import { useState, useMemo, useEffect, useRef } from "react";

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

/* ============== APP ============== */
export default function App() {
  const [view, setView] = useState("browse");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", zip: "" });

  const [parts, setParts] = useState(initialParts);
  const [cars, setCars] = useState(initialCars);
  const [auctions, setAuctions] = useState(initialAuctions);
  const [videos, setVideos] = useState(initialVideos);
  const [users, setUsers] = useState(initialUsers);
  const [reviews, setReviews] = useState(initialReviews);

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
      html, body, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; min-height: 100vh; background: ${C.bg}; }
      * { box-sizing: border-box; }
    `;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
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
  const chatScrollRef = useRef(null);
  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

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
    if (text.includes("safe") || text.includes("scam") || text.includes("fraud")) return "Stay safe: only message inside PartShift, never wire money, ask for VIN/maintenance records on cars, request inspection photos, and prefer in-person pickup or escrow for high-value items.";
    if (text.includes("hi") || text.includes("hello") || text.includes("hey")) return "Hey! Ask me about auctions, listings, shipping, fees, location filters, or anything else about using PartShift.";
    if (text.includes("thank")) return "Anytime! Anything else I can help you with?";
    return "I can help with: auctions & bidding, buying & selling, repair videos, location filters, messaging sellers, fees, shipping, and account questions. What would you like to know?";
  };

  const sendChat = () => {
    if (!chatDraft.trim()) return;
    const userMsg = { from: "user", text: chatDraft };
    const reply = botReply(chatDraft);
    setChatMessages(prev => [...prev, userMsg]);
    setChatDraft("");
    setTimeout(() => setChatMessages(prev => [...prev, { from: "bot", text: reply }]), 600);
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

  const handleAuth = () => {
    if (authMode === "signup") {
      if (!authForm.name || !authForm.email) return;
      const newId = "me_" + Date.now();
      const newUser = { id: newId, name: authForm.name, joined: "2026", avatar: "🧑", rating: 0, totalSales: 0, city: "—", state: "TN", zip: authForm.zip || "37064", bio: "" };
      setUsers({ ...users, [newId]: newUser });
      setUser(newUser);
    } else setUser(users.u1);
    setAuthForm({ name: "", email: "", password: "", zip: "" });
    setView("browse");
  };

  const toggleSave = (id) => {
    if (!requireAuth()) return;
    setSaved(saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id]);
  };

  const startConversation = (sellerId, listingId) => {
    if (!requireAuth()) return;
    let convo = conversations.find(c => c.otherUserId === sellerId && c.listingId === listingId);
    if (!convo) {
      convo = { id: Date.now(), otherUserId: sellerId, listingId, messages: [] };
      setConversations([...conversations, convo]);
    }
    setActiveConvo(convo.id);
    setView("messages");
  };

  const sendMessage = () => {
    if (!msgDraft.trim() || !activeConvo) return;
    setConversations(conversations.map(c =>
      c.id === activeConvo ? { ...c, messages: [...c.messages, { from: user.id, text: msgDraft, time: "now" }] } : c
    ));
    setMsgDraft("");
    setTimeout(() => {
      setConversations(prev => prev.map(c =>
        c.id === activeConvo
          ? { ...c, messages: [...c.messages, { from: c.otherUserId, text: "Thanks for reaching out! Yes, still available.", time: "now" }] }
          : c
      ));
    }, 1500);
  };

  const submitOffer = () => {
    if (!requireAuth() || !offerDraft || !selected) return;
    setShowOfferModal(false);
    const amt = +offerDraft;
    setOfferDraft("");
    startConversation(selected.sellerId, selected.id);
    setTimeout(() => {
      setConversations(prev => prev.map(c =>
        c.otherUserId === selected.sellerId && c.listingId === selected.id
          ? { ...c, messages: [...c.messages, { from: user.id, text: `💰 Offer submitted: $${amt.toLocaleString()}`, time: "now", isOffer: true }] }
          : c
      ));
    }, 100);
  };

  const submitBid = () => {
    if (!requireAuth() || !bidDraft || !selected) return;
    const amt = +bidDraft;
    if (amt <= selected.currentBid) {
      alert(`Your bid must be higher than the current bid of $${selected.currentBid.toLocaleString()}`);
      return;
    }
    setAuctions(prev => prev.map(a => a.id === selected.id
      ? { ...a, currentBid: amt, bidCount: a.bidCount + 1, lastBidder: user.id }
      : a));
    setSelected({ ...selected, currentBid: amt, bidCount: selected.bidCount + 1, lastBidder: user.id });
    setShowBidModal(false);
    setBidDraft("");
  };

  const submitReview = (sellerId) => {
    if (!requireAuth() || !reviewDraft.text.trim()) return;
    const newReview = { id: Date.now(), sellerId, buyerName: user.name, rating: reviewDraft.rating, date: "just now", text: reviewDraft.text };
    setReviews([newReview, ...reviews]);
    setReviewDraft({ rating: 5, text: "" });
  };

  const handleSellSubmit = () => {
    if (!requireAuth()) return;
    const partImage = sellForm.photos[0] || "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&q=80";
    const carImage = carForm.photos[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80";
    if (sellMode === "part") {
      if (!sellForm.title || (!sellForm.price && !sellForm.listAsAuction)) return;
      if (sellForm.listAsAuction) {
        const newAuction = {
          id: Date.now(), type: "auction", itemType: "part", title: sellForm.title, category: sellForm.category,
          image: partImage, photos: sellForm.photos, currentBid: +sellForm.startBid || 1, startBid: +sellForm.startBid || 1,
          reserve: +sellForm.reserve || 0, bidCount: 0, sellerId: user.id,
          city: sellForm.city || user.city, state: sellForm.state || user.state, zip: sellForm.zip || user.zip,
          endsInSec: (+sellForm.duration || 3) * 86400, desc: sellForm.description, tag: "NEW",
        };
        setAuctions([newAuction, ...auctions]);
      } else {
        const newPart = {
          id: Date.now(), type: "part", title: sellForm.title, category: sellForm.category, price: +sellForm.price,
          condition: sellForm.condition, sellerId: user.id, city: sellForm.city || user.city,
          state: sellForm.state || user.state, zip: sellForm.zip || user.zip, image: partImage, photos: sellForm.photos,
          tag: isNew(sellForm.condition) ? "NEW" : "", desc: sellForm.description,
        };
        setParts([newPart, ...parts]);
      }
    } else {
      if (!carForm.make || !carForm.model || (!carForm.price && !carForm.listAsAuction)) return;
      if (carForm.listAsAuction) {
        const newAuction = {
          id: Date.now(), type: "auction", itemType: "car", title: `${carForm.year} ${carForm.make} ${carForm.model}`,
          make: carForm.make, model: carForm.model, year: +carForm.year || 2020, mileage: +carForm.mileage || 0,
          image: carImage, photos: carForm.photos, category: "Auction Car", currentBid: +carForm.startBid || 1, startBid: +carForm.startBid || 1,
          reserve: +carForm.reserve || 0, bidCount: 0, sellerId: user.id,
          city: carForm.city || user.city, state: carForm.state || user.state, zip: carForm.zip || user.zip,
          endsInSec: (+carForm.duration || 7) * 86400, desc: carForm.description, tag: "NEW",
        };
        setAuctions([newAuction, ...auctions]);
      } else {
        const newCar = {
          id: Date.now(), type: "car", make: carForm.make, model: carForm.model, year: +carForm.year || 2020,
          trim: carForm.trim, price: +carForm.price, mileage: +carForm.mileage || 0, transmission: carForm.transmission,
          drivetrain: carForm.drivetrain, fuel: carForm.fuel, color: carForm.color, sellerId: user.id,
          city: carForm.city || user.city, state: carForm.state || user.state, zip: carForm.zip || user.zip,
          image: carImage, photos: carForm.photos, tag: "NEW", vin: carForm.vin, desc: carForm.description,
        };
        setCars([newCar, ...cars]);
      }
    }
    setSellSuccess(true);
    setTimeout(() => {
      setSellSuccess(false);
      setSellForm({ title: "", category: "Engine", price: "", condition: "New", description: "", city: "", state: "", zip: "", listAsAuction: false, startBid: "", duration: "3", reserve: "", photos: [] });
      setCarForm({ make: "", model: "", year: "", trim: "", price: "", mileage: "", transmission: "Automatic", drivetrain: "FWD", fuel: "Gasoline", color: "", description: "", city: "", state: "", vin: "", zip: "", listAsAuction: false, startBid: "", duration: "7", reserve: "", photos: [] });
      setView("browse");
    }, 2200);
  };

  const allListings = [...parts, ...cars, ...auctions];
  const savedListings = allListings.filter(l => saved.includes(l.id));
  const sellerReviews = (id) => reviews.filter(r => r.sellerId === id);
  const sellerOf = (l) => users[l.sellerId] || { name: "Unknown", avatar: "?", rating: 0, totalSales: 0 };

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
                <button onClick={() => setView("messages")} style={styles.iconBtn}>💬 {conversations.length > 0 && <span style={styles.dot}>{conversations.length}</span>}</button>
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
              <button style={styles.submitBtn} onClick={handleAuth}>{authMode === "login" ? "Sign In →" : "Create Account →"}</button>
              <p style={styles.authNote}>Demo mode — any email/password works.</p>
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
                <img src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&q=80" alt="Performance engine" style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }} />
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
            onMessage={() => startConversation(selected.sellerId, selected.id)}
            onOffer={() => { if (requireAuth()) setShowOfferModal(true); }}
            onBid={() => { if (requireAuth()) { setBidDraft(""); setShowBidModal(true); } }}
            onProfile={() => { setProfileUserId(selected.sellerId); setView("profile"); }} user={user} />
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
              <div style={styles.msgLayout}>
                <div style={styles.convoList}>
                  {conversations.map(c => {
                    const other = users[c.otherUserId];
                    const listing = allListings.find(l => l.id === c.listingId);
                    const lastMsg = c.messages[c.messages.length - 1];
                    return (
                      <div key={c.id} onClick={() => setActiveConvo(c.id)}
                        style={{ ...styles.convoItem, ...(activeConvo === c.id ? styles.convoItemActive : {}) }}>
                        <div style={styles.convoAvatar}>{other?.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.convoName}>{other?.name}</div>
                          <div style={styles.convoListing}>re: {listing?.title || `${listing?.year} ${listing?.make} ${listing?.model}`}</div>
                          <div style={styles.convoLast}>{lastMsg ? lastMsg.text.slice(0, 40) : "No messages yet"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={styles.msgPanel}>
                  {activeConvo ? (() => {
                    const c = conversations.find(x => x.id === activeConvo);
                    const other = users[c.otherUserId];
                    const listing = allListings.find(l => l.id === c.listingId);
                    return (
                      <>
                        <div style={styles.msgHeader}>
                          <span style={{ fontSize: 24 }}>{other?.avatar}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{other?.name}</div>
                            <div style={{ fontSize: 12, color: C.muted }}>★ {other?.rating} · {other?.city}, {other?.state}</div>
                          </div>
                          <span style={styles.msgListingTag}>{listing?.title || `${listing?.year} ${listing?.make} ${listing?.model}`}</span>
                        </div>
                        <div style={styles.msgScroll}>
                          {c.messages.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: 40 }}>Send the first message.</div>}
                          {c.messages.map((m, i) => (
                            <div key={i} style={{ ...styles.msgBubble, ...(m.from === user.id ? styles.msgMine : styles.msgTheirs), ...(m.isOffer ? styles.msgOffer : {}) }}>{m.text}</div>
                          ))}
                        </div>
                        <div style={styles.msgInputRow}>
                          <input style={styles.msgInput} placeholder="Type a message..." value={msgDraft}
                            onChange={e => setMsgDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
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
              <div style={styles.profileTabs}>
                <h3 style={styles.profileSection}>Listings ({userListings.length})</h3>
                {userListings.length === 0 ? <p style={{ color: C.muted }}>No active listings.</p> : (
                  <div style={styles.savedGrid}>
                    {userListings.map(l => l.type === "car" ? (
                      <CarCard key={l.id} car={l} seller={u} saved={saved.includes(l.id)}
                        onClick={() => { setSelected(l); setView("detail"); }} onSave={(e) => { e.stopPropagation(); toggleSave(l.id); }} />
                    ) : l.type === "auction" ? (
                      <AuctionCard key={l.id} auction={l} seller={u} saved={saved.includes(l.id)}
                        onClick={() => { setSelected(l); setView("detail"); }} onSave={(e) => { e.stopPropagation(); toggleSave(l.id); }} />
                    ) : (
                      <PartCard key={l.id} item={l} seller={u} saved={saved.includes(l.id)}
                        onClick={() => { setSelected(l); setView("detail"); }} onSave={(e) => { e.stopPropagation(); toggleSave(l.id); }} />
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
          <div style={styles.chatHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>PartShift Assistant</div>
                <div style={{ fontSize: 11, color: C.green }}>● Online · usually replies instantly</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={styles.chatCloseBtn}>✕</button>
          </div>
          <div style={styles.chatScroll} ref={chatScrollRef}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ ...styles.chatBubble, ...(m.from === "user" ? styles.chatMine : styles.chatBot) }}>{m.text}</div>
            ))}
          </div>
          <div style={styles.chatChips}>
            {["How do auctions work?", "Watch repair videos", "How do I sell?", "Stay safe"].map(s => (
              <button key={s} onClick={() => { setChatDraft(s); setTimeout(() => sendChat(), 50); }} style={styles.chatChip}>{s}</button>
            ))}
          </div>
          <div style={styles.chatInputRow}>
            <input style={styles.chatInput} placeholder="Ask anything..." value={chatDraft}
              onChange={e => setChatDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
            <button style={styles.chatSendBtn} onClick={sendChat}>→</button>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span style={styles.footerLogo}>⚙ PARTSHIFT</span>
          <span style={styles.footerLinks}>© 2026 · Parts · Cars · Auctions</span>
          <span style={styles.footerLinks}>Privacy · Terms · Support</span>
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

function DetailView({ item, seller, reviews, saved, onBack, onSave, onMessage, onOffer, onBid, onProfile, user }) {
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
            <div style={styles.detailActions}><span style={{ padding: "12px 0", color: C.muted }}>This is your listing.</span></div>
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

function PhotoUploader({ photos, setPhotos, max = 10 }) {
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    if (!fileList) return;
    const remaining = max - photos.length;
    if (remaining <= 0) {
      alert(`You can only upload up to ${max} photos.`);
      return;
    }
    const files = Array.from(fileList).slice(0, remaining);
    const readers = files.map(file => new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        return reject(new Error(`${file.name} is not an image`));
      }
      if (file.size > 10 * 1024 * 1024) {
        return reject(new Error(`${file.name} is larger than 10MB`));
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers)
      .then(dataUrls => setPhotos([...photos, ...dataUrls]))
      .catch(err => alert(err.message));
  };

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const movePhotoToFront = (idx) => {
    if (idx === 0) return;
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(idx, 1);
    newPhotos.unshift(moved);
    setPhotos(newPhotos);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = ""; // reset so the same file can be re-picked after removal
        }}
      />
      <div
        style={styles.uploadBox}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = C.accent; }}
        onDragLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = C.border;
          handleFiles(e.dataTransfer.files);
        }}
      >
        <span style={styles.uploadIcon}>📷</span>
        <span style={styles.uploadText}>
          {photos.length === 0
            ? "Click to upload or drag and drop"
            : `${photos.length} of ${max} photos uploaded — add more`}
        </span>
        <span style={styles.uploadHint}>JPG, PNG, WEBP up to 10MB each. First photo is the cover.</span>
      </div>

      {photos.length > 0 && (
        <div style={styles.photoGrid}>
          {photos.map((src, idx) => (
            <div key={idx} style={styles.photoTile}>
              <img src={src} alt={`upload ${idx + 1}`} style={styles.photoTileImg} />
              {idx === 0 && <span style={styles.coverBadge}>COVER</span>}
              <button
                type="button"
                style={styles.photoRemoveBtn}
                onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                title="Remove"
              >
                ✕
              </button>
              {idx !== 0 && (
                <button
                  type="button"
                  style={styles.photoSetCoverBtn}
                  onClick={(e) => { e.stopPropagation(); movePhotoToFront(idx); }}
                  title="Set as cover"
                >
                  Set as cover
                </button>
              )}
            </div>
          ))}
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
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Photos (up to 10)</label>
        <PhotoUploader photos={form.photos || []} setPhotos={(photos) => update("photos", photos)} max={10} />
      </div>
      <button style={styles.submitBtn} onClick={onSubmit}>{form.listAsAuction ? "Start Auction →" : "Publish Listing →"}</button>
    </div>
  );
}

function CarSellForm({ form, setForm, onSubmit }) {
  const update = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div style={styles.sellForm}>
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
            {["Gasoline", "Diesel", "Electric", "Hybrid"].map(f => <option key={f}>{f}</option>)}
          </select></div>
      </div>
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>Color</label><input style={styles.formInput} placeholder="Cement Gray" value={form.color} onChange={e => update("color", e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>VIN</label><input style={styles.formInput} placeholder="17-char VIN" value={form.vin} onChange={e => update("vin", e.target.value)} /></div>
      </div>
      <div style={styles.formRow}>
        <div style={styles.formGroup}><label style={styles.formLabel}>City</label><input style={styles.formInput} placeholder="Denver" value={form.city} onChange={e => update("city", e.target.value)} /></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>State</label>
          <select style={styles.formInput} value={form.state} onChange={e => update("state", e.target.value)}>
            <option value="">—</option>{ALL_STATES.map(s => <option key={s}>{s}</option>)}
          </select></div>
        <div style={styles.formGroup}><label style={styles.formLabel}>Zip</label><input style={styles.formInput} placeholder="80201" value={form.zip} onChange={e => update("zip", e.target.value)} maxLength="5" /></div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Description</label>
        <textarea style={{ ...styles.formInput, height: 140, resize: "vertical" }} placeholder="Maintenance, mods, condition..." value={form.description} onChange={e => update("description", e.target.value)} />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Vehicle Photos (up to 20)</label>
        <PhotoUploader photos={form.photos || []} setPhotos={(photos) => update("photos", photos)} max={20} />
      </div>
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
  header: { background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 24 },
  logo: { display: "flex", alignItems: "center", gap: 10, marginRight: "auto", cursor: "pointer" },
  logoIcon: { fontSize: 28, color: C.accent },
  logoText: { fontSize: 20, fontWeight: 700, letterSpacing: 3 },
  nav: { display: "flex", gap: 4 },
  navBtn: { background: "none", border: "none", color: C.muted, cursor: "pointer", padding: "8px 14px", borderRadius: 6, fontSize: 13, letterSpacing: 1, fontFamily: "inherit" },
  navBtnActive: { color: C.accent, background: "rgba(240,165,0,.1)" },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "8px 10px", borderRadius: 8, position: "relative", color: C.text },
  dot: { background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px", position: "absolute", top: 0, right: 0 },
  userPill: { display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, color: C.text, padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  authBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", letterSpacing: 1 },
  main: { flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "0 24px" },
  hero: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "64px 0 40px", gap: 32 },
  heroContent: { flex: 1 },
  heroEyebrow: { fontSize: 11, letterSpacing: 4, color: C.accent, textTransform: "uppercase", marginBottom: 16 },
  heroTitle: { fontSize: 56, fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", fontFamily: "'Georgia', serif" },
  heroSub: { color: C.muted, fontSize: 17, lineHeight: 1.6, maxWidth: 480, marginBottom: 32 },
  heroStats: { display: "flex", gap: 36, marginBottom: 28 },
  heroStat: { display: "flex", flexDirection: "column", gap: 4 },
  heroStatVal: { fontSize: 24, fontWeight: 700, color: C.accent },
  heroStatLab: { fontSize: 12, color: C.muted, letterSpacing: 1 },
  heroCtas: { display: "flex", gap: 12 },
  heroCta: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "13px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit", letterSpacing: 1 },
  heroCtaGhost: { background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "13px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
  heroVisual: { width: 480, flexShrink: 0 },
  heroGear: { fontSize: 180, opacity: 0.07 },
  carsHero: { padding: "48px 0 28px" },
  carsTitle: { fontSize: 48, fontWeight: 800, lineHeight: 1.1, margin: "0 0 14px", fontFamily: "'Georgia', serif" },
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
  authWrap: { padding: "60px 0 80px", display: "flex", justifyContent: "center" },
  authCard: { width: "100%", maxWidth: 440, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 36, display: "flex", flexDirection: "column", gap: 16 },
  authTabs: { display: "flex", gap: 8, background: C.surface, padding: 6, borderRadius: 10 },
  authTab: { flex: 1, background: "transparent", border: "none", color: C.muted, padding: "10px 0", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit", letterSpacing: 1 },
  authTabActive: { background: C.accent, color: "#000", fontWeight: 700 },
  authTitle: { fontSize: 26, fontWeight: 800, margin: "8px 0 0", fontFamily: "'Georgia', serif" },
  authSub: { color: C.muted, fontSize: 14, margin: "0 0 8px" },
  authNote: { color: C.muted, fontSize: 12, textAlign: "center", margin: 0 },
  pageWrap: { padding: "40px 0 80px" },
  pageTitle: { fontSize: 32, fontWeight: 800, marginBottom: 28, fontFamily: "'Georgia', serif" },
  emptyState: { textAlign: "center", padding: 80, color: C.muted },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  shopBtn: { marginTop: 16, background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
  savedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  msgLayout: { display: "flex", height: 560, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" },
  convoList: { width: 280, borderRight: `1px solid ${C.border}`, overflowY: "auto" },
  convoItem: { display: "flex", gap: 12, padding: 14, borderBottom: `1px solid ${C.border}`, cursor: "pointer", alignItems: "flex-start" },
  convoItemActive: { background: C.surface },
  convoAvatar: { fontSize: 28, flexShrink: 0 },
  convoName: { fontWeight: 700, fontSize: 14, marginBottom: 2 },
  convoListing: { fontSize: 11, color: C.accent, marginBottom: 4, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
  convoLast: { fontSize: 12, color: C.muted, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
  msgPanel: { flex: 1, display: "flex", flexDirection: "column" },
  msgHeader: { display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: `1px solid ${C.border}` },
  msgListingTag: { fontSize: 11, color: C.accent, background: "rgba(240,165,0,.1)", padding: "4px 10px", borderRadius: 12 },
  msgScroll: { flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 },
  msgBubble: { maxWidth: "70%", padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.4 },
  msgMine: { alignSelf: "flex-end", background: C.accent, color: "#000" },
  msgTheirs: { alignSelf: "flex-start", background: C.surface, color: C.text, border: `1px solid ${C.border}` },
  msgOffer: { background: "rgba(52, 199, 89, .15)", color: C.green, border: `1px solid ${C.green}`, fontWeight: 700 },
  msgInputRow: { display: "flex", gap: 10, padding: 14, borderTop: `1px solid ${C.border}` },
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
  sellTitle: { fontSize: 36, fontWeight: 800, margin: "0 0 10px", fontFamily: "'Georgia', serif" },
  sellSub: { color: C.muted, fontSize: 15 },
  sellToggle: { display: "flex", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, marginBottom: 24 },
  toggleBtn: { flex: 1, background: "transparent", border: "none", color: C.muted, padding: "12px 0", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
  toggleBtnActive: { background: C.accent, color: "#000", fontWeight: 700 },
  sellForm: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 18 },
  formGroup: { display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  formRow: { display: "flex", gap: 16, flexWrap: "wrap" },
  formLabel: { fontSize: 12, letterSpacing: 1.5, color: C.muted, textTransform: "uppercase" },
  formInput: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.text, fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  uploadBox: { border: `2px dashed ${C.border}`, borderRadius: 10, padding: "32px 16px", textAlign: "center", display: "flex", flexDirection: "column", gap: 6, cursor: "pointer", background: "#fafbfc", transition: "border-color .15s, background .15s" },
  uploadIcon: { fontSize: 30 },
  uploadText: { color: C.text, fontSize: 14, fontWeight: 600 },
  uploadLink: { color: C.accent, cursor: "pointer" },
  uploadHint: { fontSize: 12, color: C.muted },
  photoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginTop: 12 },
  photoTile: { position: "relative", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: "#f3f4f6" },
  photoTileImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  coverBadge: { position: "absolute", top: 6, left: 6, background: C.accent, color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800, letterSpacing: 1 },
  photoRemoveBtn: { position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  photoSetCoverBtn: { position: "absolute", bottom: 6, left: 6, right: 6, background: "rgba(255,255,255,0.95)", color: C.text, border: "none", borderRadius: 6, padding: "5px 0", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
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
  chatChips: { display: "flex", gap: 6, padding: "0 12px 8px", flexWrap: "wrap" },
  chatChip: { background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "5px 10px", borderRadius: 14, cursor: "pointer", fontSize: 11, fontFamily: "inherit" },
  chatInputRow: { display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${C.border}` },
  chatInput: { flex: 1, background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" },
  chatSendBtn: { background: C.accent, color: "#000", border: "none", borderRadius: 8, padding: "0 16px", fontWeight: 800, cursor: "pointer", fontSize: 18, fontFamily: "inherit" },
  footer: { background: C.surface, borderTop: `1px solid ${C.border}`, padding: "24px 0", marginTop: "auto" },
  footerInner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  footerLogo: { fontWeight: 700, letterSpacing: 3, color: C.accent },
  footerLinks: { fontSize: 12, color: C.muted, letterSpacing: 1 },
};
