const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const readline = require("readline");

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync("package.json"));
  return packageJson.version;
}
// Checks the current migrations in prisma/migrations and automtically increments the order number
function getNextKey(migrationsDir) {
  const folders = fs
    .readdirSync(migrationsDir)
    .filter((file) =>
      fs.statSync(path.join(migrationsDir, file)).isDirectory(),
    );
  const keys = folders
    .map((folder) => parseInt(folder.split("_")[0], 10))
    .filter(Number.isInteger);
  return keys.length > 0 ? Math.max(...keys) + 1 : 0; // Increment the maximum key
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Please enter the migration name (eg.: add-user-column): ",
  (given_name) => {
    const migrationsDir = path.join(__dirname, "migrations");
    const key = getNextKey(migrationsDir);
    const version = getCurrentVersion();
    const migrationPath = path.join(
      migrationsDir,
      `${key}_${version}_${given_name}`,
    );

    // Create the migration directory
    fs.mkdirSync(migrationPath, { recursive: true });

    // Build the command to run
    const command = `
        git show HEAD:prisma/schema.prisma > prisma/schema_old.prisma && 
        npx prisma migrate diff --from-schema-datamodel prisma/schema_old.prisma --to-schema-datamodel prisma/schema.prisma --script > ${migrationPath}/migration.sql && 
        rm prisma/schema_old.prisma
    `.replace(/\n/g, " "); // Remove newlines for exec command

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(
        `Migration created successfully at: ${migrationPath}/migration.sql`,
      );
    });

    rl.close();
  },
);
