export type SealCategory = 
  | "harbor"
  | "grey"
  | "elephant"
  | "leopard"
  | "monk"
  | "fur"
  | "hooded"
  | "weddell"
  | "ringed";

export type Seal = {
  id: string;
  title: string;
  price: number;
  image: string;
  shortDescription: string;
  longDescription?: string;
  modelUrl?: string; // optional 3D model URL (GLB)
  category: SealCategory;
  tags: string[];
};

export const seals: Seal[] = [
  // Harbor Seals
  {
    id: "1",
    title: "Harbor Seal Classic",
    price: 9.99,
    image: "/seal-logo2.png",
    shortDescription: "A compact, adorable harbor seal figure ideal for displays.",
    longDescription:
      "This classic seal model is printed in high detail and is suitable for collectors and display use. Measures 3 inches long.",
    category: "harbor",
    tags: ["classic", "small", "beginner-friendly"],
  },
  {
    id: "2",
    title: "Playful Pup Seal",
    price: 12.5,
    image: "https://picsum.photos/seed/playful-seal/800/600",
    shortDescription: "Energetic pose, perfect for gifts and kids.",
    longDescription: "Smooth, durable finish with playful pose; great as a present.",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    category: "harbor",
    tags: ["playful", "gift", "kids"],
  },
  {
    id: "4",
    title: "Swimming Harbor Seal",
    price: 11.5,
    image: "https://picsum.photos/seed/swimming-seal/800/600",
    shortDescription: "Dynamic swimming pose, great for coastal displays.",
    category: "harbor",
    tags: ["swimming", "dynamic", "coastal"],
  },
  {
    id: "5",
    title: "Harbor Seal with Fish",
    price: 13.25,
    image: "https://picsum.photos/seed/seal-fish/800/600",
    shortDescription: "Cute seal clutching a fish — whimsical and fun.",
    category: "harbor",
    tags: ["fish", "whimsical", "nature"],
  },
  {
    id: "6",
    title: "Tiny Harbor Seal Buddy",
    price: 8.5,
    image: "https://picsum.photos/seed/tiny-seal/800/600",
    shortDescription: "Small footprint model perfect for shelves.",
    category: "harbor",
    tags: ["tiny", "compact", "shelf-friendly"],
  },
  {
    id: "7",
    title: "Sitting Harbor Seal",
    price: 10.0,
    image: "https://picsum.photos/seed/sitting-seal/800/600",
    shortDescription: "Classic sitting pose with charismatic expression.",
    category: "harbor",
    tags: ["sitting", "classic", "expressive"],
  },
  {
    id: "8",
    title: "Curious Harbor Pup",
    price: 15.0,
    image: "https://picsum.photos/seed/curious-pup/800/600",
    shortDescription: "Large detailed model suitable for collectors.",
    modelUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    category: "harbor",
    tags: ["curious", "detailed", "collector"],
  },
  {
    id: "13",
    title: "Harbor Seal Family",
    price: 22.99,
    image: "https://picsum.photos/seed/harbor-family/800/600",
    shortDescription: "Mother seal with two pups, heartwarming scene.",
    category: "harbor",
    tags: ["family", "multiple", "heartwarming"],
  },
  {
    id: "14",
    title: "Basking Harbor Seal",
    price: 14.5,
    image: "https://picsum.photos/seed/basking-harbor/800/600",
    shortDescription: "Seal lounging on rocks, perfect for relaxation theme.",
    category: "harbor",
    tags: ["basking", "relaxed", "rocks"],
  },

  // Grey Seals
  {
    id: "3",
    title: "Regal Grey Seal",
    price: 14.0,
    image: "https://picsum.photos/seed/regal-seal/800/600",
    shortDescription: "Elegant standing seal with finely sculpted features.",
    longDescription:
      "Our premium sculpt of a grey seal emphasizes detail and balance — a top pick for enthusiasts.",
    category: "grey",
    tags: ["regal", "elegant", "premium"],
  },
  {
    id: "15",
    title: "Atlantic Grey Seal",
    price: 16.99,
    image: "https://picsum.photos/seed/atlantic-grey/800/600",
    shortDescription: "Majestic grey seal with distinctive Roman nose.",
    category: "grey",
    tags: ["atlantic", "majestic", "distinctive"],
  },
  {
    id: "16",
    title: "Bull Grey Seal",
    price: 24.99,
    image: "https://picsum.photos/seed/bull-grey/800/600",
    shortDescription: "Large male grey seal with powerful build.",
    category: "grey",
    tags: ["bull", "large", "powerful"],
  },
  {
    id: "17",
    title: "Grey Seal Diving",
    price: 18.5,
    image: "https://picsum.photos/seed/grey-diving/800/600",
    shortDescription: "Graceful diving pose capturing underwater elegance.",
    category: "grey",
    tags: ["diving", "underwater", "graceful"],
  },
  {
    id: "18",
    title: "Grey Seal Pair",
    price: 27.99,
    image: "https://picsum.photos/seed/grey-pair/800/600",
    shortDescription: "Two grey seals in social interaction.",
    category: "grey",
    tags: ["pair", "social", "interaction"],
  },

  // Elephant Seals
  {
    id: "19",
    title: "Northern Elephant Seal",
    price: 32.99,
    image: "https://picsum.photos/seed/n-elephant/800/600",
    shortDescription: "Massive male with distinctive trunk-like proboscis.",
    category: "elephant",
    tags: ["northern", "massive", "proboscis"],
  },
  {
    id: "20",
    title: "Southern Elephant Seal",
    price: 35.99,
    image: "https://picsum.photos/seed/s-elephant/800/600",
    shortDescription: "World's largest seal species in stunning detail.",
    category: "elephant",
    tags: ["southern", "largest", "impressive"],
  },
  {
    id: "21",
    title: "Elephant Seal Beachmaster",
    price: 45.0,
    image: "https://picsum.photos/seed/beachmaster/800/600",
    shortDescription: "Dominant male in commanding pose, premium piece.",
    category: "elephant",
    tags: ["beachmaster", "dominant", "premium"],
  },
  {
    id: "22",
    title: "Elephant Seal Pup",
    price: 19.99,
    image: "https://picsum.photos/seed/elephant-pup/800/600",
    shortDescription: "Adorable elephant seal pup with signature nose.",
    category: "elephant",
    tags: ["pup", "adorable", "young"],
  },
  {
    id: "23",
    title: "Molting Elephant Seal",
    price: 28.99,
    image: "https://picsum.photos/seed/molting-elephant/800/600",
    shortDescription: "Realistic molting phase with textured details.",
    category: "elephant",
    tags: ["molting", "realistic", "textured"],
  },

  // Leopard Seals
  {
    id: "24",
    title: "Antarctic Leopard Seal",
    price: 29.99,
    image: "https://picsum.photos/seed/leopard-seal/800/600",
    shortDescription: "Fierce predator with spotted coat pattern.",
    category: "leopard",
    tags: ["antarctic", "predator", "spotted"],
  },
  {
    id: "25",
    title: "Hunting Leopard Seal",
    price: 34.5,
    image: "https://picsum.photos/seed/hunting-leopard/800/600",
    shortDescription: "Dynamic hunting pose with open jaw display.",
    category: "leopard",
    tags: ["hunting", "dynamic", "fierce"],
  },
  {
    id: "26",
    title: "Leopard Seal on Ice",
    price: 31.99,
    image: "https://picsum.photos/seed/leopard-ice/800/600",
    shortDescription: "Resting on ice floe, Antarctic scene.",
    category: "leopard",
    tags: ["ice", "antarctic", "resting"],
  },
  {
    id: "27",
    title: "Juvenile Leopard Seal",
    price: 25.99,
    image: "https://picsum.photos/seed/young-leopard/800/600",
    shortDescription: "Young leopard seal with curious expression.",
    category: "leopard",
    tags: ["juvenile", "curious", "young"],
  },

  // Monk Seals
  {
    id: "28",
    title: "Hawaiian Monk Seal",
    price: 26.99,
    image: "https://picsum.photos/seed/hawaiian-monk/800/600",
    shortDescription: "Rare Hawaiian monk seal, conservation piece.",
    category: "monk",
    tags: ["hawaiian", "rare", "conservation"],
  },
  {
    id: "29",
    title: "Mediterranean Monk Seal",
    price: 28.5,
    image: "https://picsum.photos/seed/med-monk/800/600",
    shortDescription: "Critically endangered Mediterranean species.",
    category: "monk",
    tags: ["mediterranean", "endangered", "rare"],
  },
  {
    id: "30",
    title: "Monk Seal Basking",
    price: 24.99,
    image: "https://picsum.photos/seed/monk-basking/800/600",
    shortDescription: "Peaceful beach-basking pose.",
    category: "monk",
    tags: ["basking", "peaceful", "beach"],
  },
  {
    id: "31",
    title: "Monk Seal Mother & Pup",
    price: 38.99,
    image: "https://picsum.photos/seed/monk-mother/800/600",
    shortDescription: "Tender moment between mother and pup.",
    category: "monk",
    tags: ["mother", "pup", "tender"],
  },

  // Fur Seals
  {
    id: "32",
    title: "Northern Fur Seal",
    price: 21.99,
    image: "https://picsum.photos/seed/n-fur-seal/800/600",
    shortDescription: "Fluffy fur seal with distinctive ears.",
    category: "fur",
    tags: ["northern", "fluffy", "ears"],
  },
  {
    id: "33",
    title: "Antarctic Fur Seal",
    price: 23.5,
    image: "https://picsum.photos/seed/antarctic-fur/800/600",
    shortDescription: "Thick-coated Antarctic fur seal.",
    category: "fur",
    tags: ["antarctic", "thick-coat", "cold"],
  },
  {
    id: "34",
    title: "Cape Fur Seal",
    price: 22.99,
    image: "https://picsum.photos/seed/cape-fur/800/600",
    shortDescription: "African cape fur seal in dynamic pose.",
    category: "fur",
    tags: ["cape", "african", "dynamic"],
  },
  {
    id: "35",
    title: "Galápagos Fur Seal",
    price: 24.5,
    image: "https://picsum.photos/seed/galapagos-fur/800/600",
    shortDescription: "Unique Galápagos species, compact build.",
    category: "fur",
    tags: ["galapagos", "unique", "compact"],
  },
  {
    id: "36",
    title: "Fur Seal Colony",
    price: 42.99,
    image: "https://picsum.photos/seed/fur-colony/800/600",
    shortDescription: "Multiple fur seals in social grouping.",
    category: "fur",
    tags: ["colony", "social", "multiple"],
  },

  // Hooded Seals
  {
    id: "37",
    title: "Hooded Seal Display",
    price: 33.99,
    image: "https://picsum.photos/seed/hooded-display/800/600",
    shortDescription: "Male with inflated nasal bladder display.",
    category: "hooded",
    tags: ["display", "bladder", "unique"],
  },
  {
    id: "38",
    title: "Hooded Seal Female",
    price: 25.99,
    image: "https://picsum.photos/seed/hooded-female/800/600",
    shortDescription: "Sleek female hooded seal.",
    category: "hooded",
    tags: ["female", "sleek", "graceful"],
  },
  {
    id: "39",
    title: "Hooded Seal Pup",
    price: 21.99,
    image: "https://picsum.photos/seed/hooded-pup/800/600",
    shortDescription: "Blueback pup with distinctive coloring.",
    category: "hooded",
    tags: ["pup", "blueback", "young"],
  },

  // Weddell Seals
  {
    id: "40",
    title: "Weddell Seal Antarctic",
    price: 27.99,
    image: "https://picsum.photos/seed/weddell-antarctic/800/600",
    shortDescription: "Southern-most mammal, under-ice specialist.",
    category: "weddell",
    tags: ["antarctic", "under-ice", "specialist"],
  },
  {
    id: "41",
    title: "Weddell Seal Singing",
    price: 30.99,
    image: "https://picsum.photos/seed/weddell-singing/800/600",
    shortDescription: "Unique pose capturing underwater vocalizations.",
    category: "weddell",
    tags: ["singing", "vocalization", "unique"],
  },
  {
    id: "42",
    title: "Weddell Seal with Pup",
    price: 36.99,
    image: "https://picsum.photos/seed/weddell-pup/800/600",
    shortDescription: "Mother with newborn pup on ice.",
    category: "weddell",
    tags: ["mother", "pup", "ice"],
  },

  // Ringed Seals
  {
    id: "43",
    title: "Ringed Seal Arctic",
    price: 20.99,
    image: "https://picsum.photos/seed/ringed-arctic/800/600",
    shortDescription: "Small Arctic seal with ring pattern.",
    category: "ringed",
    tags: ["arctic", "small", "patterned"],
  },
  {
    id: "44",
    title: "Ringed Seal in Snow Den",
    price: 24.99,
    image: "https://picsum.photos/seed/ringed-den/800/600",
    shortDescription: "Seal emerging from snow birthing den.",
    category: "ringed",
    tags: ["snow", "den", "arctic"],
  },
  {
    id: "45",
    title: "Ringed Seal Pup",
    price: 18.99,
    image: "https://picsum.photos/seed/ringed-pup/800/600",
    shortDescription: "Fluffy white-coated pup.",
    category: "ringed",
    tags: ["pup", "fluffy", "white"],
  },

  // Special Edition & Vintage
  {
    id: "9",
    title: "Vintage Seal Sculpture",
    price: 18.0,
    image: "https://picsum.photos/seed/vintage-seal/800/600",
    shortDescription: "Antique-style finish for a refined look.",
    category: "harbor",
    tags: ["vintage", "antique", "refined"],
  },
  {
    id: "10",
    title: "Playful Twins",
    price: 16.5,
    image: "https://picsum.photos/seed/playful-twins/800/600",
    shortDescription: "Two seals interacting in a playful scene.",
    category: "harbor",
    tags: ["twins", "playful", "interaction"],
  },
  {
    id: "11",
    title: "Minimalist Seal",
    price: 7.99,
    image: "https://picsum.photos/seed/minimal-seal/800/600",
    shortDescription: "Simple lines and forms for modern decor.",
    category: "harbor",
    tags: ["minimalist", "modern", "simple"],
  },
  {
    id: "12",
    title: "Giant Collector's Seal",
    price: 29.99,
    image: "https://picsum.photos/seed/giant-seal/800/600",
    shortDescription: "Large, detailed centerpiece model for collectors.",
    category: "grey",
    tags: ["giant", "collector", "centerpiece"],
  },
];

export const sealCategories = {
  harbor: { name: "Harbor Seals", description: "Common, friendly seals found in temperate coastal waters" },
  grey: { name: "Grey Seals", description: "Large seals with distinctive Roman noses" },
  elephant: { name: "Elephant Seals", description: "Massive seals with impressive proboscis" },
  leopard: { name: "Leopard Seals", description: "Fierce Antarctic predators with spotted coats" },
  monk: { name: "Monk Seals", description: "Rare tropical and subtropical seal species" },
  fur: { name: "Fur Seals", description: "Seals with external ears and thick fur coats" },
  hooded: { name: "Hooded Seals", description: "Unique seals with inflatable nasal sacs" },
  weddell: { name: "Weddell Seals", description: "Antarctic specialists living under ice" },
  ringed: { name: "Ringed Seals", description: "Small Arctic seals with distinctive ring patterns" },
} as const;
