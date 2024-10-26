// const { OpenAI } = require('openai');

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//   });
  

// const categorizeEmail = async (content) => {
// const prompt = `Categorize the following email content as one of: Interested, Not Interested, More Information.\n\n"${content}"\n\nLabel:`;

// const response = await openai.chat.completions.create({
//     model: 'davinci-002',
//     messages: [{ role: 'user', content: prompt }],
// });

// const label = response.choices[0].message.content.trim();
// return label;
// };

// const generateReply = async (category) => {
// let prompt;
// switch (category) {
//     case 'Interested':
//     prompt = 'Generate a reply asking if the recipient would like to hop on a demo call.';
//     break;
//     case 'Not Interested':
//     prompt = 'Generate a polite response acknowledging their lack of interest.';
//     break;
//     case 'More Information':
//     prompt = 'Generate a response asking what additional information they need.';
//     break;
//     default:
//     prompt = 'Generate a polite generic reply.';
// }

// const response = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     messages: [{ role: 'user', content: prompt }],
// });

// const reply = response.choices[0].message.content.trim();
// return reply;
// };

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_APP_KEY);

async function categorizeEmail(subject, body) {
  const prompt = `Categorize the following email content as one of: Interested, Not Interested, More Information. Answer should one of three keywords only nothing else.:\n
                  Subject: ${subject}\n
                  Body: ${body}`;

  try {
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
                              .generateContent(prompt);

    const responseText = result.response.text().trim();
    console.log("Suggested Reply:", responseText);
    return responseText; // Use this for automated responses
  } catch (error) {
    console.error("Error:", error.message);
  }
}

const generateReply = async (category) => {
let prompt;
switch (category) {
    case 'Interested':
    prompt = 'Generate a reply asking if the recipient would like to hop on a demo call. only include the body of the email nothing else';
    break;
    case 'Not Interested':
    prompt = 'Generate a polite email response acknowledging their lack of interest. only include the body of the email nothing else';
    break;
    case 'More Information':
    prompt = 'Generate a response asking what additional information they need. only include the body of the email nothing else';
    break;
    default:
    prompt = 'Generate a polite generic reply. only include the body of the email nothing else';
}

const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
                              .generateContent(prompt);

const reply = result.response.text().trim();
console.log("Suggested Reply:", reply);
return reply;
};

module.exports = { categorizeEmail, generateReply};