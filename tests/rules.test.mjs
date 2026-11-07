// Security rules tests: each case writes exactly what the app writes, then tries the attacks
// the rules must block. Runs against the Firestore emulator (see package.json).
import { readFileSync } from "node:fs";
import { test, before, after, beforeEach } from "node:test";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "oscp-notes-rules-test",
    firestore: { rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8") },
  });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const alice = () => env.authenticatedContext("alice").firestore();
const bob = () => env.authenticatedContext("bob").firestore();
const anon = () => env.unauthenticatedContext().firestore();
const note = (w = 3, extra = {}) => ({ html: "<p>sudo -l</p>", text: "sudo -l", week: w, updatedAt: serverTimestamp(), ...extra });
const IMG = "data:image/webp;base64,UklGRiICAABXRUJQVlA4";
const seed = async (path, data) => env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), path), data));

test("owner can create, read, list, update and delete their notes", async () => {
  const ref = doc(alice(), "users/alice/notes/week-3");
  await assertSucceeds(setDoc(ref, note()));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(getDocs(collection(alice(), "users/alice/notes")));
  await assertSucceeds(setDoc(ref, note(3, { html: "<p>updated</p>", text: "updated" })));
  await assertSucceeds(deleteDoc(ref));
});

test("other users and signed-out visitors can't touch someone's notes", async () => {
  await seed("users/alice/notes/week-3", { html: "x", text: "x", week: 3, updatedAt: Timestamp.now() });
  await assertFails(getDoc(doc(bob(), "users/alice/notes/week-3")));
  await assertFails(getDocs(collection(bob(), "users/alice/notes")));
  await assertFails(setDoc(doc(bob(), "users/alice/notes/week-4"), note(4)));
  await assertFails(deleteDoc(doc(bob(), "users/alice/notes/week-3")));
  await assertFails(getDoc(doc(anon(), "users/alice/notes/week-3")));
  await assertFails(setDoc(doc(anon(), "users/alice/notes/week-4"), note(4)));
});

test("notes must match the schema", async () => {
  const db = alice();
  await assertFails(setDoc(doc(db, "users/alice/notes/week-3"), note(3, { extra: "x" })));          // schema pollution
  await assertFails(setDoc(doc(db, "users/alice/notes/week-3"), note(4)));                          // id/week mismatch
  await assertFails(setDoc(doc(db, "users/alice/notes/week-0"), note(0)));                          // week out of range
  await assertFails(setDoc(doc(db, "users/alice/notes/week-3"), note(3, { week: "3" })));           // wrong type
  await assertFails(setDoc(doc(db, "users/alice/notes/week-3"), note(3, { html: "a".repeat(400001) }))); // too large
  await assertFails(setDoc(doc(db, "users/alice/notes/week-3"), note(3, { updatedAt: Timestamp.fromMillis(0) }))); // forged time
  const { text, ...noText } = note(3);
  await assertFails(setDoc(doc(db, "users/alice/notes/week-3"), noText));                          // missing field
  await assertSucceeds(setDoc(doc(db, "users/alice/notes/week-3"), note(3)));
  await assertFails(updateDoc(doc(db, "users/alice/notes/week-3"), { html: 5, updatedAt: serverTimestamp() })); // update bypass
});

test("images: owner can add, read and delete; never edit; others locked out", async () => {
  const db = alice();
  const ref = await assertSucceeds(addDoc(collection(db, "users/alice/images"), { data: IMG, createdAt: serverTimestamp() }));
  await assertSucceeds(getDoc(ref));
  await assertFails(updateDoc(ref, { data: IMG + "AA", createdAt: serverTimestamp() }));
  await assertFails(getDoc(doc(bob(), ref.path)));
  await assertFails(addDoc(collection(bob(), "users/alice/images"), { data: IMG, createdAt: serverTimestamp() }));
  await assertFails(addDoc(collection(db, "users/alice/images"), { data: "javascript:alert(1)", createdAt: serverTimestamp() }));
  await assertFails(addDoc(collection(db, "users/alice/images"), { data: IMG, createdAt: serverTimestamp(), note: "x" }));
  await assertSucceeds(deleteDoc(ref));
  // a realistic screenshot: the app keeps each image under ~950 KB once base64-encoded
  const big = "data:image/webp;base64," + "A".repeat(950000);
  await assertSucceeds(addDoc(collection(db, "users/alice/images"), { data: big, createdAt: serverTimestamp() }));
});

test("calendar: owner can save and read it; schema enforced; others locked out", async () => {
  const cal = (extra = {}) => ({ start: "2026-10-19", moves: { "HackTheBox|Nibbles": "2026-10-21" }, updatedAt: serverTimestamp(), ...extra });
  const ref = doc(alice(), "users/alice/meta/calendar");
  await assertSucceeds(setDoc(ref, cal()));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(setDoc(ref, cal({ moves: {} })));
  await assertFails(getDoc(doc(bob(), "users/alice/meta/calendar")));
  await assertFails(setDoc(doc(bob(), "users/alice/meta/calendar"), cal()));
  await assertFails(getDoc(doc(anon(), "users/alice/meta/calendar")));
  await assertFails(setDoc(ref, cal({ start: "next monday" })));                  // bad date
  await assertFails(setDoc(ref, cal({ moves: "x" })));                            // wrong type
  await assertFails(setDoc(ref, cal({ extra: 1 })));                              // schema pollution
  await assertFails(setDoc(ref, cal({ updatedAt: Timestamp.fromMillis(0) })));   // forged time
  await assertFails(setDoc(doc(alice(), "users/alice/meta/other"), cal()));       // only "calendar" exists
  await assertSucceeds(deleteDoc(ref));
});

test("nothing outside users/<uid>/notes and users/<uid>/images is reachable", async () => {
  await assertFails(setDoc(doc(alice(), "users/alice"), { anything: true }));
  await assertFails(setDoc(doc(alice(), "users/alice/other/x"), { anything: true }));
  await assertFails(setDoc(doc(alice(), "public/x"), { anything: true }));
});
