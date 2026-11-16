import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';

export const hashPassword = (plain) => bcrypt.hash(plain, 12);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
