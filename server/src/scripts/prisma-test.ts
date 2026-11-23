// Prisma smoke test: saves a synthetic ticket with one message, reads it back,
// checks the values match, then deletes it so the database stays clean.
// Run with: npm run db:test  (from the repo root or the server folder)
import "dotenv/config";
import { prisma } from "../db.js";

const sample = {
  subject: "[TEST] Cannot open course materials",
  customerEmail: "test.student@example.com",
  customerName: "Test Student",
  body: "Hi, the link to week 3 materials returns an error. Can you help?",
};

function line(label: string, value: unknown) {
  console.log(`  ${label.padEnd(16)} ${String(value)}`);
}

async function main() {
  console.log("Prisma test: write and read a synthetic record\n");

  console.log("1. Saving sample ticket...");
  const created = await prisma.ticket.create({
    data: {
      subject: sample.subject,
      customerEmail: sample.customerEmail,
      customerName: sample.customerName,
      messages: {
        create: { sender: "CUSTOMER", body: sample.body },
      },
    },
  });
  line("Saved ticket id:", created.id);

  console.log("\n2. Reading it back from the database...");
  const found = await prisma.ticket.findUnique({
    where: { id: created.id },
    include: { messages: true },
  });
  if (!found) throw new Error(`Ticket ${created.id} was not found after saving.`);

  line("Ticket id:", found.id);
  line("Subject:", found.subject);
  line("Customer:", `${found.customerName} <${found.customerEmail}>`);
  line("Status:", found.status);
  line("Category:", found.category ?? "(not classified)");
  line("Created at:", found.createdAt.toISOString());
  line("Messages:", found.messages.length);
  line("First message:", found.messages[0]?.body);

  console.log("\n3. Checking the values match...");
  const checks: [string, boolean][] = [
    ["subject", found.subject === sample.subject],
    ["customer email", found.customerEmail === sample.customerEmail],
    ["default status OPEN", found.status === "OPEN"],
    ["one message saved", found.messages.length === 1],
    ["message body", found.messages[0]?.body === sample.body],
  ];
  for (const [name, ok] of checks) console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);

  console.log("\n4. Cleaning up the sample record...");
  await prisma.ticket.delete({ where: { id: created.id } }); // messages cascade
  line("Deleted ticket:", created.id);

  const failed = checks.filter(([, ok]) => !ok).length;
  console.log(failed === 0 ? "\nRESULT: PASS - Prisma can write to and read from PostgreSQL." : `\nRESULT: FAIL - ${failed} check(s) failed.`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("\nRESULT: FAIL - ", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
