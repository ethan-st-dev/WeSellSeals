export type ProductCategory = 
  | "seals"
  | "sci-fi"
  | "pirates"
  | "fantasy"
  | "vehicles"
  | "architecture"
  | "animals"
  | "characters";

export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  shortDescription: string;
  longDescription?: string;
  modelUrl?: string; // optional 3D model URL (GLB)
  category: ProductCategory;
  subcategory?: string;
  tags: string[];
};

export const products: Product[] = [
  // Seals (from existing seals data)
  {
    id: "seal-1",
    title: "Harbor Seal Classic",
    price: 9.99,
    image: "/seal-logo2.png",
    shortDescription: "A compact, adorable harbor seal figure ideal for displays.",
    longDescription: "This classic seal model is printed in high detail and is suitable for collectors and display use. Measures 3 inches long.",
    category: "seals",
    subcategory: "harbor",
    tags: ["classic", "small", "beginner-friendly", "marine"],
  },
  {
    id: "seal-2",
    title: "Playful Pup Seal",
    price: 12.5,
    image: "https://picsum.photos/seed/playful-seal/800/600",
    shortDescription: "Energetic pose, perfect for gifts and kids.",
    longDescription: "Smooth, durable finish with playful pose; great as a present.",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    category: "seals",
    subcategory: "harbor",
    tags: ["playful", "gift", "kids", "marine"],
  },
  {
    id: "seal-3",
    title: "Elephant Seal Giant",
    price: 32.99,
    image: "https://picsum.photos/seed/n-elephant/800/600",
    shortDescription: "Massive male with distinctive trunk-like proboscis.",
    category: "seals",
    subcategory: "elephant",
    tags: ["large", "proboscis", "marine", "collector"],
  },
  {
    id: "seal-4",
    title: "Leopard Seal Hunter",
    price: 29.99,
    image: "https://picsum.photos/seed/leopard-seal/800/600",
    shortDescription: "Fierce predator with spotted coat pattern.",
    category: "seals",
    subcategory: "leopard",
    tags: ["antarctic", "predator", "spotted", "marine"],
  },

  // Sci-Fi Models
  {
    id: "scifi-1",
    title: "Starfighter X-Wing",
    price: 24.99,
    image: "https://picsum.photos/seed/xwing/800/600",
    shortDescription: "Classic space superiority fighter with iconic design.",
    longDescription: "Detailed model of the legendary starfighter, perfect for sci-fi collections.",
    category: "sci-fi",
    subcategory: "spacecraft",
    tags: ["spaceship", "fighter", "detailed", "iconic"],
  },
  {
    id: "scifi-2",
    title: "Cyberpunk Drone",
    price: 18.99,
    image: "https://picsum.photos/seed/cyberdrone/800/600",
    shortDescription: "Futuristic surveillance drone with neon accents.",
    category: "sci-fi",
    subcategory: "drones",
    tags: ["cyberpunk", "futuristic", "neon", "tech"],
  },
  {
    id: "scifi-3",
    title: "Space Marine Warrior",
    price: 21.99,
    image: "https://picsum.photos/seed/spacemarine/800/600",
    shortDescription: "Armored soldier in powered exosuit.",
    category: "sci-fi",
    subcategory: "characters",
    tags: ["warrior", "armor", "soldier", "heroic"],
  },
  {
    id: "scifi-4",
    title: "Alien Creature",
    price: 19.99,
    image: "https://picsum.photos/seed/alien-creature/800/600",
    shortDescription: "Mysterious extraterrestrial life form.",
    category: "sci-fi",
    subcategory: "creatures",
    tags: ["alien", "creature", "mysterious", "unique"],
  },
  {
    id: "scifi-5",
    title: "Robot Companion",
    price: 16.99,
    image: "https://picsum.photos/seed/robot-friend/800/600",
    shortDescription: "Friendly service robot with expressive design.",
    modelUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    category: "sci-fi",
    subcategory: "robots",
    tags: ["robot", "friendly", "companion", "cute"],
  },
  {
    id: "scifi-6",
    title: "Spaceship Command Bridge",
    price: 39.99,
    image: "https://picsum.photos/seed/bridge/800/600",
    shortDescription: "Detailed starship command center diorama.",
    category: "sci-fi",
    subcategory: "environments",
    tags: ["spaceship", "interior", "diorama", "detailed"],
  },
  {
    id: "scifi-7",
    title: "Laser Blaster Pistol",
    price: 14.99,
    image: "https://picsum.photos/seed/blaster/800/600",
    shortDescription: "Iconic energy weapon replica.",
    category: "sci-fi",
    subcategory: "weapons",
    tags: ["weapon", "blaster", "prop", "replica"],
  },
  {
    id: "scifi-8",
    title: "Mech Warrior Suit",
    price: 44.99,
    image: "https://picsum.photos/seed/mech-suit/800/600",
    shortDescription: "Giant piloted robot with heavy armaments.",
    category: "sci-fi",
    subcategory: "mechs",
    tags: ["mech", "robot", "large", "detailed"],
  },

  // Pirates
  {
    id: "pirate-1",
    title: "Pirate Captain",
    price: 17.99,
    image: "https://picsum.photos/seed/pirate-captain/800/600",
    shortDescription: "Swashbuckling captain with tricorn hat and cutlass.",
    category: "pirates",
    subcategory: "characters",
    tags: ["captain", "character", "detailed", "historical"],
  },
  {
    id: "pirate-2",
    title: "Galleon Ship Model",
    price: 49.99,
    image: "https://picsum.photos/seed/galleon/800/600",
    shortDescription: "Majestic pirate ship with full rigging.",
    longDescription: "Highly detailed sailing ship model with intricate rigging and cannons.",
    category: "pirates",
    subcategory: "ships",
    tags: ["ship", "galleon", "detailed", "large"],
  },
  {
    id: "pirate-3",
    title: "Treasure Chest",
    price: 12.99,
    image: "https://picsum.photos/seed/treasure/800/600",
    shortDescription: "Overflowing chest filled with gold and jewels.",
    category: "pirates",
    subcategory: "props",
    tags: ["treasure", "gold", "prop", "diorama"],
  },
  {
    id: "pirate-4",
    title: "Skull & Crossbones Flag",
    price: 8.99,
    image: "https://picsum.photos/seed/jolly-roger/800/600",
    shortDescription: "Classic Jolly Roger pirate flag.",
    category: "pirates",
    subcategory: "props",
    tags: ["flag", "jolly-roger", "iconic", "small"],
  },
  {
    id: "pirate-5",
    title: "Pirate Crew Set",
    price: 34.99,
    image: "https://picsum.photos/seed/pirate-crew/800/600",
    shortDescription: "Five unique pirate characters in various poses.",
    category: "pirates",
    subcategory: "characters",
    tags: ["crew", "multiple", "characters", "set"],
  },
  {
    id: "pirate-6",
    title: "Cannon & Cannonballs",
    price: 15.99,
    image: "https://picsum.photos/seed/cannon/800/600",
    shortDescription: "Naval cannon with ammunition stack.",
    category: "pirates",
    subcategory: "weapons",
    tags: ["cannon", "weapon", "naval", "prop"],
  },
  {
    id: "pirate-7",
    title: "Tropical Island Diorama",
    price: 29.99,
    image: "https://picsum.photos/seed/island/800/600",
    shortDescription: "Desert island scene with palm trees and beach.",
    category: "pirates",
    subcategory: "environments",
    tags: ["island", "diorama", "tropical", "scenery"],
  },
  {
    id: "pirate-8",
    title: "Kraken Sea Monster",
    price: 38.99,
    image: "https://picsum.photos/seed/kraken/800/600",
    shortDescription: "Giant tentacled beast emerging from waves.",
    category: "pirates",
    subcategory: "creatures",
    tags: ["kraken", "monster", "tentacles", "mythical"],
  },

  // Fantasy
  {
    id: "fantasy-1",
    title: "Dragon Wyrmling",
    price: 26.99,
    image: "https://picsum.photos/seed/baby-dragon/800/600",
    shortDescription: "Young dragon with detailed scales and wings.",
    category: "fantasy",
    subcategory: "creatures",
    tags: ["dragon", "creature", "detailed", "mythical"],
  },
  {
    id: "fantasy-2",
    title: "Elven Archer",
    price: 19.99,
    image: "https://picsum.photos/seed/elf-archer/800/600",
    shortDescription: "Graceful elf warrior with bow and arrow.",
    category: "fantasy",
    subcategory: "characters",
    tags: ["elf", "archer", "warrior", "character"],
  },
  {
    id: "fantasy-3",
    title: "Wizard Tower",
    price: 35.99,
    image: "https://picsum.photos/seed/wizard-tower/800/600",
    shortDescription: "Mystical tower with glowing windows.",
    category: "fantasy",
    subcategory: "buildings",
    tags: ["tower", "building", "magical", "detailed"],
  },
  {
    id: "fantasy-4",
    title: "Dwarf Warrior",
    price: 18.99,
    image: "https://picsum.photos/seed/dwarf/800/600",
    shortDescription: "Stout warrior with battleaxe and armor.",
    category: "fantasy",
    subcategory: "characters",
    tags: ["dwarf", "warrior", "armor", "character"],
  },
  {
    id: "fantasy-5",
    title: "Unicorn Mystical",
    price: 22.99,
    image: "https://picsum.photos/seed/unicorn/800/600",
    shortDescription: "Majestic unicorn in rearing pose.",
    category: "fantasy",
    subcategory: "creatures",
    tags: ["unicorn", "magical", "creature", "elegant"],
  },
  {
    id: "fantasy-6",
    title: "Goblin Horde",
    price: 27.99,
    image: "https://picsum.photos/seed/goblins/800/600",
    shortDescription: "Pack of mischievous goblins.",
    category: "fantasy",
    subcategory: "creatures",
    tags: ["goblin", "multiple", "creature", "horde"],
  },

  // Vehicles
  {
    id: "vehicle-1",
    title: "Classic Muscle Car",
    price: 28.99,
    image: "https://picsum.photos/seed/muscle-car/800/600",
    shortDescription: "1970s American muscle car with racing stripes.",
    category: "vehicles",
    subcategory: "cars",
    tags: ["car", "classic", "muscle", "vintage"],
  },
  {
    id: "vehicle-2",
    title: "Military Tank",
    price: 32.99,
    image: "https://picsum.photos/seed/tank/800/600",
    shortDescription: "Modern battle tank with detailed treads.",
    category: "vehicles",
    subcategory: "military",
    tags: ["tank", "military", "armored", "detailed"],
  },
  {
    id: "vehicle-3",
    title: "Fighter Jet",
    price: 34.99,
    image: "https://picsum.photos/seed/fighter-jet/800/600",
    shortDescription: "Modern air superiority fighter.",
    category: "vehicles",
    subcategory: "aircraft",
    tags: ["jet", "fighter", "aircraft", "military"],
  },
  {
    id: "vehicle-4",
    title: "Motorcycle Chopper",
    price: 21.99,
    image: "https://picsum.photos/seed/chopper/800/600",
    shortDescription: "Custom chopper with extended forks.",
    category: "vehicles",
    subcategory: "motorcycles",
    tags: ["motorcycle", "chopper", "custom", "cool"],
  },

  // Architecture
  {
    id: "arch-1",
    title: "Gothic Cathedral",
    price: 45.99,
    image: "https://picsum.photos/seed/cathedral/800/600",
    shortDescription: "Ornate medieval cathedral with spires.",
    category: "architecture",
    subcategory: "historical",
    tags: ["cathedral", "gothic", "detailed", "large"],
  },
  {
    id: "arch-2",
    title: "Modern Skyscraper",
    price: 38.99,
    image: "https://picsum.photos/seed/skyscraper/800/600",
    shortDescription: "Contemporary glass and steel tower.",
    category: "architecture",
    subcategory: "modern",
    tags: ["skyscraper", "modern", "building", "urban"],
  },
  {
    id: "arch-3",
    title: "Japanese Temple",
    price: 41.99,
    image: "https://picsum.photos/seed/temple/800/600",
    shortDescription: "Traditional pagoda-style temple.",
    category: "architecture",
    subcategory: "cultural",
    tags: ["temple", "japanese", "traditional", "cultural"],
  },

  // Animals
  {
    id: "animal-1",
    title: "Lion Pride Leader",
    price: 23.99,
    image: "https://picsum.photos/seed/lion/800/600",
    shortDescription: "Majestic lion with flowing mane.",
    category: "animals",
    subcategory: "wildlife",
    tags: ["lion", "wildlife", "majestic", "africa"],
  },
  {
    id: "animal-2",
    title: "Eagle Soaring",
    price: 19.99,
    image: "https://picsum.photos/seed/eagle/800/600",
    shortDescription: "Eagle in flight with spread wings.",
    category: "animals",
    subcategory: "birds",
    tags: ["eagle", "bird", "flight", "majestic"],
  },
  {
    id: "animal-3",
    title: "Elephant Family",
    price: 31.99,
    image: "https://picsum.photos/seed/elephants/800/600",
    shortDescription: "Elephant herd with baby.",
    category: "animals",
    subcategory: "wildlife",
    tags: ["elephant", "family", "wildlife", "africa"],
  },
  {
    id: "animal-4",
    title: "Wolf Pack",
    price: 29.99,
    image: "https://picsum.photos/seed/wolves/800/600",
    shortDescription: "Three wolves in hunting formation.",
    category: "animals",
    subcategory: "wildlife",
    tags: ["wolf", "pack", "wildlife", "predator"],
  },

  // Characters
  {
    id: "char-1",
    title: "Astronaut Explorer",
    price: 24.99,
    image: "https://picsum.photos/seed/astronaut-hero/800/600",
    shortDescription: "Space explorer in detailed EVA suit.",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    category: "characters",
    subcategory: "sci-fi",
    tags: ["astronaut", "space", "explorer", "hero"],
  },
  {
    id: "char-2",
    title: "Ninja Assassin",
    price: 20.99,
    image: "https://picsum.photos/seed/ninja/800/600",
    shortDescription: "Stealthy ninja in action pose.",
    category: "characters",
    subcategory: "historical",
    tags: ["ninja", "warrior", "stealth", "japanese"],
  },
  {
    id: "char-3",
    title: "Knight in Armor",
    price: 25.99,
    image: "https://picsum.photos/seed/knight/800/600",
    shortDescription: "Medieval knight in full plate armor.",
    category: "characters",
    subcategory: "historical",
    tags: ["knight", "armor", "medieval", "warrior"],
  },
];

