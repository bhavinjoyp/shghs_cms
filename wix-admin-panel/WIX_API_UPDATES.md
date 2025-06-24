# WIX API Integration Updates

## Overview
Updated the WIX admin panel to use the correct WIX Media Manager API endpoints according to the official documentation.

## Changes Made

### 1. API Endpoint Updates
- **Base URL**: `https://www.wixapis.com/site-media/v1`
- **Authorization**: Updated from `Bearer ${WIX_API_KEY}` to use `WIX_API_KEY` directly (as it already includes the proper format)
- **Removed**: `wix-site-id` header (not needed for site-media API)

### 2. Folder Management
- **List Folders**: `GET /site-media/v1/folders?parentFolderId={id}`
- **Create Folder**: `POST /site-media/v1/folders` with `displayName` and `parentFolderId`
- **Get Folder**: `GET /site-media/v1/folders/{folderId}`

Updated folder creation to use hierarchical structure where folders are created step by step with proper parent-child relationships.

### 3. File Import
- **Bulk Import**: `POST /site-media/v1/bulk/files/import-v2`

#### Import API Requirements:
- Files must be imported from publicly accessible URLs
- Proper MIME type detection and media type validation

#### Import Request Format:
```json
{
  "url": "https://public-url-to-file",
  "displayName": "filename.jpg",
  "parentFolderId": "folder-id-or-media-root",
  "mimeType": "image/jpeg",
  "mediaType": "IMAGE",
  "private": false
}
```

### 4. Bulk Import Features
- Support for importing up to 100 files at once
- Proper error handling for individual file failures
- Returns detailed results with success/failure status for each file

### 5. New Utility Functions
- `ensureFolderExists()`: Creates hierarchical folder structure
- `bulkUploadImages()`: Handles bulk file imports
- Enhanced error handling and logging


### 7. Folder Structure
Files are organized using the pattern:
```
/{mediaType}/{YYYY}/{MM}/{sanitized-title}/
```

Example: `/gallery/2025/06/summer-vacation/`

## API Endpoints Used

### Folders
- `GET /site-media/v1/folders` - List folders
EXAMPLE:
curl -X GET \
  'https://www.wixapis.com/site-media/v1/folders?parentFolderId=root-media&sort.fieldName=displayName&sort.order=DESC&paging.limit=2' \
  -H 'Authorization: <AUTH>'

- `POST /site-media/v1/folders` - Create folder
example : 
curl -X POST \
  'https://www.wixapis.com/site-media/v1/folders' \
  -H 'Authorization: <AUTH>' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "displayName": "New Folder",
    "parentFolderId": "25284aa06584441ea94338fdcfbaba12"
  }'
- `POST /site-media/v1/folders/search` - Search folders available to get folder name,id,parent folder id
example:
curl -X POST \
  'https://www.wixapis.com/site-media/v1/folders/search' \
  -H 'Authorization: <AUTH>'
  --data-binary '{
    "rootFolder": "MEDIA_ROOT",
    "sort": {
      "fieldName": "displayName",
      "order": "DESC"
    },
    "paging": {
      "limit": 20
    }
  }'

### Files
- `POST /site-media/v1/bulk/files/import-v2` - Bulk import files
- get file url from JSON response of POST
- `DELETE `/site-media/v1/bulk/files/delete` - Delete file

## Environment Variables Required
```bash
WIX_API_KEY=IST.eyJraWQiOiJQb3p...  # Full API key with IST prefix
WIX_SITE_ID=your-site-id
WIX_ACCOUNT_ID=your-account-id
```

## File Upload Process
1. User selects file(s) via UI
2. File is uploaded directly to wix through wix API
3. Public URL is obtained from API response

## Notes
- The WIX import API requires publicly accessible URLs
- Files undergo processing and may not be immediately available (status: PENDING)
- The `operationStatus` field indicates when files are ready (READY/PENDING/FAILED)
