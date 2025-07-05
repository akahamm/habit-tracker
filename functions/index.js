/** @format */

// /** @format */

// const { onDocumentWritten } = require("firebase-functions/v2/firestore");
// const { initializeApp } = require("firebase-admin/app");
// const { google } = require("googleapis");
// const serviceAccount = require("./google-service-account.json");

// initializeApp();

// const sheets = google.sheets("v4");
// const auth = new google.auth.JWT({
//   email: serviceAccount.client_email,
//   key: serviceAccount.private_key,
//   scopes: ["https://www.googleapis.com/auth/spreadsheets"]
// });

// exports.logGoalToSheet = onDocumentWritten(
//   {
//     region: "asia-northeast3",
//     document: "users/{userId}/entries/{dateStr}"
//   },
//   async (event) => {
//     const { userId, dateStr } = event.params;
//     const data = event.data?.after?.data(); // ✅ 함수 호출로 변경

//     console.log("📌 Function triggered:", dateStr, userId);
//     console.log("📦 Raw event data:", JSON.stringify(data));

//     const entry = data.entries?.[dateStr];

//     if (!entry || !entry.goals || !Array.isArray(entry.goals)) {
//       console.log("⛔ No goals found in entry for", dateStr);
//       return;
//     }

//     const rows = entry.goals.map((goal) => [
//       dateStr,
//       userId,
//       goal.name || "",
//       goal.type || "",
//       goal.value !== undefined ? goal.value : "",
//       goal.target || "",
//       entry.moodScore || "",
//       entry.moodNote || "",
//       new Date().toISOString(),
//       event.data?.before?.exists ? "true" : "false"
//     ]);

//     console.log("📤 Rows to append:", JSON.stringify(rows));

//     try {
//       await auth.authorize();
//       console.log("✅ Google auth successful");

//       const response = await sheets.spreadsheets.values.append({
//         auth,
//         spreadsheetId: "16PHn-Lv4BQjtF229plaxh-2njMx7Y_EwPXwT_RIihX4",
//         range: "Sheet1!A2",
//         valueInputOption: "RAW",
//         requestBody: { values: rows }
//       });

//       console.log("✅ Google Sheet updated:", response.status);
//     } catch (error) {
//       console.error("❌ Error appending to Google Sheets:", error);
//     }
//   }
// );

// data = {
//   entries: {
//     "2025-07-02": {
//       goals: [
//         {
//           name: "운동",
//           type: "checkbox",
//           target: "25",
//           color: "bg-red-500",
//           value: true
//         },
//         {
//           name: "영어회화",
//           type: "number",
//           target: "20",
//           color: "bg-red-500",
//           value: "20"
//         }
//       ],
//       moodScore: null,
//       moodNote: ""
//     },
//     "2025-07-01": {
//       goals: [
//         {
//           name: "운동",
//           type: "checkbox",
//           target: "25",
//           color: "bg-red-500",
//           value: true
//         },
//         {
//           name: "영어회화",
//           type: "number",
//           target: "20",
//           color: "bg-red-500",
//           value: "20"
//         }
//       ],
//       moodScore: null,
//       moodNote: ""
//     }
//   }
// };
