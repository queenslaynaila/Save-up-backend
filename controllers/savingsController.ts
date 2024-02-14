import { Request, Response,  } from 'express';

import pool from '../db';
import { savingSchema, HttpError,idSchema,categorySchema,statusSchema,prioritySchema} from '../types';

export const updateUserTotalTargetedAmount = async (
  userId: string,
  newSavingTargetAmount: number,
) => {
  const query = `
    UPDATE users
    SET total_targeted_amount = total_targeted_amount + $1
    WHERE id = $2
    RETURNING *`;

  await pool.query(query, [newSavingTargetAmount, userId]);
};

export const getAllSavings = async (req: Request, res: Response) => {
    const query = 'SELECT * FROM savings';
    const result = await pool.query(query);
    const savings = result.rows;
    if (!savings || savings.length === 0) {
      return res.status(404).json({ error: new HttpError(404, 'No savings found').message });
    }
    return res.status(200).json(savings);
};

export const createSaving = async (req: Request, res: Response) => {
  const validationResult =savingSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving data').message });
  }
  const { user_id, description, category, target_amount, priority, target_date } =
  validationResult.data;
  try {
    await pool.query('BEGIN');
   
    const savingQuery = `
            INSERT INTO savings (user_id, description, category, target_amount, priority, target_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
    const savingValues = [user_id, description, category, target_amount, priority, target_date];
    const savingResult = await pool.query(savingQuery, savingValues);
    await updateUserTotalTargetedAmount(user_id, target_amount);
    await pool.query('COMMIT');
    res.status(201).json(savingResult.rows[0]);
  } catch {
    await pool.query('ROLLBACK');
  }
  
  
};

export const getSavingById = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
  }
  const id = validationResult.data

    const query = 'SELECT * FROM savings WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (!result || result.rows.length === 0) {
      return res.status(400).json({ error: new HttpError(400, 'Saving with submitted ID not found').message });
    } 
     res.status(200).json(result.rows[0]);
    
  
};
export const updateSaving = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const validatedSavings = savingSchema.parse(req.body);
    const {
      description,
      category,
      target_amount,
     
      priority,
   
      target_date
     
    } = validatedSavings;
    const query = `
            UPDATE savings 
            SET 
                description = $1,
                category = $2,
                target_amount = $3,
              
                priority = $4,
                
                target_date = $5,
               
            WHERE 
                id = $9 
            RETURNING *`;
    const values = [
      description,
      category,
      target_amount,
     
      priority,
    
      target_date,
    
      id
    ];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Saving not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};





export const deleteSaving = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid user ID').message });
  }
  const id = validationResult.data;
    const query = 'DELETE FROM savings WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount != null && result.rowCount > 0) {
      return res.status(204).json({ error: new HttpError(400, 'Saving deleted successfully').message });
    }  else {
      return res.status(400).json({ error: new HttpError(400, 'Saving with provided ID not found').message });
    }
  
};

export const getSavingsByCategory = async (req: Request, res: Response) => {
  const validationResult = categorySchema.safeParse(req.params.category);
  
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid category').message });
  }
  
  const category = validationResult.data;
  const query = 'SELECT * FROM savings WHERE category = $1';
  
  
    const result = await pool.query(query, [category]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      return res.status(404).json({ error: new HttpError(404, 'No savings found with the provided category').message });
    }
  } 

export const getSavingsByStatus = async (req: Request, res: Response) => {
  const validationResult = statusSchema.safeParse(req.params.status);
  
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid status params').message });
  }
  
  const status = validationResult.data;
  const query = 'SELECT * FROM savings WHERE status = $1';
  
  
    const result = await pool.query(query, [status]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      return res.status(404).json({ error: new HttpError(404, 'No savings found with the provided status').message });
    }
  
};


export const getSavingsByPriority = async (req: Request, res: Response) => {
  const validationResult = prioritySchema.safeParse(req.params.status);
  
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid priority params').message });
  }
  
  const priority = validationResult.data;
  const query = 'SELECT * FROM savings WHERE priority = $1';
  
    const result = await pool.query(query, [priority]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      return res.status(404).json({ error: new HttpError(404, 'No savings found with the provided priority').message });
    }
  
};

export const getUserSavings = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid user ID').message });
  }
  
  const id = validationResult.data;
  
  const query = 'SELECT * FROM savings WHERE user_id = $1';
  

    const { rows } = await pool.query(query, [id]);
    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      return res.status(404).json({ error: new HttpError(404, 'No savings found for the provided user ID').message });
    }
  } 