export const categoryInfo = {
  seals: { 
    name: "Seals", 
    description: "Adorable marine mammals in various species and poses",
    icon: "🦭"
  },
  "sci-fi": { 
    name: "Sci-Fi", 
    description: "Futuristic spacecraft, robots, and alien creatures",
    icon: "🚀"
  },
  pirates: { 
    name: "Pirates", 
    description: "Swashbuckling adventures on the high seas",
    icon: "🏴‍☠️"
  },
  fantasy: { 
    name: "Fantasy", 
    description: "Dragons, wizards, and magical creatures",
    icon: "🐉"
  },
  vehicles: { 
    name: "Vehicles", 
    description: "Cars, tanks, aircraft, and more",
    icon: "🚗"
  },
  architecture: { 
    name: "Architecture", 
    description: "Buildings and structures from various eras",
    icon: "🏛️"
  },
  animals: { 
    name: "Animals", 
    description: "Wildlife and creatures from around the world",
    icon: "🦁"
  },
  characters: { 
    name: "Characters", 
    description: "Heroes, warriors, and unique personas",
    icon: "🦸"
  },
} as const;

export function getProductsByCategory(category: ProductCategory) {
  return products.filter(p => p.category === category);
}

export function searchProducts(query: string, category?: ProductCategory) {
  const lowerQuery = query.toLowerCase();
  let filtered = products;
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  return filtered.filter(p =>
    p.title.toLowerCase().includes(lowerQuery) ||
    p.shortDescription.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    (p.subcategory && p.subcategory.toLowerCase().includes(lowerQuery))
  );
}
