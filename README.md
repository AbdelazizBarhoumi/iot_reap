# IoT REAP Platform

[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?style=flat-square&logo=php&logoColor=white)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A modern, full-stack IoT Remote Education and Administration Platform built with Laravel 12 and React 19. The platform provides secure remote access to virtual machines via Proxmox VE and Apache Guacamole integration, enabling seamless IoT lab management for educational institutions.

---

## 🚀 Features

### Authentication & Security
- **User Authentication** — Secure login, registration, and password reset via Laravel Fortify
- **Two-Factor Authentication (2FA)** — TOTP-based 2FA with recovery codes
- **Role-Based Access Control** — Engineer, Admin, and Security Officer roles
- **Session Management** — Cookie-based web sessions with CSRF protection

### User Experience
- **Modern Dashboard** — Responsive dashboard with real-time metrics
- **Dark/Light Mode** — System and manual appearance preferences
- **Profile Management** — Update profile information and preferences
- **Password Management** — Secure password change functionality

### Infrastructure (Planned)
- **Proxmox VE Integration** — VM provisioning and management across multiple nodes
- **Apache Guacamole** — Clientless remote desktop access (RDP, VNC, SSH)
- **MQTT Support** — IoT device communication
- **AI Scheduler** — Intelligent resource allocation

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| PHP | 8.2+ | Runtime |
| Laravel | 12.x | Web Framework |
| Laravel Fortify | 1.30+ | Authentication |
| Inertia.js | 2.x | Server-side adapter |
| MySQL/SQLite | — | Database |
| Redis | 7.x | Cache & Queues |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Inertia.js | 2.x | Client-side adapter |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 4.x | Styling |
| Radix UI | Latest | Headless Components |
| Shadcn/ui | Latest | UI Components |
| Lucide React | Latest | Icons |

### Development Tools
| Tool | Purpose |
|------|---------|
| Laravel Pint | PHP Code Style |
| ESLint | JavaScript/TypeScript Linting |
| Prettier | Code Formatting |
| PHPUnit | PHP Testing |
| Laravel Sail | Docker Environment |

---

## 📋 Requirements

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 20 LTS
- **npm** >= 10.x
- **Database**: SQLite (default) or MySQL 8.x
- **Redis** (optional, for caching and queues)

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/iot_reap.git
cd iot_reap
```

### 2. Quick Setup (Recommended)

Run the automated setup script:

```bash
composer setup
```

This will:
- Install PHP dependencies
- Copy `.env.example` to `.env`
- Generate application key
- Run database migrations
- Install npm dependencies
- Build frontend assets

### 3. Manual Installation

If you prefer manual installation:

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create SQLite database (if using SQLite)
touch database/database.sqlite

# Run database migrations
php artisan migrate

# Install Node.js dependencies
npm install

# Build frontend assets
npm run build
```

---

## ⚙️ Configuration

### Environment Variables

Configure your `.env` file with the following key settings:

```env
# Application
APP_NAME="IoT REAP"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Database (SQLite - default)
DB_CONNECTION=sqlite

# Database (MySQL - optional)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=iot_reap
# DB_USERNAME=root
# DB_PASSWORD=

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Mail (for password resets)
MAIL_MAILER=log
```

### Two-Factor Authentication

2FA is enabled by default via Laravel Fortify. Users can enable/disable it in their settings.

---

## 🖥️ Usage

### Development Server

Start all services concurrently (recommended):

```bash
composer dev
```

This launches:
- **Laravel Server** at `http://localhost:8000`
- **Vite Dev Server** with HMR
- **Queue Worker** for background jobs

Alternatively, start services individually:

```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev

# Terminal 3: Queue worker (optional)
php artisan queue:listen
```

### SSR Mode (Server-Side Rendering)

```bash
composer dev:ssr
```

### Production Build

```bash
npm run build
```

### Running Tests

```bash
# Run all tests
composer test

# PHP tests only
php artisan test

# Lint PHP code
composer lint

# Type check TypeScript
npm run types

# Lint frontend code
npm run lint

# Format code
npm run format
```

---

## 📁 Project Structure

```
iot_reap/
├── app/
│   ├── Actions/           # Fortify authentication actions
│   ├── Http/
│   │   ├── Controllers/   # HTTP controllers
│   │   ├── Middleware/    # Custom middleware
│   │   └── Requests/      # Form request validation
│   ├── Models/            # Eloquent models
│   └── Providers/         # Service providers
├── bootstrap/             # Application bootstrap
├── config/                # Configuration files
├── database/
│   ├── factories/         # Model factories
│   ├── migrations/        # Database migrations
│   └── seeders/           # Database seeders
├── docs/                  # Project documentation
│   ├── layers/            # Technical layer guides
│   ├── phases/            # Sprint phase documentation
│   └── sprint-reviews/    # Sprint review notes
├── public/                # Web root
├── resources/
│   ├── css/               # Stylesheets
│   ├── js/
│   │   ├── components/    # React components
│   │   │   └── ui/        # Shadcn/ui components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Page layouts
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   │   ├── auth/      # Authentication pages
│   │   │   └── settings/  # Settings pages
│   │   └── types/         # TypeScript types
│   └── views/             # Blade templates
├── routes/
│   ├── web.php            # Web routes
│   ├── settings.php       # Settings routes
│   └── console.php        # Console commands
├── storage/               # File storage
├── tests/                 # Test files
├── .env.example           # Environment template
├── composer.json          # PHP dependencies
├── package.json           # Node.js dependencies
├── vite.config.ts         # Vite configuration
└── tailwind.config.ts     # Tailwind configuration
```

---

## 🎨 UI Components

The project uses **Shadcn/ui** components built on **Radix UI** primitives:

- Alert, Avatar, Badge
- Breadcrumb, Button, Card
- Checkbox, Collapsible, Dialog
- Dropdown Menu, Input, Label
- Navigation Menu, Select, Separator
- Sheet, Sidebar, Skeleton
- Spinner, Toggle, Tooltip
- Input OTP (for 2FA)

---

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| `PHASES.md` | Project phase navigation guide |
| `layers/BACKEND.md` | Laravel coding standards |
| `layers/FRONTEND.md` | React/TypeScript guidelines |
| `layers/SECURITY.md` | Security best practices |
| `layers/TESTING.md` | Testing conventions |
| `layers/API_CONTRACTS.md` | API endpoint specifications |
| `layers/INFRA.md` | Infrastructure setup |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **PHP**: Follow PSR-12. Run `composer lint` before committing.
- **TypeScript/React**: Use ESLint and Prettier. Run `npm run lint` and `npm run format`.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Laravel](https://laravel.com/) - The PHP framework for web artisans
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Inertia.js](https://inertiajs.com/) - The modern monolith
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
