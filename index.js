import TgBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { get_pdf, search_pdf } from "./scrapper.js";
dotenv.config();
const bot = new TgBot(process.env.TOKEN, { polling: true });

let array = [];
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const msgTxt = msg.text.toLowerCase();

  // Process the incoming message here
  if (msgTxt === "/start") {
    bot.sendMessage(
      chatId,
      "Welcome to PDF Downloader\n\nCreated by @channel_m4dd0x:\n\n\nFollow:\nInstagram: www.instagram.com/m4dd0x_\n\nGithub: www.github.com/m4dd0c"
    );
  }
  if (msgTxt === "/main") {
    bot.sendMessage(chatId, "Main channel:\n@channel_m4dd0x");
  }
  if (msgTxt === "/about") {
    bot.sendMessage(
      chatId,
      "Created by @channel_m4dd0x:\n\n\nFollow:\nInstagram: www.instagram.com/m4dd0x_\n\nGithub: www.github.com/m4dd0c"
    );
  }
  if (!msgTxt.startsWith("/")) {
    try {
      bot.sendMessage(chatId, "Please wait, retrieving pdfs...");
      array = await search_pdf(msgTxt);
      if (!array || array.length <= 0) {
        bot.sendMessage(
          chatId,
          "No PDF Found!\nTry again with other query or check your internet connection."
        );
        throw new Error("couldn't retrieve songs.");
      }
      const keyboard = [];
      for (let i in array) {
        keyboard.push([{ text: array[i].title, callback_data: i.toString() }]);
      }

      await bot.sendMessage(chatId, "Choose a PDF to download", {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (error) {
      console.error("Error sending document", error.message);
    }
  }
});

bot.on("callback_query", async (cb_query) => {
  try {
    const action = cb_query.data;
    const msg = cb_query.message;
    const chatId = msg.chat.id;
    const pdf_page = array[action].link;
    const documentUrl = await get_pdf(pdf_page);
    await bot.deleteMessage(chatId, msg.message_id);
    await bot.sendMessage(chatId, "Streaming the PDF, please wait...");
    await bot.sendDocument(chatId, documentUrl);
  } catch (error) {
    console.error("Error sending document callback_query_err", error.message);
  }
});
console.log("bot is running...");
