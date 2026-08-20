import { readData } from "../../utils/readData.js";
import { writeData } from "../../utils/writeData.js";

export const getAllUser = async () => {
  try {
    const data = await readData();
    const users = data.user;
    return users;
  } catch (error) {
    console.error("Error reading users data:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const data = await readData();
    const users = data.user;
    const user = users.find((u) => u.id === parseInt(userId));
    return user;
  } catch (error) {
    console.error("Error reading users data:", error);
    throw error;
  }
};

export const addUser = async (userData) => {
  try {
    const data = await readData();
    const newUser = {
      ...userData,
      id: data.user.length + 1,
    };
    data.user.push(newUser);
    await writeData(data);
    console.log("data after adding user:", data);
    return newUser;
  } catch (err) {
    console.log("Error creating users:", err);
    throw err;
  }
};

export const updateUser = async (userId, updatedData) => {
  try {
    const data = await readData();
    const userIndex = data.user.findIndex((u) => u.id === parseInt(userId));
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    data.user[userIndex] = { ...data.user[userIndex], ...updatedData };
    await writeData(data);
    return data.user[userIndex];
  } catch (err) {
    console.log("Error updating user:", err);
    throw err;
  }
};

export const deleteUser = async (userId) => {
  try {
    const data = await readData();
    const userIndex = data.user.findIndex((u) => u.id === parseInt(userId));
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const deletedUser = data.user[userIndex];

    data.user.splice(userIndex, 1);

    await writeData(data);
    return deletedUser;
  } catch (err) {
    console.log("Error deleting user: ", err);
    throw err;
  }
};
