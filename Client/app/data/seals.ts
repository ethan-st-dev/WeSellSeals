export type Seal = {
  id: string;
  title: string;
  price: number;
  image: string;
  shortDescription: string;
  longDescription?: string;
  modelUrl?: string; // optional 3D model URL (GLB)
};

export const seals: Seal[] = [
  {
    id: "1",
    title: "Harbor Seal Classic",
    price: 9.99,
    image: "/seal-logo2.png",
    shortDescription: "A compact, adorable harbor seal figure ideal for displays.",
    longDescription:
      "This classic seal model is printed in high detail and is suitable for collectors and display use. Measures 3 inches long.",
  },
  {
    id: "2",
    title: "Playful Pup Seal",
    price: 12.5,
    image: "https://picsum.photos/seed/playful-seal/800/600",
    shortDescription: "Energetic pose, perfect for gifts and kids.",
    longDescription: "Smooth, durable finish with playful pose; great as a present.",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "3",
    title: "Regal Grey Seal",
    price: 14.0,
    image: "https://picsum.photos/seed/regal-seal/800/600",
    shortDescription: "Elegant standing seal with finely sculpted features.",
    longDescription:
      "Our premium sculpt of a grey seal emphasizes detail and balance — a top pick for enthusiasts.",
  },
  {
    id: "4",
    title: "Swimming Seal",
    price: 11.5,
    image: "https://picsum.photos/seed/swimming-seal/800/600",
    shortDescription: "Dynamic swimming pose, great for coastal displays.",
  },
  {
    id: "5",
    title: "Seal with Fish",
    price: 13.25,
    image: "https://picsum.photos/seed/seal-fish/800/600",
    shortDescription: "Cute seal clutching a fish — whimsical and fun.",
  },
  {
    id: "6",
    title: "Tiny Seal Buddy",
    price: 8.5,
    image: "https://picsum.photos/seed/tiny-seal/800/600",
    shortDescription: "Small footprint model perfect for shelves.",
  },
  {
    id: "7",
    title: "Sitting Seal",
    price: 10.0,
    image: "https://picsum.photos/seed/sitting-seal/800/600",
    shortDescription: "Classic sitting pose with charismatic expression.",
  },
  {
    id: "8",
    title: "Curious Pup",
    price: 15.0,
    image: "https://picsum.photos/seed/curious-pup/800/600",
    shortDescription: "Large detailed model suitable for collectors.",
    modelUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
  },
  {
    id: "9",
    title: "Vintage Seal Sculpture",
    price: 18.0,
    image: "https://picsum.photos/seed/vintage-seal/800/600",
    shortDescription: "Antique-style finish for a refined look.",
  },
  {
    id: "10",
    title: "Playful Twins",
    price: 16.5,
    image: "https://picsum.photos/seed/playful-twins/800/600",
    shortDescription: "Two seals interacting in a playful scene.",
  },
  {
    id: "11",
    title: "Minimalist Seal",
    price: 7.99,
    image: "https://picsum.photos/seed/minimal-seal/800/600",
    shortDescription: "Simple lines and forms for modern decor.",
  },
  {
    id: "12",
    title: "Giant Collector's Seal",
    price: 29.99,
    image: "https://picsum.photos/seed/giant-seal/800/600",
    shortDescription: "Large, detailed centerpiece model for collectors.",
  },
];
