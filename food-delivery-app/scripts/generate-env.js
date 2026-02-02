const fs = require("fs");
const path = require("path");

// ✅ Angular default env folder is "environments"
const outPath = path.join(__dirname, "../src/environment/environment.prod.ts");
const outDir = path.dirname(outPath);

// ✅ make sure folder exists on Vercel
fs.mkdirSync(outDir, { recursive: true });

const envFile = `
export const environment = {
  production: true,
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || ""}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ""}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ""}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ""}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ""}",
    appId: "${process.env.FIREBASE_APP_ID || ""}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || ""}",
  }
};
`;

// fs.writeFileSync(
//   path.join(__dirname, "../src/environment/environment.prod.ts"),
//   envFile
// );

console.log("✅ environment.prod.ts generated");
