import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { User } from '../../database/models/User.js';
import { searchUsersQuerySchema } from '../schemas/project.schema.js';

export const UserController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const { search } = searchUsersQuerySchema.parse(req.query);
    const like = `%${search.toLowerCase()}%`;
    const users = await User.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { email: { [Op.iLike]: like } },
          { name:  { [Op.iLike]: like } },
        ],
      },
      attributes: ['id', 'email', 'name', 'role'],
      limit: 20,
      order: [['email', 'ASC']],
    });
    res.json({
      users: users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role })),
    });
  }),
};
