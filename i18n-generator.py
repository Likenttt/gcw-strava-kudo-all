import os
import json
from googletrans import Translator


locales = {
    "ar": "Arabic",
    "am": "Amharic",
    "bg": "Bulgarian",
    "bn": "Bengali",
    "ca": "Catalan",
    "cs": "Czech",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "en_GB": "English (Great Britain)",
    "en_US": "English (USA)",
    "es": "Spanish",
    "es_419": "Spanish (Latin America and Caribbean)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fil": "Filipino",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Indonesian",
    "it": "Italian",
    "ja": "Japanese",
    "kn": "Kannada",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "ml": "Malayalam",
    "mr": "Marathi",
    "ms": "Malay",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt_BR": "Portuguese (Brazil)",
    "pt_PT": "Portuguese (Portugal)",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr": "Serbian",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "vi": "Vietnamese",
    "zh_CN": "Chinese (China)",
    "zh_TW": "Chinese (Taiwan)"
}

default_message = {
    "kudo_all": {
        "message": "Kudo All"
    },
    "AppName": {
        "message": "Garmin Connect Web Kudo All"
    },
    "AppDescription": {
        "message": "Give kudos to your elite athletes friends in one click",
    }
}


def translate_message(message, target_locale):
    translator = Translator()
    translated_message = translator.translate(message, dest=target_locale).text
    return translated_message


def create_locale_dirs():
    base_path = "src/_locales"
    if not os.path.exists(base_path):
        os.makedirs(base_path)

    for code, language in locales.items():
        locale_path = os.path.join(base_path, code)
        if not os.path.exists(locale_path):
            os.makedirs(locale_path)

        messages_path = os.path.join(locale_path, "messages.json")
        if not os.path.exists(messages_path):
            with open(messages_path, "w", encoding="utf-8") as f:
                # translated_message = translate_message(
                #     default_message["kudo_all"]["message"], code)
                # translated_AppName = translate_message(
                #     default_message["AppName"]["message"], code)
                # translated_content = {
                #     "kudo_all": {
                #         "message": translated_message
                #     },
                #     "AppName": {
                #         "message": translated_AppName
                #     }
                # }
                f.write(json.dumps(default_message,
                        ensure_ascii=False, indent=2))
                # f.write(json.dumps(translated_content,
                #         ensure_ascii=False, indent=2))


if __name__ == "__main__":
    create_locale_dirs()
