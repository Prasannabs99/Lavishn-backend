import { Service } from "../models/Service.js";

const DEFAULT_SERVICES = [
  {
    slug: "general-consultation",
    title: "General Health Consultation",
    description: "One-on-one consultation with healthcare professionals for general health concerns, preventive care, and wellness advice.",
    durationMinutes: 30,
    priceInPaise: 0,
    isActive: true,
  },
  {
    slug: "health-checkup",
    title: "Health Checkup Package",
    description: "Comprehensive health assessment including vital signs, medical history review, and preventive health screening.",
    durationMinutes: 45,
    priceInPaise: 0,
    isActive: true,
  },
  {
    slug: "wellness-program",
    title: "Wellness Program",
    description: "Personalized wellness guidance including nutrition, fitness, stress management, and lifestyle optimization.",
    durationMinutes: 60,
    priceInPaise: 0,
    isActive: true,
  },
  {
    slug: "chronic-disease-management",
    title: "Chronic Disease Management",
    description: "Specialized care management for chronic conditions like diabetes, hypertension, asthma, and other ongoing health issues.",
    durationMinutes: 45,
    priceInPaise: 0,
    isActive: true,
  },
  {
    slug: "preventive-health",
    title: "Preventive Health Screening",
    description: "Proactive health assessments designed to detect potential health issues early and prevent future complications.",
    durationMinutes: 30,
    priceInPaise: 0,
    isActive: true,
  },
];

export async function seedServicesIfNeeded() {
  try {
    const count = await Service.countDocuments();
    if (count === 0) {
      await Service.insertMany(DEFAULT_SERVICES);
      console.log("✓ Services seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding services:", error.message);
  }
}
