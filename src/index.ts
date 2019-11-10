import WhatsAppClient from "./whatsapp";
import clientEventListeners from "./whatsapp/clientEventListeners";

const Main = async (): Promise<void> => {
  const whatsAppClient = await WhatsAppClient();

  clientEventListeners(whatsAppClient);
};

try {
  Main();
} catch (error) {
  console.log(error);
}
