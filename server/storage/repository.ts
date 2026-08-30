import path from 'path';
import fs from 'fs';
import { UserProfile, JobApplication } from '../../src/types';
import { DEFAULT_USER_PROFILE, SAMPLE_APPLICATIONS } from '../../src/data/defaultProfile';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

/**
 * Ensures the persistence directory and initial seed files exist.
 */
export function initializeRepository(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PROFILE_FILE)) {
      fs.writeFileSync(PROFILE_FILE, JSON.stringify(DEFAULT_USER_PROFILE, null, 2), 'utf8');
    }
    if (!fs.existsSync(APPLICATIONS_FILE)) {
      fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(SAMPLE_APPLICATIONS, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[Repository] Initialization failed:', err);
  }
}

/**
 * Loads the current master user profile.
 */
export function getStoredProfile(): UserProfile {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      const data = fs.readFileSync(PROFILE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Repository] Error reading profile file:', err);
  }
  return DEFAULT_USER_PROFILE;
}

/**
 * Persists the user profile.
 */
export function saveStoredProfile(profile: UserProfile): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf8');
  } catch (err) {
    console.error('[Repository] Error saving profile file:', err);
  }
}

/**
 * Loads all stored job applications.
 */
export function getStoredApplications(): JobApplication[] {
  try {
    if (fs.existsSync(APPLICATIONS_FILE)) {
      const data = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Repository] Error reading applications file:', err);
  }
  return SAMPLE_APPLICATIONS;
}

/**
 * Persists all job applications.
 */
export function saveStoredApplications(apps: JobApplication[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf8');
  } catch (err) {
    console.error('[Repository] Error saving applications file:', err);
  }
}

/**
 * Finds an application by ID.
 */
export function getApplicationById(id: string): JobApplication | undefined {
  const apps = getStoredApplications();
  return apps.find(app => app.id === id);
}

/**
 * Updates or inserts an application.
 */
export function upsertApplication(app: JobApplication): void {
  const apps = getStoredApplications();
  const index = apps.findIndex(a => a.id === app.id);
  if (index >= 0) {
    apps[index] = { ...app, updatedAt: new Date().toISOString() };
  } else {
    apps.unshift({ ...app, createdAt: app.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveStoredApplications(apps);
}

/**
 * Deletes an application by ID.
 */
export function deleteApplicationById(id: string): boolean {
  const apps = getStoredApplications();
  const filtered = apps.filter(a => a.id !== id);
  if (filtered.length !== apps.length) {
    saveStoredApplications(filtered);
    return true;
  }
  return false;
}
