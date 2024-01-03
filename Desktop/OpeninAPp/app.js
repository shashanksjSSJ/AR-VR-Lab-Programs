const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const CLIENT_ID = '99020234317-l27rjtg4978v1l75n5v3t6s778kf5of4.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04k3Ek4op05JWCgYIARAAGAQSNwF-L9Irk57z7OGCWNGGrz1Oz39zBXDo71EVpX1T1vybgIdqmD_GLHwEEWgxZ71f7rSDmxcfgAE'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
async function sendMail(){
    try {
        const accessToken = await oAuth2Client.getAccessToken()

        const transport = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                type: 'OAuth2', 
                user: 'shashanksj26@gmail.com',
                clientId: CLIENT_ID, 
                clientSecret: CLIENT_SECRET, 
                refreshToken: REFRESH_TOKEN, 
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from:'shashanksj26@gmail.com', 
            to: 'shashanksj.is20@rvce.edu.in', 
            subject: 'Hello from gmail using API', 
            text: "Hello From Gmail Email using API hope it works", 
        }; 

        const result = await transport.sendMail(mailOptions)
        return result
    } 
    catch (error) {
        return error; 
    }
}

async function sendVacationReply(messageId, recipientEmail) {
    try {
      // Fetch the email content using the messageId
      const emailDetails = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });
  
      // Extract the sender's email address
      const senderEmail = emailDetails.data.payload.headers.find(
        (header) => header.name === 'From'
      ).value;
  
      // Create a draft for the vacation reply
      const draft = await gmail.users.drafts.create({
        userId: 'me',
        resource: {
          message: {
            raw: createVacationReply(senderEmail, recipientEmail),
          },
        },
      });
  
      // Send the draft
      await gmail.users.drafts.send({
        userId: 'me',
        requestBody: {
          id: draft.data.id,
        },
      });
  
      return 'Vacation Reply sent successfully';
    } catch (error) {
      console.error('Error in sendVacationReply:', error);
      return 'Error sending Vacation Reply';
    }
  }
  
// Function to create a vacation reply message
function createVacationReply(senderEmail, recipientEmail) {
    const subject = 'Out of Office: [Your Subject]';
    const body = 'Thank you for your email. I am currently out of the office and will respond to your message as soon as possible.';
  
    const vacationReply = `From: ${senderEmail}\nTo: ${recipientEmail}\nSubject: ${subject}\n\n${body}`;
  
    // Encode the message to base64
    return Buffer.from(vacationReply).toString('base64');
  }
  
  async function listUnrepliedEmailsToday() {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  
    const today = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `is:unread after:${today}`,
    });
  
    const unrepliedEmails = response.data.messages || [];
    return unrepliedEmails;
  }

  async function getEmailDetails(emailId, threadId) {
    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: emailId,
        format: 'metadata',
        metadataHeaders: ['From'],
      });
  
      const headers = response.data.payload.headers;
      const senderEmail = headers.find(header => header.name === 'From').value;
  
      return { senderEmail, threadId };
    } catch (error) {
      console.error('Error getting email details:', error.message);
      throw error;
    }
  }

  async function sendVacationReply(senderEmail, threadId) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  
      const vacationReply = `
        <p>Thank you for your email!</p>
        <p>I'm currently out of the office and will respond to your email as soon as possible.</p>
        <p>Best regards,<br>Your Name</p>
      `;
  
      const rawVacationReply = Buffer.from(
        `From: ${process.env.EMAIL_ADDRESS}\r\n` +
        `To: ${senderEmail}\r\n` +
        'Content-Type: text/html; charset=utf-8\r\n' +
        'MIME-Version: 1.0\r\n' +
        `Subject: Re: Your Subject Here\r\n\r\n` +
        vacationReply
      ).toString('base64');
  
      await gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: rawVacationReply,
          threadId: threadId,
        },
      });
  
      console.log(`Vacation Reply sent to ${senderEmail}`);
    } catch (error) {
      console.error('Error sending Vacation Reply:', error.message);
      throw error;
    }
  }

  async function getEmailSender(gmail, messageId) {
    const message = await gmail.users.messages.get({ userId: 'me', id: messageId });
    const sender = message.data.payload.headers.find(header => header.name === 'From');
    return sender ? sender.value : null;
  }

  async function executeVacationReply() {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const unrepliedEmails = await listUnrepliedEmailsToday(gmail);

    for (const email of unrepliedEmails) {
      try {
        const senderEmail = await getEmailSender(gmail, email.id);
        await sendVacationReply(senderEmail, email.threadId);

        // Add label to indicate that a reply has been sent
        await addLabelAndMoveEmail(gmail, email.id, SENT_REPLY_LABEL);
      } catch (error) {
        console.error(`Error processing email ${email.id}: ${error.message}`);
      }
    }

    console.log('Vacation replies sent successfully');
  } catch (error) {
    console.error('Error executing Vacation Reply:', error.message);
  } finally {
    // Schedule the next execution in a random interval between 45 to 120 seconds
    const nextExecutionTime = Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000;
    setTimeout(executeVacationReply, nextExecutionTime);
  }
}
executeVacationReply().then(()=>console.log("excecution compelted")).catch(error=>console.error('Error during excecution', error)); 