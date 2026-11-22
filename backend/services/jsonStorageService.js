const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

/**
 * Reads data from JSON file with safe error handling
 */
async function read(collection) {
  const filePath = getFilePath(collection);
  try {
    if (!fs.existsSync(filePath)) {
      await write(collection, []);
      return [];
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (error) {
    console.error(`[JsonStorage] Error reading ${collection}:`, error.message);
    return [];
  }
}

/**
 * Atomic write to JSON file using temporary file swap
 */
async function write(collection, data) {
  const filePath = getFilePath(collection);
  const tempPath = `${filePath}.tmp-${Date.now()}`;
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(tempPath, jsonString, 'utf-8');
    await fs.promises.rename(tempPath, filePath);
    return true;
  } catch (error) {
    console.error(`[JsonStorage] Error writing ${collection}:`, error.message);
    try {
      if (fs.existsSync(tempPath)) await fs.promises.unlink(tempPath);
    } catch {}
    throw error;
  }
}

/**
 * Find item by ID or slug
 */
async function findById(collection, id) {
  const items = await read(collection);
  const strId = String(id).trim().toLowerCase();
  return items.find(item => 
    (item.id && String(item.id).toLowerCase() === strId) ||
    (item._id && String(item._id).toLowerCase() === strId) ||
    (item.registrationId && String(item.registrationId).toLowerCase() === strId) ||
    (item.slug && String(item.slug).toLowerCase() === strId)
  ) || null;
}

/**
 * Append new item with generated custom ID and timestamp
 */
async function create(collection, item) {
  const items = await read(collection);
  const timestamp = new Date().toISOString();
  const newItem = {
    id: item.id || `${collection.slice(0, 3)}-${Date.now()}`,
    _id: item._id || (Date.now().toString(16) + Math.random().toString(16).substring(2, 10)),
    ...item,
    createdAt: item.createdAt || timestamp,
    updatedAt: timestamp
  };
  items.push(newItem);
  await write(collection, items);
  return newItem;
}

/**
 * Update an item by ID
 */
async function update(collection, id, updates) {
  const items = await read(collection);
  const strId = String(id).trim().toLowerCase();
  const index = items.findIndex(item => 
    (item.id && String(item.id).toLowerCase() === strId) ||
    (item._id && String(item._id).toLowerCase() === strId) ||
    (item.registrationId && String(item.registrationId).toLowerCase() === strId)
  );

  if (index === -1) return null;

  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await write(collection, items);
  return items[index];
}

/**
 * Delete an item by ID
 */
async function remove(collection, id) {
  const items = await read(collection);
  const strId = String(id).trim().toLowerCase();
  const index = items.findIndex(item => 
    (item.id && String(item.id).toLowerCase() === strId) ||
    (item._id && String(item._id).toLowerCase() === strId) ||
    (item.registrationId && String(item.registrationId).toLowerCase() === strId)
  );

  if (index === -1) return false;

  const deletedItem = items.splice(index, 1)[0];
  await write(collection, items);
  return deletedItem;
}

module.exports = {
  read,
  write,
  findById,
  create,
  update,
  remove
};
