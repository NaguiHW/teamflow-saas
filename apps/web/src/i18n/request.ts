import { getRequestConfig } from "next-intl/server";
import { messages } from "./messages";

export default getRequestConfig(async () => ({
  locale: "en",
  timeZone: "America/Panama",
  messages: messages.en,
}));
