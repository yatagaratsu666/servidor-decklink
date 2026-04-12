import mongoose from "mongoose";
import { ENV } from "./env";

export const connectMongo = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);

    console.log("MongoDB conectada");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
  }
};