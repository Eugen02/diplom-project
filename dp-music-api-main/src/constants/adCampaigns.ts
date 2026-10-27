export interface AdCampaignInterface {
  id: string;
  brand: string;
  tagline: string;
  description: string;
  url: string;
  genres: string[];
}

// Mock ad inventory for the genre-targeted ad simulation (thesis
// "monetization" demo). Not real ads/brands integration - just seed data
// so impressions/clicks can be logged and analyzed per-genre. `url` points
// at each brand's real public homepage, just so "Learn more" leads
// somewhere real instead of a dead link.
export const AD_CAMPAIGNS: AdCampaignInterface[] = [
  {
    id: "redbull-edm",
    brand: "Red Bull",
    tagline: "Fuel your next drop.",
    description:
      "Energy for the night. New limited-edition cans, now in stores.",
    url: "https://www.redbull.com",
    genres: [
      "edm",
      "dance",
      "house",
      "deep-house",
      "chicago-house",
      "electro",
      "club",
      "hardstyle",
      "garage",
    ],
  },
  {
    id: "nike-hiphop",
    brand: "Nike",
    tagline: "Just move.",
    description: "New drops every week. Free shipping on your first order.",
    url: "https://www.nike.com",
    genres: ["hip-hop", "funk", "soul"],
  },
  {
    id: "harley-rock",
    brand: "Harley-Davidson",
    tagline: "Ride loud.",
    description: "Book a test ride at your nearest dealership this weekend.",
    url: "https://www.harley-davidson.com",
    genres: ["rock", "hard-rock", "alt-rock", "punk", "garage", "psych-rock"],
  },
  {
    id: "monster-metal",
    brand: "Monster Energy",
    tagline: "Unleash the beast.",
    description: "Zero sugar, full power. Grab a can before the next set.",
    url: "https://www.monsterenergy.com",
    genres: ["metal", "hardcore", "emo"],
  },
  {
    id: "calm-app",
    brand: "Calm",
    tagline: "Breathe. Relax. Repeat.",
    description: "Sleep stories, guided meditation, and calming music.",
    url: "https://www.calm.com",
    genres: ["ambient", "chill", "sleep", "piano", "acoustic", "sad"],
  },
  {
    id: "steinway-classical",
    brand: "Steinway & Sons",
    tagline: "Timeless sound, timeless craft.",
    description: "Handcrafted pianos, played by the world's greatest artists.",
    url: "https://www.steinway.com",
    genres: ["classical", "jazz", "show-tunes", "singer-songwriter"],
  },
  {
    id: "corona-latin",
    brand: "Corona",
    tagline: "Find your beach.",
    description: "Pair it with good friends, good music, and the sunset.",
    url: "https://www.corona.com",
    genres: ["spanish", "forro", "sertanejo", "french"],
  },
  {
    id: "samsung-kpop",
    brand: "Samsung",
    tagline: "The next big thing.",
    description: "Pre-order the newest Galaxy and get a free upgrade.",
    url: "https://www.samsung.com",
    genres: ["k-pop", "cantopop", "pop", "pop-film", "indie-pop"],
  },
  {
    id: "wrangler-country",
    brand: "Wrangler",
    tagline: "Built for the open road.",
    description: "Denim that works as hard as you do. Shop the new season.",
    url: "https://www.wrangler.com",
    genres: ["country", "folk", "blues", "gospel"],
  },
  {
    id: "netflix-comedy",
    brand: "Netflix",
    tagline: "Laugh out loud tonight.",
    description: "New comedy specials added this week. Cancel anytime.",
    url: "https://www.netflix.com",
    genres: ["comedy", "disco", "german", "indian"],
  },
  {
    id: "spotify-generic",
    brand: "Spotify Premium",
    tagline: "Go ad-free.",
    description: "No interruptions, offline listening, and higher quality audio.",
    url: "https://www.spotify.com/premium",
    genres: [],
  },
];

export const getAdCampaignForGenre = (
  genre?: string
): AdCampaignInterface => {
  const matches = genre
    ? AD_CAMPAIGNS.filter((campaign) => campaign.genres.includes(genre))
    : [];

  const pool = matches.length
    ? matches
    : AD_CAMPAIGNS.filter((campaign) => campaign.genres.length === 0);

  return pool[Math.floor(Math.random() * pool.length)];
};

export const getRandomAdCampaign = (): AdCampaignInterface =>
  AD_CAMPAIGNS[Math.floor(Math.random() * AD_CAMPAIGNS.length)];

export const getAdCampaignById = (
  campaignId: string
): AdCampaignInterface | undefined => {
  return AD_CAMPAIGNS.find((campaign) => campaign.id === campaignId);
};
