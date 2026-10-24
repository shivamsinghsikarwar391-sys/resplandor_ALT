import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'resplandor.db');
console.log(`[Database] Initializing SQLite database at: ${DB_PATH}`);

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // 1. Appointments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      nail_length TEXT,
      nail_shape TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Confirmed', 'Rejected', 'Rescheduled', 'Cancelled', 'Completed')),
      admin_notes TEXT,
      rejection_reason TEXT,
      notification_status TEXT DEFAULT 'none',
      notification_details TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_ref ON appointments(reference);
    CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(customer_phone);
  `);

  // 2. Administrators Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 3. Salon Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS salon_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 4. Audit Log Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      performed_by TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 5. Admin Password Resets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      reset_code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(admin_id) REFERENCES admins(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_resets_code ON admin_password_resets(reset_code);
    CREATE INDEX IF NOT EXISTS idx_resets_admin ON admin_password_resets(admin_id);
  `);

  // Seed default admin if table is empty
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get().count;
  if (adminCount === 0) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Resplandor2026!';
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admins (username, email, password_hash, name, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', 'owner@resplandor-atl.com', passwordHash, 'Resplandor Salon Owner', now);

    console.log(`[Database] Initialized default admin account: 'admin' / '${defaultPassword}'`);
  }

  // Seed default salon settings
  const defaultWorkingHours = {
    monday: { open: '10:00 AM', close: '07:00 PM', closed: false },
    tuesday: { open: '10:00 AM', close: '07:00 PM', closed: false },
    wednesday: { open: '10:00 AM', close: '07:00 PM', closed: false },
    thursday: { open: '10:00 AM', close: '07:00 PM', closed: false },
    friday: { open: '10:00 AM', close: '07:00 PM', closed: false },
    saturday: { open: '10:00 AM', close: '06:00 PM', closed: false },
    sunday: { open: '11:00 AM', close: '05:00 PM', closed: true },
  };

  const setSettingIfNotExists = (key, value) => {
    const existing = db.prepare('SELECT key FROM salon_settings WHERE key = ?').get(key);
    if (!existing) {
      db.prepare('INSERT INTO salon_settings (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
    }
  };

  setSettingIfNotExists('working_hours', defaultWorkingHours);
  setSettingIfNotExists('slot_duration_minutes', 60);
  setSettingIfNotExists('blackout_dates', []);
  setSettingIfNotExists('time_slots_preset', [
    '10:00 AM',
    '11:30 AM',
    '01:00 PM',
    '02:30 PM',
    '04:00 PM',
    '05:30 PM'
  ]);
  setSettingIfNotExists('salon_info', {
    name: 'Resplandor ATL',
    location: 'Snellville, Georgia',
    instagram: 'https://www.instagram.com/resplandor.atl/'
  });
  setSettingIfNotExists('admin_recovery_key', process.env.ADMIN_RECOVERY_KEY || 'RESPLANDOR-ATL-OWNER-KEY-2026');

  console.log('[Database] Schema migrations and seed settings ready.');
}
