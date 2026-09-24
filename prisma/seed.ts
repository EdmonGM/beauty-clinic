import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function main() {
  console.log("🌱 Seeding database...")

  try {
    // ============ USERS ============
    console.log("📝 Creating users...")

    // Create admin user via Better Auth
    let admin = await prisma.user.findUnique({
      where: { email: "admin@clinic.com" },
    })

    if (!admin) {
      await auth.api.signUpEmail({
        body: {
          email: "admin@clinic.com",
          password: "123123123",
          name: "Admin",
        },
      })
      admin = await prisma.user.findUnique({
        where: { email: "admin@clinic.com" },
      })
      // Update to admin role
      await prisma.user.update({
        where: { id: admin!.id },
        data: { role: "ADMIN", phone: "+1-555-0100", emailVerified: true },
      })
    }
    console.log(`✓ Admin created: ${admin!.email}`)

    // Create client user via Better Auth
    let client = await prisma.user.findUnique({
      where: { email: "client@example.com" },
    })

    if (!client) {
      await auth.api.signUpEmail({
        body: {
          email: "client@example.com",
          password: "123123123",
          name: "Emily Johnson",
        },
      })
      client = await prisma.user.findUnique({
        where: { email: "client@example.com" },
      })
      // Update to ensure CLIENT role and add phone
      await prisma.user.update({
        where: { id: client!.id },
        data: { phone: "+1-555-0101", emailVerified: true },
      })
    }
    console.log(`✓ Client created: ${client!.email}`)

    // ============ CATEGORIES ============
    console.log("📂 Creating categories...")

    const skincare = await prisma.category.upsert({
      where: { name: "Skincare & Facials" },
      update: {},
      create: {
        name: "Skincare & Facials",
        description:
          "Professional facial treatments and skin rejuvenation services",
      },
    })

    const laser = await prisma.category.upsert({
      where: { name: "Laser & Energy-Based" },
      update: {},
      create: {
        name: "Laser & Energy-Based",
        description:
          "Advanced laser treatments for skin resurfacing and hair removal",
      },
    })

    const injectables = await prisma.category.upsert({
      where: { name: "Injectables & Fillers" },
      update: {},
      create: {
        name: "Injectables & Fillers",
        description: "Anti-aging treatments including botox and dermal fillers",
      },
    })

    const bodyContouring = await prisma.category.upsert({
      where: { name: "Body Contouring" },
      update: {},
      create: {
        name: "Body Contouring",
        description: "Non-invasive body shaping and cellulite reduction",
      },
    })

    console.log(
      `✓ Categories created: ${[skincare.name, laser.name, injectables.name, bodyContouring.name].join(", ")}`
    )

    // ============ SERVICES ============
    console.log("🛎️  Creating services...")

    const services = [
      // Skincare & Facials
      {
        name: "HydraFacial Signature",
        description:
          "Hydradermabrasion facial with vortex-fusion technology for cleansed, hydrated skin",
        price: 150,
        durationMinutes: 60,
        categoryId: skincare.id,
        isActive: true,
      },
      {
        name: "Chemical Peel - Light",
        description:
          "Superficial chemical peel to improve skin texture and tone",
        price: 120,
        durationMinutes: 45,
        categoryId: skincare.id,
        isActive: true,
      },
      {
        name: "Chemical Peel - Medium",
        description:
          "Medium-depth peel for deeper exfoliation and sun damage repair",
        price: 200,
        durationMinutes: 60,
        categoryId: skincare.id,
        isActive: true,
      },
      {
        name: "Microneedling with RF",
        description:
          "Radiofrequency microneedling for collagen induction and skin tightening",
        price: 350,
        durationMinutes: 90,
        categoryId: skincare.id,
        isActive: true,
      },
      {
        name: "Custom European Facial",
        description:
          "Personalized facial with analysis, cleansing, extractions, and hydration",
        price: 100,
        durationMinutes: 60,
        categoryId: skincare.id,
        isActive: true,
      },
      {
        name: "Oxygen Facial",
        description:
          "Pressurized oxygen infused with serums for glowing, plump skin",
        price: 180,
        durationMinutes: 45,
        categoryId: skincare.id,
        isActive: true,
      },

      // Laser & Energy-Based
      {
        name: "Laser Hair Removal - Small Area",
        description:
          "Diode laser hair removal for face, underarms, or bikini line",
        price: 100,
        durationMinutes: 30,
        categoryId: laser.id,
        isActive: true,
      },
      {
        name: "Laser Hair Removal - Medium Area",
        description: "Diode laser hair removal for legs, back, or chest",
        price: 200,
        durationMinutes: 45,
        categoryId: laser.id,
        isActive: true,
      },
      {
        name: "Laser Hair Removal - Full Body",
        description:
          "Complete body diode laser hair removal (6-session package recommended)",
        price: 800,
        durationMinutes: 120,
        categoryId: laser.id,
        isActive: true,
      },
      {
        name: "IPL Photofacial",
        description:
          "Intense pulsed light treatment for sun damage, rosacea, and discoloration",
        price: 250,
        durationMinutes: 60,
        categoryId: laser.id,
        isActive: true,
      },
      {
        name: "Laser Skin Resurfacing",
        description:
          "Fractional CO2 laser for wrinkles, scars, and skin tightening",
        price: 500,
        durationMinutes: 90,
        categoryId: laser.id,
        isActive: true,
      },
      {
        name: "Tattoo Removal Consultation + Session",
        description: "Q-switched laser removal for unwanted tattoos",
        price: 300,
        durationMinutes: 60,
        categoryId: laser.id,
        isActive: true,
      },

      // Injectables & Fillers
      {
        name: "Botox - Full Face",
        description:
          "Neuromodulator injection for forehead, frown lines, and crow's feet",
        price: 300,
        durationMinutes: 15,
        categoryId: injectables.id,
        isActive: true,
      },
      {
        name: "Botox - Partial",
        description:
          "Botox targeting specific areas (forehead, glabella, or crow's feet)",
        price: 200,
        durationMinutes: 15,
        categoryId: injectables.id,
        isActive: true,
      },
      {
        name: "Dermal Fillers - Lips",
        description:
          "Hyaluronic acid filler for lip augmentation and definition",
        price: 400,
        durationMinutes: 30,
        categoryId: injectables.id,
        isActive: true,
      },
      {
        name: "Dermal Fillers - Cheeks",
        description:
          "Filler injection for cheek volume and facial contour enhancement",
        price: 450,
        durationMinutes: 30,
        categoryId: injectables.id,
        isActive: true,
      },
      {
        name: "Dermal Fillers - Under Eyes",
        description:
          "Hyaluronic acid filler to reduce under-eye hollows and fine lines",
        price: 500,
        durationMinutes: 30,
        categoryId: injectables.id,
        isActive: true,
      },
      {
        name: "Filler Touch-Up",
        description: "Follow-up injection to perfect previous filler placement",
        price: 200,
        durationMinutes: 15,
        categoryId: injectables.id,
        isActive: true,
      },

      // Body Contouring
      {
        name: "CoolSculpting - Single Area",
        description:
          "Cryolipolysis fat reduction for belly, flanks, thighs, or arms",
        price: 600,
        durationMinutes: 60,
        categoryId: bodyContouring.id,
        isActive: true,
      },
      {
        name: "CoolSculpting - Dual Area",
        description: "Simultaneous CoolSculpting treatment on two areas",
        price: 1000,
        durationMinutes: 90,
        categoryId: bodyContouring.id,
        isActive: true,
      },
      {
        name: "Ultrasound Cavitation",
        description:
          "Non-invasive ultrasound treatment for fat reduction and cellulite",
        price: 250,
        durationMinutes: 45,
        categoryId: bodyContouring.id,
        isActive: true,
      },
      {
        name: "Radiofrequency Skin Tightening",
        description: "RF energy treatment to tighten skin on body and face",
        price: 300,
        durationMinutes: 60,
        categoryId: bodyContouring.id,
        isActive: true,
      },
      {
        name: "Cellulite Reduction Package",
        description:
          "3-session package combining RF and massage for cellulite improvement",
        price: 600,
        durationMinutes: 45,
        categoryId: bodyContouring.id,
        isActive: true,
      },
    ]

    const createdServices = await Promise.all(
      services.map((service) =>
        prisma.service.create({
          data: service,
        })
      )
    )
    console.log(`✓ ${createdServices.length} services created`)

    // ============ CLINIC AVAILABILITY ============
    console.log("🕐 Setting clinic hours...")

    const availability = [
      { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: "WEDNESDAY", startTime: "09:00", endTime: "20:00" },
      { dayOfWeek: "THURSDAY", startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: "FRIDAY", startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: "SATURDAY", startTime: "10:00", endTime: "16:00" },
      // Sunday: closed
    ]

    const createdAvailability = await Promise.all(
      availability.map((slot) =>
        prisma.availability.create({
          data: {
            dayOfWeek: slot.dayOfWeek as any,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        })
      )
    )
    console.log(`✓ Clinic hours set for ${createdAvailability.length} days`)

    // ============ SAMPLE APPOINTMENTS ============
    console.log("📅 Creating sample appointments...")

    // Create a few sample appointments for the client
    if (client) {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setHours(14, 0, 0, 0)

      const twoWeeksAgo = new Date(now)
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      twoWeeksAgo.setHours(11, 0, 0, 0)

      const appointments = [
        {
          clientId: client.id,
          serviceId: createdServices[0].id, // HydraFacial
          startsAt: tomorrow,
          endsAt: new Date(tomorrow.getTime() + 60 * 60 * 1000),
          status: "CONFIRMED" as const,
          notes: "First time client, interested in deep hydration",
        },
        {
          clientId: client.id,
          serviceId: createdServices[12].id, // Botox Full Face
          startsAt: nextWeek,
          endsAt: new Date(nextWeek.getTime() + 15 * 60 * 1000),
          status: "PENDING" as const,
          notes: null,
        },
        {
          clientId: client.id,
          serviceId: createdServices[5].id, // Oxygen Facial
          startsAt: twoWeeksAgo,
          endsAt: new Date(twoWeeksAgo.getTime() + 45 * 60 * 1000),
          status: "COMPLETED" as const,
          notes: "Great results, client very satisfied",
        },
      ]

      const createdAppointments = await Promise.all(
        appointments.map((apt) =>
          prisma.appointment.create({
            data: apt,
          })
        )
      )
      console.log(`✓ ${createdAppointments.length} sample appointments created`)

      // ============ UPDATE CLIENT NOTES ============
      await prisma.user.update({
        where: { id: client.id },
        data: {
          notes:
            "Regular client interested in skincare treatments. Sensitive skin - avoid harsh products.",
        },
      })
      console.log(`✓ Client notes added`)
    }

    console.log("\n✨ Database seeded successfully!\n")
    console.log("📋 TEST CREDENTIALS:")
    console.log("   Admin:")
    console.log("     Email: admin@clinic.com")
    console.log("     Password: 123123123")
    console.log("   Client:")
    console.log("     Email: client@example.com")
    console.log("     Password: 123123123")
  } catch (error) {
    console.error("❌ Seeding error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
