import dotenv from "dotenv";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { User } from "../models/User";
import { logger } from "../utils/logger";

dotenv.config();

const DEFAULT_PASSWORD = "TestPassword123!";
const FAKE_DOMAINS = [
  "gmail.com",
  "mockmail.com",
  "devinbox.com",
  "sandboxmail.com",
  "examplemail.com",
  "fakemail.com",
];

function toEmailSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function parseCountInput(): number {
  const positional = process.argv[2];
  const countFlag = process.argv.find((arg) => arg.startsWith("--count="));
  const rawCount = countFlag ? countFlag.split("=")[1] : positional;
  const count = Number(rawCount);

  if (!rawCount || !Number.isInteger(count) || count <= 0) {
    throw new Error(
      "Invalid count. Usage: npm run seed:users -- 25 OR npm run seed:users -- --count=25",
    );
  }

  return count;
}

function buildEmail(
  firstName: string,
  lastName: string,
  usedEmails: Set<string>,
): string {
  const first = toEmailSlug(firstName);
  const last = toEmailSlug(lastName);
  const domain = faker.helpers.arrayElement(FAKE_DOMAINS);

  let suffix = 0;
  let localPart = `${first}.${last}`;
  let email = `${localPart}@${domain}`;

  while (usedEmails.has(email)) {
    suffix += 1;
    localPart = `${first}.${last}${suffix}`;
    email = `${localPart}@${domain}`;
  }

  usedEmails.add(email);
  return email;
}

async function seedUsers(count: number): Promise<void> {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  await mongoose.connect(mongodbUri);

  try {
    const usedEmails = new Set<string>();
    const users = Array.from({ length: count }).map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      return {
        name: `${firstName} ${lastName}`,
        email: buildEmail(firstName, lastName, usedEmails),
        password: DEFAULT_PASSWORD,
      };
    });

    await User.create(users);

    logger.info(`Seeded ${count} users successfully.`);
    logger.info(`Password for all seeded users: ${DEFAULT_PASSWORD}`);
  } finally {
    await mongoose.disconnect();
  }
}

async function main(): Promise<void> {
  try {
    const count = parseCountInput();
    await seedUsers(count);
  } catch (error) {
    logger.error("Failed to seed users:", error);
    process.exit(1);
  }
}

void main();
