import { prisma } from "../lib/prisma"
import { DayOfWeek } from "../generated/prisma/index"

const categories = ["Skincare", "Laser", "Injectables", "Body Contouring"]

const services = [
  {
    category: "Skincare",
    name: "HydraFacial",
    description: "Deeply cleansing, hydrating facial with exfoliation and serums.",
    price: 120.0,
    durationMinutes: 60,
  },
  {
    category: "Skincare",
    name: "Microneedling Therapy",
    description: "Collagen-induction treatment for texture and fine lines.",
    price: 180.0,
    durationMinutes: 75,
  },
  {
    category: "Laser",
    name: "Laser Hair Removal",
    description: "Permanent hair reduction for face and body.",
    price: 150.0,
    durationMinutes: 90,
  },
  {
    category: "Laser",
    name: "IPL Photo Rejuvenation",
    description: "Reduces pigmentation, redness, and sun damage.",
    price: 200.0,
    durationMinutes: 60,
  },
  {
    category: "Injectables",
    name: "Botox",
    description: "Wrinkle-relaxing injections for expression lines.",
    price: 250.0,
    durationMinutes: 30,
  },
  {
    category: "Injectables",
    name: "Dermal Fillers",
    description: "Restores volume and contours to cheeks and lips.",
    price: 320.0,
    durationMinutes: 45,
  },
  {
    category: "Body Contouring",
    name: "Non-Surgical Fat Reduction",
    description: "Body sculpting without incisions or downtime.",
    price: 280.0,
    durationMinutes: 60,
  },
  {
    category: "Body Contouring",
    name: "Cellulite Reduction",
    description: "Smoothing treatment for dimpled skin.",
    price: 160.0,
    durationMinutes: 45,
  },
]

const weeklyHours = [
  { dayOfWeek: DayOfWeek.MONDAY, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: DayOfWeek.TUESDAY, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: DayOfWeek.THURSDAY, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: DayOfWeek.FRIDAY, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: DayOfWeek.SATURDAY, startTime: "10:00", endTime: "14:00" },
]

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  for (const s of services) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { name: s.category },
    })
    const exists = await prisma.service.findFirst({
      where: { name: s.name, categoryId: category.id },
    })
    if (!exists) {
      await prisma.service.create({
        data: {
          name: s.name,
          description: s.description,
          price: s.price,
          durationMinutes: s.durationMinutes,
          beforeAfterImages: [],
          categoryId: category.id,
        },
      })
    }
  }

  for (const slot of weeklyHours) {
    const { dayOfWeek, startTime, endTime } = slot
    await prisma.availability.upsert({
      where: { dayOfWeek_startTime_endTime: { dayOfWeek, startTime, endTime } },
      update: {},
      create: slot,
    })
  }

  const [categoryCount, serviceCount, availabilityCount] = await Promise.all([
    prisma.category.count(),
    prisma.service.count(),
    prisma.availability.count(),
  ])

  console.log(
    `Seeded: ${categoryCount} categories, ${serviceCount} services, ${availabilityCount} availability slots`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })