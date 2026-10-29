import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Load environment variables from possible locations
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "rhy-bistro-web/server/.env"),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config();

import { connectDB } from "./lib/db.js";
import { AdminUser } from "./models/AdminUser.js";
import { RestaurantTable } from "./models/RestaurantTable.js";
import { MenuItem } from "./models/MenuItem.js";
import { Setting, DEFAULT_SETTINGS } from "./models/Setting.js";
import { hashPassword } from "./lib/auth.js";
import { logger } from "./lib/logger.js";
import crypto from "node:crypto";
import mongoose from "mongoose";

async function runSeed() {
  logger.info("Connecting to MongoDB for seeding...");
  await connectDB();

  // 1. Seed or Verify Admin User
  const existingAdmin = await AdminUser.findOne({ role: "admin" });
  const username = process.env["ADMIN_USERNAME"] || "admin";
  const email = process.env["ADMIN_EMAIL"] || "admin@rhybistro.ch";
  const password = process.env["ADMIN_INIT_PASSWORD"] || "admin123";
  const passwordHash = await hashPassword(password);

  if (!existingAdmin) {
    await AdminUser.create({
      username,
      email,
      passwordHash,
      role: "admin",
    });

    console.log("==================================================");
    console.log(" INITIAL ADMIN ACCOUNT CREATED SUCCESSFULLY");
    console.log(` Username: ${username}`);
    console.log(` Email:    ${email}`);
    console.log(` Password: ${password}`);
    console.log("==================================================");
  } else {
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.email = email;
    await existingAdmin.save();
    logger.info({ username: existingAdmin.username, email: existingAdmin.email }, "Admin password set to admin123");
  }

  // 2. Seed Default Tables
  const tableCount = await RestaurantTable.countDocuments();
  if (tableCount === 0) {
    logger.info("Seeding restaurant tables...");
    const defaultTables = [
      { name: "Table 1 (Window)", capacity: 2, minCapacity: 1, location: "Window", isActive: true },
      { name: "Table 2 (Window)", capacity: 2, minCapacity: 1, location: "Window", isActive: true },
      { name: "Table 3 (Window)", capacity: 4, minCapacity: 2, location: "Window", isActive: true },
      { name: "Table 4 (Main Hall)", capacity: 4, minCapacity: 2, location: "Main Hall", isActive: true },
      { name: "Table 5 (Main Hall)", capacity: 4, minCapacity: 2, location: "Main Hall", isActive: true },
      { name: "Table 6 (Main Hall)", capacity: 6, minCapacity: 4, location: "Main Hall", isActive: true },
      { name: "Table 7 (Booth)", capacity: 6, minCapacity: 4, location: "Main Hall", isActive: true },
      { name: "Table 8 (Private Alcove)", capacity: 8, minCapacity: 5, location: "Private Alcove", isActive: true },
      { name: "Terrace T1", capacity: 2, minCapacity: 1, location: "Terrace", isActive: true },
      { name: "Terrace T2", capacity: 4, minCapacity: 2, location: "Terrace", isActive: true },
      { name: "Terrace T3", capacity: 4, minCapacity: 2, location: "Terrace", isActive: true },
    ];
    await RestaurantTable.insertMany(defaultTables);
    logger.info(`Seeded ${defaultTables.length} tables`);
  }

  // 3. Seed Default Menu Items
  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    logger.info("Seeding menu items...");
    const defaultMenuItems = [
      // Starters
      {
        nameFr: "Velouté de Courge Butternut",
        nameEn: "Butternut Squash Velouté",
        descFr: "Graines de courge torréfiées, huile de noisette, tuile au Gruyère.",
        descEn: "Roasted pumpkin seeds, hazelnut oil, Gruyère crisp.",
        price: 18,
        category: "starters",
        dietary: ["veg", "gf"],
        isAvailable: true,
        sortOrder: 1,
      },
      {
        nameFr: "Tartare de Bœuf de la Vallée",
        nameEn: "Valley Beef Tartare",
        descFr: "Câpres, moutarde à l'ancienne, jaune d'œuf confit, pain grillé.",
        descEn: "Capers, whole grain mustard, confit egg yolk, toasted bread.",
        price: 24,
        category: "starters",
        dietary: [],
        isAvailable: true,
        sortOrder: 2,
      },
      {
        nameFr: "Carpaccio de Betteraves",
        nameEn: "Beetroot Carpaccio",
        descFr: "Chèvre frais des Alpes, noix, vinaigrette au miel de montagne.",
        descEn: "Fresh Alpine goat cheese, walnuts, mountain honey vinaigrette.",
        price: 19,
        category: "starters",
        dietary: ["veg", "gf"],
        isAvailable: true,
        sortOrder: 3,
      },
      {
        nameFr: "Planche de Charcuterie Valaisanne",
        nameEn: "Valais Charcuterie Board",
        descFr: "Viande séchée, jambon cru, lard, saucisses, cornichons.",
        descEn: "Air-dried meat, raw ham, bacon, sausages, gherkins.",
        price: 28,
        category: "starters",
        dietary: ["gf"],
        isAvailable: true,
        sortOrder: 4,
      },
      {
        nameFr: "Salade d'Hiver",
        nameEn: "Winter Salad",
        descFr: "Pousses d'épinards, poires pochées, noix de pécan, vinaigrette balsamique.",
        descEn: "Baby spinach, poached pears, pecans, balsamic vinaigrette.",
        price: 16,
        category: "starters",
        dietary: ["vegan", "gf"],
        isAvailable: true,
        sortOrder: 5,
      },
      // Mains
      {
        nameFr: "Filets de Perche du Léman",
        nameEn: "Lake Geneva Perch Fillets",
        descFr: "Sauce tartare maison, pommes frites allumettes, salade verte.",
        descEn: "Homemade tartare sauce, matchstick fries, green salad.",
        price: 42,
        category: "mains",
        dietary: [],
        isAvailable: true,
        sortOrder: 6,
      },
      {
        nameFr: "Entrecôte de Bœuf",
        nameEn: "Beef Entrecôte",
        descFr: "Beurre Café de Paris, gratin dauphinois, légumes de saison.",
        descEn: "Café de Paris butter, potato gratin, seasonal vegetables.",
        price: 48,
        category: "mains",
        dietary: ["gf"],
        isAvailable: true,
        sortOrder: 7,
      },
      {
        nameFr: "Fondue Moitié-Moitié (min 2 pers.)",
        nameEn: "Half-and-Half Fondue (min 2 pers.)",
        descFr: "Gruyère AOP, Vacherin Fribourgeois AOP, pain, pommes de terre.",
        descEn: "Gruyère AOP, Vacherin Fribourgeois AOP, bread, potatoes.",
        price: 32,
        category: "mains",
        dietary: ["veg"],
        isAvailable: true,
        sortOrder: 8,
      },
      {
        nameFr: "Rösti Traditionnel aux Champignons",
        nameEn: "Traditional Mushroom Rösti",
        descFr: "Galette de pommes de terre, poêlée de champignons des bois, herbes fraîches.",
        descEn: "Potato galette, pan-fried wild mushrooms, fresh herbs.",
        price: 26,
        category: "mains",
        dietary: ["veg", "gf"],
        isAvailable: true,
        sortOrder: 9,
      },
      {
        nameFr: "Risotto au Safran de Mund",
        nameEn: "Mund Saffron Risotto",
        descFr: "Parmesan affiné, tuile croquante, pousses de petit pois.",
        descEn: "Aged Parmesan, crispy tuile, pea shoots.",
        price: 28,
        category: "mains",
        dietary: ["veg", "gf"],
        isAvailable: true,
        sortOrder: 10,
      },
      // Desserts
      {
        nameFr: "Meringue à la Crème Double de Gruyère",
        nameEn: "Meringue with Gruyère Double Cream",
        descFr: "Coulis de fruits rouges, menthe fraîche.",
        descEn: "Red berry coulis, fresh mint.",
        price: 14,
        category: "desserts",
        dietary: ["veg", "gf"],
        isAvailable: true,
        sortOrder: 11,
      },
      {
        nameFr: "Fondant au Chocolat Noir",
        nameEn: "Dark Chocolate Fondant",
        descFr: "Cœur coulant, glace vanille artisanale.",
        descEn: "Molten center, artisanal vanilla ice cream.",
        price: 16,
        category: "desserts",
        dietary: ["veg"],
        isAvailable: true,
        sortOrder: 12,
      },
      {
        nameFr: "Tarte Tatin aux Pommes",
        nameEn: "Apple Tarte Tatin",
        descFr: "Caramel au beurre salé, crème épaisse.",
        descEn: "Salted caramel, thick cream.",
        price: 15,
        category: "desserts",
        dietary: ["veg"],
        isAvailable: true,
        sortOrder: 13,
      },
      {
        nameFr: "Assiette de Fromages Suisses",
        nameEn: "Swiss Cheese Plate",
        descFr: "Sélection de nos alpages, pain aux noix, confiture de figues.",
        descEn: "Selection from our Alps, walnut bread, fig jam.",
        price: 18,
        category: "desserts",
        dietary: ["veg"],
        isAvailable: true,
        sortOrder: 14,
      },
      // Drinks & Wine
      {
        nameFr: "Eau Minérale Valser (50cl)",
        nameEn: "Valser Mineral Water (50cl)",
        descFr: "Plate ou gazeuse.",
        descEn: "Still or sparkling.",
        price: 6,
        category: "drinks",
        dietary: [],
        isAvailable: true,
        sortOrder: 15,
      },
      {
        nameFr: "Fendant du Valais (Verre 1dl)",
        nameEn: "Valais Fendant (Glass 1dl)",
        descFr: "Chasselas, sec et minéral. Parfait avec le fromage.",
        descEn: "Chasselas, dry and mineral. Perfect with cheese.",
        price: 7,
        category: "wine",
        dietary: [],
        isAvailable: true,
        sortOrder: 16,
      },
      {
        nameFr: "Petite Arvine (Verre 1dl)",
        nameEn: "Petite Arvine (Glass 1dl)",
        descFr: "Fruité avec une touche saline en finale.",
        descEn: "Fruity with a saline touch on the finish.",
        price: 9,
        category: "wine",
        dietary: [],
        isAvailable: true,
        sortOrder: 17,
      },
      {
        nameFr: "Pinot Noir (Verre 1dl)",
        nameEn: "Pinot Noir (Glass 1dl)",
        descFr: "Élégant, notes de fruits rouges.",
        descEn: "Elegant, notes of red fruits.",
        price: 8,
        category: "wine",
        dietary: [],
        isAvailable: true,
        sortOrder: 18,
      },
      {
        nameFr: "Cornalin (Verre 1dl)",
        nameEn: "Cornalin (Glass 1dl)",
        descFr: "Cépage autochtone, corsé et épicé.",
        descEn: "Indigenous grape, full-bodied and spicy.",
        price: 10,
        category: "wine",
        dietary: [],
        isAvailable: true,
        sortOrder: 19,
      },
      {
        nameFr: "Bouteille - Syrah du Valais",
        nameEn: "Bottle - Valais Syrah",
        descFr: "Notes poivrées, charpenté.",
        descEn: "Peppery notes, well-structured.",
        price: 58,
        category: "wine",
        dietary: [],
        isAvailable: true,
        sortOrder: 20,
      },
    ];
    await MenuItem.insertMany(defaultMenuItems);
    logger.info(`Seeded ${defaultMenuItems.length} menu items`);
  }

  // 4. Seed Settings
  const existingSettings = await Setting.findOne({ key: "restaurant_profile" });
  if (!existingSettings) {
    logger.info("Seeding restaurant settings...");
    await Setting.create({
      key: "restaurant_profile",
      value: DEFAULT_SETTINGS,
    });
    logger.info("Default settings seeded");
  }

  logger.info("Database seeding completed successfully!");
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
