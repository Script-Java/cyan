import { z } from "zod";

/**
 * Validate data against a Zod schema
 * Used within route handlers for conditional or complex validation
 */
export async function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Promise<
  | { success: true; data: T }
  | { success: false; errors: Array<{ field: string; message: string }> }
> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join(".") || "unknown",
        message: err.message,
      }));
      return { success: false, errors };
    }

    console.error("Validation error:", error);
    return {
      success: false,
      errors: [
        {
          field: "unknown",
          message: "An unexpected validation error occurred",
        },
      ],
    };
  }
}

/**
 * COMMON SCHEMAS
 * Reusable base schemas for addresses, contact info, etc.
 */

export const AddressSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  street_1: z.string().min(1, "Street address is required"),
  street_2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  state_or_province: z.string().min(1, "State or province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country_iso2: z.string().min(2).max(2, "Country code must be 2 characters"),
  phone: z.string().optional().nullable(),
});

export const EmailSchema = z
  .string()
  .email("Invalid email format")
  .toLowerCase();

export const PhoneSchema = z
  .string()
  .regex(/^\+?[0-9\s\-\(\)]+$/, "Invalid phone number format")
  .optional()
  .nullable();

/**
 * CUSTOMER SCHEMAS
 */

export const UpdateCustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: PhoneSchema,
  email: EmailSchema.optional(),
});

export const CreateCustomerAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  stateOrProvince: z.string().min(1, "State or province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  countryCode: z.string().min(2).max(2, "Country code must be 2 characters"),
});

export const UpdateCustomerAddressSchema = CreateCustomerAddressSchema;

/**
 * ORDER SCHEMAS
 */

export const CreateOrderItemSchema = z.object({
  product_id: z.number().int("Product ID must be an integer"),
  product_name: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().optional(),
  price_inc_tax: z.number().optional(),
  options: z.record(z.unknown()).optional(),
  design_file_url: z
    .string()
    .url("Invalid design file URL")
    .optional()
    .nullable(),
});

export const CheckoutSchema = z.object({
  customer_id: z.number().int("Customer ID must be an integer"),
  billing_address: AddressSchema,
  shipping_addresses: z
    .array(AddressSchema)
    .min(1, "At least one shipping address is required"),
  products: z
    .array(CreateOrderItemSchema)
    .min(1, "At least one product is required"),
  discount_amount: z.number().min(0).optional().default(0),
  discount_code: z.string().optional().nullable(),
});

export const VerifyOrderAccessSchema = z.object({
  order_number: z
    .string()
    .min(1, "Order number is required")
    .regex(/^\d+$/, "Order number must contain only digits"),
  verification_field: z.string().min(1, "Email or phone is required"),
});

/**
 * DESIGN SCHEMAS
 */

export const UploadDesignFileSchema = z.object({
  order_id: z.number().int("Order ID must be an integer").optional(),
  order_item_id: z.number().int("Order item ID must be an integer").optional(),
  design_name: z.string().min(1, "Design name is required").max(255),
  file_type: z
    .enum(["image/png", "image/jpeg", "image/gif", "application/pdf"])
    .refine(
      (type) => type,
      "Unsupported file type. Allowed: PNG, JPG, GIF, PDF",
    ),
});

/**
 * PRODUCT SCHEMAS
 */

export const ProductImageSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url("Invalid image URL"),
  name: z.string().min(1, "Image name is required"),
  preview: z.string().optional(),
});

export const VariantValueSchema = z.object({
  id: z.string().min(1, "Variant ID is required"),
  name: z.string().min(1, "Variant name is required"),
  priceModifier: z.number().default(0),
  image: ProductImageSchema.optional(),
});

export const ProductOptionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  name: z.string().min(1, "Option name is required"),
  type: z.enum(["dropdown", "swatch", "radio", "text"]),
  required: z.boolean().default(false),
  values: z.array(VariantValueSchema),
  defaultValueId: z.string().optional(),
  displayOrder: z.number().int().default(0),
});

export const PricingRuleSchema = z.object({
  id: z.string().uuid().optional(),
  conditions: z.array(
    z.object({
      optionId: z.string().min(1),
      valueId: z.string().min(1),
    }),
  ),
  price: z.number().min(0, "Price must be non-negative"),
});

export const SharedVariantSchema = z.object({
  id: z.string().min(1, "Variant ID is required"),
  name: z.string().min(1, "Variant name is required"),
  description: z.string().optional(),
  optionSelections: z.array(
    z.object({
      optionId: z.string().min(1),
      optionName: z.string().min(1),
      selectedValueIds: z.array(z.string().min(1)),
    }),
  ),
  price: z.number().min(0, "Price must be non-negative"),
});

