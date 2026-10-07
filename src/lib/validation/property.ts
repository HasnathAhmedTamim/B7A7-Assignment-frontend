import { z } from "zod"

import type { PropertyInput, RoomInput } from "@/lib/api/resources"
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  ROOM_TYPES,
  type Property,
  type PropertyRoom,
} from "@/types/models"

const MAX_RENT = 10_000_000

function wholeNumber(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(1, `Enter the number of ${label}`)
    .refine((v) => /^\d+$/.test(v), `Use a whole number for ${label}`)
    .refine((v) => Number(v) >= min && Number(v) <= max, `Enter between ${min} and ${max} ${label}`)
}

const rent = z
  .string()
  .trim()
  .min(1, "Enter the monthly rent")
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Enter an amount in taka, like 15000")
  .refine((v) => Number(v) > 0, "Rent must be more than 0")
  .refine((v) => Number(v) <= MAX_RENT, "That rent looks too high. Check the amount")

export const propertyBasicsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give the listing a title of at least 3 characters")
    .max(200, "Keep the title under 200 characters"),
  propertyType: z.enum(PROPERTY_TYPES, { error: "Choose the type of property" }),
  description: z
    .string()
    .trim()
    .min(10, "Describe the home in at least 10 characters")
    .max(5000, "Keep the description under 5000 characters"),
})

export const propertyLocationSchema = z.object({
  address: z
    .string()
    .trim()
    .min(3, "Enter the street address")
    .max(300, "Keep the address under 300 characters"),
  location: z.string().trim().max(200, "Keep the area under 200 characters"),
  city: z.string().trim().min(2, "Enter the city").max(100, "Keep the city under 100 characters"),
})

export const propertyDetailsSchema = z.object({
  monthlyRent: rent,
  bedrooms: wholeNumber("bedrooms", 0, 50),
  bathrooms: wholeNumber("bathrooms", 0, 50),
})

export const propertyFormSchema = propertyBasicsSchema
  .extend(propertyLocationSchema.shape)
  .extend(propertyDetailsSchema.shape)
  .extend({ status: z.enum(PROPERTY_STATUSES) })

export type PropertyFormValues = z.infer<typeof propertyFormSchema>

export const emptyPropertyValues: PropertyFormValues = {
  title: "",
  propertyType: "APARTMENT",
  description: "",
  address: "",
  location: "",
  city: "",
  monthlyRent: "",
  bedrooms: "1",
  bathrooms: "1",
  status: "DRAFT",
}

export function toPropertyInput(values: PropertyFormValues): PropertyInput {
  return {
    title: values.title.trim(),
    propertyType: values.propertyType,
    description: values.description.trim(),
    address: values.address.trim(),
    location: values.location.trim(),
    city: values.city.trim(),
    monthlyRent: Number(values.monthlyRent),
    bedrooms: Number(values.bedrooms),
    bathrooms: Number(values.bathrooms),
    status: values.status,
  }
}

export function toPropertyFormValues(property: Property): PropertyFormValues {
  return {
    title: property.title,
    propertyType: property.propertyType,
    description: property.description,
    address: property.address,
    location: property.location ?? "",
    city: property.city,
    monthlyRent: String(Number(property.monthlyRent)),
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    status: property.status,
  }
}

export const roomFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Give the room a name, like "Room A"')
    .max(100, "Keep the name under 100 characters"),
  roomType: z.enum(ROOM_TYPES, { error: "Choose a room type" }),
  monthlyRent: rent,
  capacity: z
    .string()
    .trim()
    .min(1, "Enter how many people can stay")
    .refine(
      (v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 20,
      "Enter between 1 and 20 people",
    ),
  available: z.boolean(),
})

export type RoomFormValues = z.infer<typeof roomFormSchema>

export const emptyRoomValues: RoomFormValues = {
  name: "",
  roomType: "SINGLE",
  monthlyRent: "",
  capacity: "1",
  available: true,
}

export function toRoomInput(values: RoomFormValues): RoomInput {
  return {
    name: values.name.trim(),
    roomType: values.roomType,
    monthlyRent: Number(values.monthlyRent),
    capacity: Number(values.capacity),
    available: values.available,
  }
}

export function toRoomFormValues(room: PropertyRoom): RoomFormValues {
  return {
    name: room.name,
    roomType: room.roomType,
    monthlyRent: String(Number(room.monthlyRent)),
    capacity: String(room.capacity),
    available: room.available,
  }
}
