import json


def convert_background_for_firefox(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    background = data.get("background", {})
    service_worker = background.pop("service_worker", None)

    if service_worker:
        background["scripts"] = [service_worker]
        data["background"] = background

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
        file.write("\n")


if __name__ == "__main__":
    convert_background_for_firefox("build/temp/manifest.json")
