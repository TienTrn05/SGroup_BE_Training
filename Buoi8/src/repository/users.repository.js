import { query } from "../config/db.config.js";

// Never expose password_hash in API results.
const publicColumns = "id, name, email, role, created_at, updated_at";

export const findAll = async () => {
  const { rows } = await query(`SELECT ${publicColumns} FROM public.users ORDER BY id`);
  return rows;
};

export const findById = async (id) => {
  const { rows } = await query(`SELECT ${publicColumns} FROM public.users WHERE id = $1`, [id]);
  return rows[0] ?? null;
};

// Only the authentication service reads this result; never return it from an API.
export const findByEmailWithPassword = async (email) => {
  const { rows } = await query(
    `SELECT ${publicColumns}, password_hash FROM public.users WHERE lower(email) = lower($1) LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
};

export const emailExists = async (email, excludedId = null) => {
  const { rows } = await query(
    `SELECT 1 FROM public.users
     WHERE lower(email) = lower($1) AND ($2::integer IS NULL OR id <> $2)
     LIMIT 1`,
    [email, excludedId],
  );
  return rows.length > 0;
};

export const create = async ({ name, email, password_hash, role }) => {
  const { rows } = await query(
    `INSERT INTO public.users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING ${publicColumns}`,
    [name, email, password_hash, role],
  );
  return rows[0];
};

export const update = async (id, changes) => {
  // SQL column names come only from this fixed allowlist; values use parameters.
  const allowedFields = ["name", "email", "password_hash", "role"];
  const fields = allowedFields.filter((field) => changes[field] !== undefined);
  if (fields.length === 0) return findById(id);

  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  // The schema supplies an INSERT default, so updates must set this explicitly.
  assignments.push("updated_at = CURRENT_TIMESTAMP");
  const values = fields.map((field) => changes[field]);
  values.push(id);
  const { rows } = await query(
    `UPDATE public.users SET ${assignments.join(", ")} WHERE id = $${values.length}
     RETURNING ${publicColumns}`,
    values,
  );
  return rows[0] ?? null;
};

export const remove = async (id) => {
  const { rows } = await query(`DELETE FROM public.users WHERE id = $1 RETURNING ${publicColumns}`, [id]);
  return rows[0] ?? null;
};
