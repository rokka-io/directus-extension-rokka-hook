# directus-extension-rokka-hook

A Directus extension, synchronising images and files from Directus to [rokka.io](https://rokka.io/).

## How it works
This extension will react to the Directus `file.upload` and `file.deleted` [events](https://docs.directus.io/extensions/hooks/#action-events).

Rokka computes a hash of the file, this way, same file uploaded several time is only stored once. This hash will be stored on the Directus `metadata` field, with the key `rokka_hash`. Therefore, any frontend application can querry this metadata and use it to forge the URL of the image on Rokka. Read more [here](https://rokka.io/documentation/guides/best-practices-for-stack-configurations.html) about accessing image of Rokka throught stacks.

### Upload
On upload (UI or API), if the file mime type is supported/activated, the file will be sent to Rokka and Rokka hash will be stored in the Directus file metadata.

### Delete
When the file will be deleted, the extension will ensure that no other Directus file is using the same Rokka file. If the deleted file is the only one, then the extension will also delete the file on Rokka

## Installation
Clone the repository, and build the exention. Copy the single `index.js` from the `dist` folder into a `rokka-extension` folder in the `<directus_install>/extensions/hooks`

WIP : I will package this extension and script the build and install.

## Extension configuration
This extension takes its configuration from environment variables.

### ROKKA_DISABLED
Disable the Rokka extension

```
ROKKA_DISABLED=true
```

### ROKKA_ORGANIZATION
The name of your organization on Rokka

```
ROKKA_ORGANIZATION=liip-development
```

**Mandatory**: If this environment variable is not there, the extension will not perform anything.

### ROKKA_API_KEY
The API Key to connect to Rokka. You can generate new ones [here](https://rokka.io/dashboard/#/apikeys).

```
ROKKA_API_KEY=<your_rokka_key>
```
**Mandatory**: If this environment variable is not there, the extension will not perform anything.

### ROKKA_MIME_TYPES
A coma seperated values of the mime files types you want to synchronise

```
ROKKA_MIME_TYPES="application/pdf,image/png"
```

**IMPORTANT**: To work, the mime types present here must be part of the ones that Rokka supports.

If left empty, the extension will be activated for all the mime types supported by rokka.
