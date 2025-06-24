# Wix Admin Panel

This project is a Wix Admin Panel built using Next.js and TypeScript. It allows administrators to manage images and news articles, integrating with the Wix CMS for content management.

## Features

- User authentication with username/password.
- Image upload functionality with thumbnail generation.
- Drag-and-drop interface for reordering images in galleries.
- Preview content before publishing.
- Integration with Wix API for managing content.
- YouTube link integration for both gallery and news articles.

## Project Structure

```
wix-admin-panel
├── src
│   ├── app
│   │   ├── page.tsx          # Main entry point for the application
│   │   ├── layout.tsx        # Layout structure for the application
│   │   ├── login
│   │   │   └── page.tsx      # Login page component
│   │   ├── dashboard
│   │   │   └── page.tsx      # Dashboard view for the admin
│   │   ├── gallery
│   │   │   ├── page.tsx      # Gallery page for image management
│   │   │   └── upload
│   │   │       └── page.tsx  # Image upload functionality
│   │   └── news
│   │       ├── page.tsx      # News page for displaying articles
│   │       └── create
│   │           └── page.tsx  # Create news article component
│   ├── components
│   │   ├── ui
│   │   │   ├── Button.tsx     # Button component
│   │   │   ├── Input.tsx      # Input component
│   │   │   └── Modal.tsx      # Modal component
│   │   ├── ImageUpload.tsx    # Image upload component
│   │   ├── DragDropGallery.tsx # Drag-and-drop gallery component
│   │   └── Preview.tsx        # Preview component for content
│   ├── lib
│   │   ├── wix-api.ts         # Functions for interacting with the Wix API
│   │   ├── wix-media.ts       # Functions for WIX Media integration
│   │   ├── supabase.ts        # Functions for Supabase integration
│   │   └── auth.ts            # Functions for user authentication
│   ├── types
│   │   └── index.ts           # TypeScript interfaces and types
│   └── styles
│       └── globals.css        # Global CSS styles
├── public
│   └── favicon.ico            # Favicon for the application
├── package.json               # npm configuration file
├── next.config.js             # Next.js configuration settings
├── tailwind.config.js         # Tailwind CSS configuration settings
├── tsconfig.json              # TypeScript configuration file
└── README.md                  # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd wix-admin-panel
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables for Wix API.

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage Guidelines

- Use the login page to authenticate as an admin.
- Navigate to the dashboard to view an overview of the application.
- Use the gallery page to upload and manage images.
- Create and manage news articles through the news section.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.