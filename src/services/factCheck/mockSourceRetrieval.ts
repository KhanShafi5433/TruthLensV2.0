import { Source } from "./factCheckPipeline";

// Mock source database for testing
const MOCK_SOURCES: Record<string, { supporting: Source[]; contradicting: Source[] }> = {
  "earth is flat": {
    supporting: [
      {
        title: "Flat Earth Society",
        url: "https://flatearthsociety.org",
        reliability_score: 0.2,
        content: "The Earth is flat and stationary.",
      },
    ],
    contradicting: [
      {
        title: "NASA - Earth Science",
        url: "https://nasa.gov/earth",
        reliability_score: 0.95,
        content: "Earth is a sphere orbiting the Sun.",
      },
      {
        title: "Scientific American",
        url: "https://scientificamerican.com/earth-shape",
        reliability_score: 0.9,
        content: "Overwhelming evidence confirms Earth is spherical.",
      },
      {
        title: "National Geographic",
        url: "https://nationalgeographic.com/earth",
        reliability_score: 0.9,
        content: "Earth is an oblate spheroid.",
      },
    ],
  },
  "climate change is real": {
    supporting: [
      {
        title: "IPCC Climate Report",
        url: "https://ipcc.ch/report",
        reliability_score: 0.95,
        content: "Human activities have unequivocally caused warming of the atmosphere, ocean and land.",
      },
      {
        title: "NASA Climate Change",
        url: "https://climate.nasa.gov",
        reliability_score: 0.95,
        content: "Multiple lines of evidence show Earth's climate is changing.",
      },
      {
        title: "Nature Climate Change",
        url: "https://nature.com/nclimate",
        reliability_score: 0.9,
        content: "Consensus among climate scientists on anthropogenic climate change.",
      },
    ],
    contradicting: [
      {
        title: "Climate Skeptic Blog",
        url: "https://climateskeptic.com",
        reliability_score: 0.3,
        content: "Climate change is a hoax.",
      },
    ],
  },
  "vaccines cause autism": {
    supporting: [
      {
        title: "Anti-Vaccine Blog",
        url: "https://antivax.com",
        reliability_score: 0.2,
        content: "Vaccines are linked to autism.",
      },
    ],
    contradicting: [
      {
        title: "CDC - Vaccine Safety",
        url: "https://cdc.gov/vaccinesafety",
        reliability_score: 0.95,
        content: "No link between vaccines and autism has been found.",
      },
      {
        title: "WHO - Immunization",
        url: "https://who.int/immunization",
        reliability_score: 0.95,
        content: "Vaccines are safe and effective.",
      },
      {
        title: "The Lancet - Vaccine Study",
        url: "https://thelancet.com/vaccines",
        reliability_score: 0.9,
        content: "Extensive research shows no vaccine-autism connection.",
      },
    ],
  },
  "water boils at 100 degrees celsius": {
    supporting: [
      {
        title: "Physics Textbook",
        url: "https://physics.edu/boiling-point",
        reliability_score: 0.9,
        content: "Water boils at 100°C at standard atmospheric pressure.",
      },
      {
        title: "Chemistry Reference",
        url: "https://chemistry.org/water",
        reliability_score: 0.9,
        content: "Boiling point of water is 100°C at sea level.",
      },
    ],
    contradicting: [],
  },
};

// Mock source retrieval function
export async function mockRetrieveSources(claim: string): Promise<{ supporting: Source[]; contradicting: Source[] }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const normalizedClaim = claim.toLowerCase().trim();
  
  // Check if we have mock data for this claim
  for (const [key, value] of Object.entries(MOCK_SOURCES)) {
    if (normalizedClaim.includes(key) || key.includes(normalizedClaim)) {
      return value;
    }
  }
  
  // Return empty sources for unknown claims
  return {
    supporting: [],
    contradicting: [],
  };
}

// Add custom mock data for testing
export function addMockSource(claim: string, sources: { supporting: Source[]; contradicting: Source[] }): void {
  MOCK_SOURCES[claim.toLowerCase().trim()] = sources;
}

// Get all mock sources for debugging
export function getAllMockSources(): Record<string, { supporting: Source[]; contradicting: Source[] }> {
  return { ...MOCK_SOURCES };
}
