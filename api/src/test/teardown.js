export default async () => {
  console.log("Stopping Localstack container...");
  await globalThis.localstackContainer.stop();
};
