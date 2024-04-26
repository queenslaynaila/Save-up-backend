import { z } from 'zod';

//METHOD ENUM
export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

//PARAMS SCHEEMAS

export const idParamSchema = z.object({
  id: z.string()
})

export type IdParamInterface = z.infer<typeof idParamSchema>;

export const getByuserSchema = z.object({
  user_id: z.number()
})

export type GetByUserInterface = z.infer<typeof getByuserSchema>

export const getByPhone = z.object({
  phone_number: z.string()
})

export type GetByPhoneInterface = z.infer<typeof getByPhone>;

export const getById = z.object({
  id: z.number()
})

export type GetByIdInterface = z.infer<typeof getById>;

//MESSAGE RESPONSESCHEMA

export const messageSchema = z.object({
  message: z.string()
})

export type MessageInterface = z.infer<typeof messageSchema>;

//ID SCHEMA

export const idSchema = z.object({
  id: z.number()
});

export type IdInterface = z.infer<typeof idSchema>;