export const TaxConfigSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Tax name is required"),
  rate: z.number().min(0).max(100, "Tax rate must be between 0 and 100"),
  enabled: z.boolean().default(true),
});

export const SEOSchema = z.object({
  productUrl: z.string().url("Invalid product URL").optional(),
  pageTitle: z
    .string()
    .max(60, "Page title must be 60 characters or less")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description must be 160 characters or less")
    .optional(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  basePrice: z
    .number()
    .min(0, "Base price must be non-negative")
    .optional()
    .default(0),
  description: z.string().optional().default(""),
  sku: z.string().optional().default(""),
  weight: z.number().min(0).optional().default(0),
  images: z.array(ProductImageSchema).optional().default([]),
  options: z.array(ProductOptionSchema).optional().default([]),
  pricingRules: z.array(PricingRuleSchema).optional().default([]),
  sharedVariants: z.array(SharedVariantSchema).optional().default([]),
  customerUploadConfig: z
    .object({
      enabled: z.boolean(),
      maxFileSize: z.number().int().min(1),
      allowedFormats: z.array(z.string()),
      description: z.string().optional(),
    })
    .optional(),
  optionalFields: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.string().min(1),
      }),
    )
    .optional()
    .default([]),
  textArea: z.string().optional().default(""),
  uploadedFiles: z.array(z.any()).optional().default([]),
  conditionLogic: z.string().optional().default("all"),
  taxes: z.array(TaxConfigSchema).optional().default([]),
  seo: SEOSchema.optional(),
  categories: z.array(z.string()).optional().default([]),
  availability: z.boolean().optional().default(true),
  showQuantityPanel: z.boolean().optional().default(true),
  fixedQuantity: z.number().int().min(1).optional().nullable(),
});

export const UpdateProductSchema = CreateProductSchema;

/**
 * ADMIN SCHEMAS
 */

export const CreateInvoiceSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: EmailSchema,
  invoice_type: z.enum(["Standard", "ArtworkUpload"]),
  issue_date: z.string().datetime().optional(),
  due_date: z.string().datetime(),
  notes: z.string().optional().nullable(),
  subtotal: z.number().min(0),
  tax_rate: z.number().min(0).max(100).optional().default(0),
  tax_amount: z.number().min(0).optional().default(0),
  shipping: z.number().min(0).optional().default(0),
  discount_amount: z.number().min(0).optional().default(0),
  discount_type: z.enum(["fixed", "percentage"]).optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().int().min(1),
      unit_price: z.number().min(0),
      amount: z.number().min(0),
    }),
  ),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "printing",
    "in transit",
    "delivered",
    "paid",
    "pending_payment",
    "canceled",
  ]),
  notes: z.string().optional().nullable(),
});

/**
 * SUPPORT/CONTACT SCHEMAS
 */

export const SupportSubmissionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: EmailSchema,
  subject: z.string().min(1, "Subject is required").max(255),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  customerId: z.number().int().optional(),
});

/**
 * REVIEW SCHEMAS
 */

export const SubmitReviewSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  reviewer_name: z.string().min(1, "Name is required").max(255),
  reviewer_email: EmailSchema,
  rating: z.number().int().min(1, "Rating must be 1-5").max(5),
  title: z.string().max(255).optional(),
  comment: z.string().max(5000).optional(),
  images: z.array(z.string()).optional().default([]),
});

/**
 * AUTH SCHEMAS
 */

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupSchema = z.object({
  email: EmailSchema,
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
});

export const RequestPasswordResetSchema = z.object({
  email: EmailSchema,
});

/**
 * STORE CREDIT SCHEMAS
 */

export const ModifyStoreCreditSchema = z.object({
  customer_id: z.number().int("Customer ID must be an integer"),
  amount: z.number("Amount must be a number"),
  reason: z.string().min(1, "Reason is required").max(500),
});

/**
 * Type exports for use in route handlers
 */

export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CreateCustomerAddressInput = z.infer<
  typeof CreateCustomerAddressSchema
>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type VerifyOrderAccessInput = z.infer<typeof VerifyOrderAccessSchema>;
export type UploadDesignFileInput = z.infer<typeof UploadDesignFileSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type SupportSubmissionInput = z.infer<typeof SupportSubmissionSchema>;
export type SubmitReviewInput = z.infer<typeof SubmitReviewSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ModifyStoreCreditInput = z.infer<typeof ModifyStoreCreditSchema>;
