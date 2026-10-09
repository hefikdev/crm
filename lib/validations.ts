import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address").max(255);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const nameSchema = z.string().min(1, "Name is required").max(100);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const contactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  position: z.string().max(200).optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  tags: z.array(z.string().max(50)).max(20).default([]),
  notes: z.string().max(5000).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "lead", "archived"]).default("active"),
  source: z.enum(["referral", "website", "email", "phone", "social", "other"]).default("other"),
});

export const companySchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().max(200).optional().or(z.literal("")),
  industry: z.string().max(200).optional().or(z.literal("")),
  size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1001+"]).optional(),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email().max(255).optional().or(z.literal("")),
  website: z.string().max(500).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  tags: z.array(z.string().max(50)).max(20).default([]),
  status: z.enum(["active", "inactive", "lead", "archived"]).default("active"),
});

export const dealSchema = z.object({
  title: z.string().min(1).max(200),
  value: z.number().min(0).default(0),
  currency: z.string().max(3).default("USD"),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).default("lead"),
  probability: z.number().int().min(0).max(100).default(10),
  expectedCloseDate: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  tags: z.array(z.string().max(50)).max(20).default([]),
});

export const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "task", "note", "follow_up"]),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
  dueDate: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  dealId: z.string().optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().max(100).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  price: z.number().min(0).default(0),
  currency: z.string().max(3).default("PLN"),
  active: z.boolean().default(true),
});

export const targetSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM"),
  amount: z.number().min(0).default(0),
  currency: z.string().max(3).default("PLN"),
});

export const dealItemSchema = z.object({
  productId: z.string().optional().or(z.literal("")),
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0).default(0),
});

export const automationSchema = z.object({
  name: z.string().min(1).max(200),
  trigger: z.enum(["deal_created", "deal_stage_changed", "deal_won", "contact_created"]),
  triggerValue: z.string().max(100).optional().or(z.literal("")),
  action: z.enum(["create_task", "create_note", "send_email"]),
  actionValue: z.string().min(1).max(5000),
  actionSubject: z.string().max(300).optional().or(z.literal("")),
  delayMinutes: z.number().int().min(0).max(100000).default(0),
  active: z.boolean().default(true),
});

export const emailTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(10000),
});