import z from "zod";

export const signupValidation = z.object({
  username: z
    .string()
    .min(5, { message: "Username should be at least 5 characters long" })
    .max(50, { message: "Username should not exceed 50 characters" }),
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .min(5, { message: "Email should be at least 5 characters long" })
    .max(50, { message: "Email should not exceed 50 characters" }),

  password: z
    .string()
    .min(6, { message: "Password should be at least 6 characters long" })
    .max(20, { message: "Password should not exceed 20 characters" }),
});

export const loginValidation = z.object({
  username: z
    .string()
    .min(5, { message: "Username should be at least 5 characters long" })
    .max(50, { message: "Username should not exceed 50 characters" }),
  password: z
    .string()
    .min(6, { message: "Password should be at least 6 characters long" })
    .max(20, { message: "Password should not exceed 20 characters" }),
});

export const verificationCodeValidation = z.object({
  code: z
    .number({
      required_error: "Verification code is required",
      invalid_type_error: "Verification code must be a number",
    })
    .int("Code must be an integer")
    .gte(100000, "Code must be 6 digits")
    .lte(999999, "Code must be 6 digits"),
});
