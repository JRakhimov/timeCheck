import WhatsAppClient from "./whatsapp";

const Main = async (): Promise<void> => {
  await WhatsAppClient();
};

try {
  Main();
} catch (error) {
  console.log(error);
}
