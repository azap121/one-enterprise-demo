export function track(event: string, properties?: Record<string, unknown>) {
  if (properties) {
    console.info(`[folder-recommendations-chat-assistant] ${event}`, properties);
    return;
  }
  console.info(`[folder-recommendations-chat-assistant] ${event}`);
}

