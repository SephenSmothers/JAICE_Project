import { useEffect, useState } from "react";
import { api } from "@/global-services/api";

export type NotificationSettings = {
    app_updates_inapp: boolean;
    app_updates_email: boolean;
    app_updates_sms: boolean;
    email_parsing_inapp: boolean;
    email_parsing_email: boolean;
    email_parsing_sms: boolean;
    reminders_inapp: boolean;
    reminders_email: boolean;
    reminders_sms: boolean;
    system_inapp: boolean;
    system_email: boolean;
    system_sms: boolean;
};

export function useNotificationSettings() {
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await api("/api/notifications/settings", { method: "GET" });
                setSettings(res.data);
            } catch (e) {
                console.error("Failed to load notification settings:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function updateSetting<K extends keyof NotificationSettings>(
        key: K,
        value: NotificationSettings[K]
    ) {
        if (!settings) return;

        const updated = { ...settings, [key]: value };
        setSettings(updated);

        try {
            await api("/api/notifications/settings", {
                method: "POST",
                body: JSON.stringify(updated),
            });
        } catch (e) {
            console.error("Failed to save notification settings:", e);
        }
    }

    return { settings, updateSetting, loading };
}