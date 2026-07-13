import json
from pathlib import Path


def remove_sponsored_welcome_page(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    data.pop("background", None)

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
        file.write("\n")

    Path("build/temp/background.js").unlink(missing_ok=True)


if __name__ == "__main__":
    remove_sponsored_welcome_page("build/temp/manifest.json")
