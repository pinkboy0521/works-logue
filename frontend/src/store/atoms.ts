import { atom } from "jotai";
import type { User, Notification, SeedFormInput } from "@/types";

// Auth
export const userAtom = atom<User | null>(null);

// Notifications
export const notificationsAtom = atom<Notification[]>([]);

// Primitive: unread count (set directly by AuthProvider)
export const notificationUnreadCountAtom = atom<number>(0);

// Seed form draft (partial SeedFormInput saved before submit)
export type SeedFormDraft = Partial<SeedFormInput>;
export const seedFormDraftAtom = atom<SeedFormDraft | null>(null);
