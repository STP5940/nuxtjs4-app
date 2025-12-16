import type * as locales from "@nuxt/ui/locale";

// แผนที่ระหว่างรหัสภาษาของ i18n กับไฟล์ locale ของ Nuxt UI
// เนื่องจากบางรหัสภาษาอาจมีรูปแบบที่แตกต่างกัน
// ตัวอย่างเช่น "zh-CN" ใน i18n อาจตรงกับ "zh_cn" ใน Nuxt UI
export const localeMap: Record<string, keyof typeof locales> = {
    "zh-CN": "zh_cn",
    "ug-CN": "ug_cn",
    "zh-TW": "zh_tw",
    "pt-BR": "pt_br",
    "nb-NO": "nb_no",
    "fa-IR": "fa_ir",
    "de-CH": "de_ch",
};

export function getUiLocale(locale: string): keyof typeof locales {
    return (localeMap[locale] || locale) as keyof typeof locales;
}