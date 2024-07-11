import { z } from 'zod';

//USER ROLES

export enum UserRole {
  ADMIN = 'Admin',
  USER = 'Standard',
  MODERATOR = 'Moderator'
}
  
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

export const statusCodeSchema = z.object({
  statusCode: z.number()
})

export type StatusCodeInterface = z.infer<typeof statusCodeSchema>;

//ID SCHEMA

export const idSchema = z.object({
  xid: z.number()
});

export type IdInterface = z.infer<typeof idSchema>;

export const xidEntitySchema = idSchema.extend({
  entity_id: z.number()
});

export type XidEntityInterface = z.infer<typeof xidEntitySchema>

export const headersSchema = z.object({
  'refresh-token': z.string(),
  'authorization-token': z.string()
});