# JFUP - Jellyfin Upload Portal

A web-based file upload portal with user management and branch-based organization.

## Features

- 🔐 User Authentication
- 👥 User Management (Admin Panel)
- 📂 Branch-based File Organization
- 📤 Drag & Drop File Upload
- 🎯 Category-based File Sorting
- 🔄 Progress Tracking
- 🎨 Modern UI Design

## Installation

1. Clone the repository:
```bash
git clone https://github.com/random-username/jfup.git
cd jfup
```

2. Install dependencies:
```bash
npm install
```

3. Create the upload directories:
```bash
mkdir -p upload
```
4. Permissions for Jellyfin:
```
# Create a shared group for jellyfin-related access
sudo groupadd jellygroup

# Add both users to the group
sudo usermod -aG jellygroup jellyfin
sudo usermod -aG jellygroup your-user-name

# Change group ownership of the folder
sudo chown -R your-user-name:jellygroup ~/jfup/upload

# Set folder permissions: owner and group get full access, others none
sudo chmod -R 770 ~/jfup/upload

# Optional: ensure new files inherit the group
sudo find ~/jfup/upload -type d -exec chmod g+s {} \;

# Restart the jellyfin service
sudo systemctl restart jellyfin
```

5. Start the server:
```bash
node server.js
```



The application will be available at `YOUR-IP-ADDRESS:3000`

## Dependencies

- Node.js (v14 or higher)
- NPM packages:
  - express
  - sqlite3
  - bcrypt
  - multer
  - cors

## Default Admin Account

Upon first run, a default admin account is created:
- Username: admin
- Password: admin123
- Branch: Delhi

## Project Structure

```
jfup/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── table.html
│   ├── style.css
│   ├── script.js
│   ├── login.js
│   ├── signup.js
│   ├── table.js
│   └── upload-img.png
├── server.js
├── users.db
└── README.md
```

## File Organization

Files are automatically organized in the following structure:
```
upload/
├── Branch-Documents/
├── Branch-Audios/
├── Branch-Photos/
└── Branch-Videos/
    └── FolderName-DD-MM-YY/
```

## Security Features

- Password Hashing (bcrypt)
- Session-based Authentication
- Path Traversal Protection
- File Name Sanitization

## User Types

1. Admin
   - Full access to user management
   - Can create/edit/delete users
   - Access to all upload features

2. Normal User
   - Upload access for their branch
   - Cannot access admin features

## Development

To modify the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on the GitHub repository.
