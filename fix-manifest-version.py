import json

def update_manifest_version(file_path, old_version, new_version):
    with open(file_path, 'r') as file:
        data = json.load(file)

    if 'manifest_version' in data and data['manifest_version'] == old_version:
        data['manifest_version'] = new_version

    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)

if __name__ == "__main__":
    file_path = "build/temp/manifest.json"
    update_manifest_version(file_path, 2, 3)
