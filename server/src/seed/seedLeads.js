const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

const connectDB = require("../config/db");
const Lead = require("../models/Lead");

dotenv.config();

connectDB();

const statuses = ["New", "Contacted", "Qualified", "Lost"];

const owners = ["Kevin", "John", "Sarah", "Mike"];

const seedLeads = async () => {
  try {
    // Delete old data
    await Lead.deleteMany();

    const leads = [];

    for (let i = 0; i < 10000; i++) {
      leads.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        company: faker.company.name(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        owner: owners[Math.floor(Math.random() * owners.length)],
        createdAt: faker.date.past(),
      });
    }

    await Lead.insertMany(leads);

    console.log("10,000 Leads Inserted");

    process.exit();
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

seedLeads();