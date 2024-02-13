import { z } from 'zod';

export const userSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone_no: z.string(),
    password: z.string(),
});

export const savingSchema = z.object({
    user_id: z.string().uuid(), 
    description: z.string(),
    category: z.string(),
    target_amount: z.number(),
    contributed_amount: z.number(), 
    priority: z.string(),
    target_date: z.date(), 
    status: z.string().optional(),
    start_date : z.date().optional(),
});

export const expenseSchema = z.object({
    user_id: z.string().uuid(), 
    category: z.string(),
    description: z.string(),
    amount: z.number(),
    date: z.date(),
});

export const contributionsSchema = z.object({
    saving_id: z.string().uuid(), 
    amount: z.number(),
    date: z.date(),
});

// export class HttnpError extends Error {
//     constructor(public status: number, message?: string) {
//       super(message);
//     }
//   }
//   export type CustomErrorContent = {
//     message: string,
  
//   };

export  class HttpError extends Error {
    statusCode: number;
  
    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  export class CustomError extends Error {
    readonly statusCode: number;
    readonly errors: CustomErrorContent[];
    readonly logging: boolean;
    
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.errors = [];
        this.logging = true; 
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}


export type User = z.infer<typeof userSchema>;
export type Saving = z.infer<typeof savingSchema>;
export type Contribution = z.infer<typeof savingSchema>;
export type Expense= z.infer<typeof savingSchema>;
