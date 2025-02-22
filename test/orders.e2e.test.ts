import request from "supertest";
import app from "../src/server";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.API_KEY || "my_secure_api_key";
const testFilePath = path.join(__dirname, "../../data/orders.json");
