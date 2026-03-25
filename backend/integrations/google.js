const { google } = require('googleapis');
const { BrevoClient } = require('@getbrevo/brevo');

// Setup OAuth2 Client (for Calendar/Sheets)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
}

// Setup Brevo API Client
let brevoClient;
if (process.env.BREVO_API_KEY) {
  console.log('Initializing Brevo with Key:', process.env.BREVO_API_KEY.substring(0, 10) + '...');
  brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
} else {
  console.log('BREVO_API_KEY is missing from environment variables');
}

// 1. Google Sheets Sync
const syncToSheets = async (expense) => {
  if (!process.env.GOOGLE_SHEETS_ID) return console.log('Google Sheets Sync Skipped: Missing ID');
  try {
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          expense.date.toISOString().split('T')[0],
          expense.vendor,
          expense.amount,
          expense.billNumber || '',
          expense.category,
          expense.status,
          new Date().toISOString()
        ]]
      }
    });
    console.log('Successfully synced to Google Sheets');
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error.message);
  }
};

// 2. Google Calendar Reminder
const createCalendarReminder = async (expense) => {
  if (!process.env.GOOGLE_REFRESH_TOKEN) return console.log('Google Calendar Skipped: Missing Auth');
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const eventDate = new Date(expense.date);
    eventDate.setDate(eventDate.getDate() + 7); // Due exactly 7 days after expense
    
    await calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: `Bill Due: ${expense.vendor}`,
        description: `You have an unpaid bill of $${expense.amount} for ${expense.vendor}.`,
        start: { date: eventDate.toISOString().split('T')[0] },
        end: { date: eventDate.toISOString().split('T')[0] },
      }
    });
    console.log('Successfully created Calendar reminder');
  } catch (error) {
    console.error('Error creating Calendar reminder:', error.message);
  }
};

// 3. Brevo Transactional Email Reminder
const sendEmailReminder = async (toEmail, expense) => {
  if (!brevoClient || !process.env.BREVO_FROM_EMAIL) {
    return console.log('Email Skipped: Missing Brevo Credentials');
  }
  
  try {
    await brevoClient.transactionalEmails.sendTransacEmail({
      subject: `Action Required: Unpaid Bill - ${expense.vendor}`,
      htmlContent: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #6366f1;">Unpaid Expense Reminder</h2>
          <p>You have an unpaid expense that needs attention.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <ul>
              <li><strong>Vendor:</strong> ${expense.vendor}</li>
              <li><strong>Amount:</strong> $${expense.amount.toFixed(2)}</li>
              <li><strong>Date:</strong> ${expense.date.toISOString().split('T')[0]}</li>
            </ul>
          </div>
          <p>Please log in to your dashboard to mark this as paid.</p>
        </div>
      `,
      sender: { name: process.env.BREVO_FROM_NAME || "Expensify AI", email: process.env.BREVO_FROM_EMAIL },
      to: [{ email: toEmail }]
    });
    console.log('Successfully sent Brevo Email reminder');
  } catch (error) {
    console.error('Error sending Brevo Email reminder:', error.message);
  }
};

// 4. Brevo Verification Email
const sendVerificationEmail = async (toEmail, name, token) => {
  if (!brevoClient || !process.env.BREVO_FROM_EMAIL) {
    return console.log('Verification Email Skipped: Missing Brevo Credentials');
  }

  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log(`Generating verification link with FRONTEND_URL: ${frontendUrl}`);
    const verificationUrl = `${frontendUrl}/verify/${token}`;
    await brevoClient.transactionalEmails.sendTransacEmail({
      subject: 'Verify Your Expensify AI Account',
      htmlContent: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #6366f1;">Welcome to Expensify AI, ${name}!</h2>
          <p>Please click the button below to verify your email address and activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #64748b; font-size: 0.875rem;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #6366f1; font-size: 0.875rem; word-break: break-all;">${verificationUrl}</p>
        </div>
      `,
      sender: { name: process.env.BREVO_FROM_NAME || "Expensify AI", email: process.env.BREVO_FROM_EMAIL },
      to: [{ email: toEmail, name: name }]
    });
    console.log('Successfully sent Brevo Verification email');
  } catch (error) {
    console.error('Error sending Brevo Verification email:', error.message);
  }
};

module.exports = { syncToSheets, createCalendarReminder, sendEmailReminder, sendVerificationEmail };
