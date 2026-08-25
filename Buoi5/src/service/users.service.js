import { readData, writeData } from "../repository/readData.js";

export const getAllUsers = async () => {
    const data = await readData();
    return data.users;
};

export const getUserById = async (userId) => {
    const data = await readData();
    return data.users.find((user) => user.id === parseInt(userId)) || null;
};

export const createUser = async (userData) => {
    const data = await readData();
    data.users.push(userData);
    await writeData(data);
};