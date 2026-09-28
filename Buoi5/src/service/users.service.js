import { readData, writeData } from "../repository/readData.js";
import { ConflictError } from "../core/error.response.js";

export const getAllUsers = async () => {
  const data = await readData();
  return data.users;
};

export const getUserById = async (userId) => {
  const data = await readData();
  const id = Number(userId);
  return data.users.find((user) => user.id === id) || null;
};

export const createUser = async (userData) => {
  const data = await readData();
  const emailExists = data.users.some(
    (user) => user.email.toLowerCase() === userData.email.toLowerCase(),
  );

  if (emailExists) {
    throw new ConflictError("Email already exists");
  }

  const nextId = Math.max(0, ...data.users.map((user) => user.id ?? 0)) + 1;
  const newUser = {
    id: nextId,
    name: userData.name,
    email: userData.email,
    ...(userData.age !== undefined && { age: userData.age }),
  };

  data.users.push(newUser);
  await writeData(data);
  return newUser;
};

export const updateUser = async (userId, updatedData) => {
  const data = await readData();
  const id = Number(userId);
  const userIndex = data.users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return null; // User not found
  }

  if (updatedData.email) {
    const emailExists = data.users.some(
      (user) =>
        user.id !== id &&
        user.email.toLowerCase() === updatedData.email.toLowerCase(),
    );

    if (emailExists) {
      throw new ConflictError("Email already exists");
    }
  }

  const allowedFields = ["name", "email", "age"];
  const sanitizedData = Object.fromEntries(
    Object.entries(updatedData).filter(([key]) => allowedFields.includes(key)),
  );
  const updatedUser = { ...data.users[userIndex], ...sanitizedData, id };

  data.users[userIndex] = updatedUser;
  await writeData(data);
  return updatedUser;
};

export const deleteUser = async (userId) => {
  const data = await readData();
  const id = Number(userId);
  const userIndex = data.users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return null; // User not found
  }

  const deletedUser = data.users.splice(userIndex, 1)[0];
  await writeData(data);
  return deletedUser;
};
