# SnapWrite

Lightweight ASP.NET Core backend with a Next.js frontend scaffold. This repository contains the API server (C#) and the frontend app (TypeScript/Next.js).

## Quick start

Prerequisites:

- .NET SDK (6+)
- Node.js (16+)
- pnpm (recommended) or npm

Run backend:

```sh
dotnet restore
dotnet build
dotnet run --project snapwrite/snapwrite.csproj
```

Run frontend:

```sh
cd snapwrite/frontend-web
pnpm install    # or: npm install
pnpm run dev    # or: npm run dev
```

API requests examples are in [snapwrite/snapwrite.http](snapwrite/snapwrite.http).

## Project layout

- [snapwrite/Program.cs](snapwrite/Program.cs) — app entry
- [snapwrite/snapwrite.csproj](snapwrite/snapwrite.csproj) — backend project file
- [snapwrite/appsettings.json](snapwrite/appsettings.json), [snapwrite/appsettings.Development.json](snapwrite/appsettings.Development.json) — configuration
- [snapwrite/Controllers/AuthController.cs](snapwrite/Controllers/AuthController.cs) — auth endpoints (`AuthController`)
- [snapwrite/Controllers/DocumentController.cs](snapwrite/Controllers/DocumentController.cs) — document endpoints (`DocumentController`)
- [snapwrite/Data/AppDbContext.cs](snapwrite/Data/AppDbContext.cs) — EF Core DbContext (`AppDbContext`)
- [snapwrite/DTOs/AuthDTO.cs](snapwrite/DTOs/AuthDTO.cs), [snapwrite/DTOs/DocumentDTO.cs](snapwrite/DTOs/DocumentDTO.cs) — request/response DTOs (`AuthDTO`, `DocumentDTO`)
- [snapwrite/WeatherForecast.cs](snapwrite/WeatherForecast.cs) — sample model (`WeatherForecast`)
- [snapwrite/Migrations/](snapwrite/Migrations/) — EF migrations
- [snapwrite/Models/](snapwrite/Models/) — domain models
- [snapwrite/Properties/](snapwrite/Properties/) — assembly properties

Frontend (Next.js + Tailwind):

- [snapwrite/frontend-web/package.json](snapwrite/frontend-web/package.json)
- [snapwrite/frontend-web/next.config.ts](snapwrite/frontend-web/next.config.ts)
- [snapwrite/frontend-web/tsconfig.json](snapwrite/frontend-web/tsconfig.json)
- [snapwrite/frontend-web/tailwind.config.ts](snapwrite/frontend-web/tailwind.config.ts)
- [snapwrite/frontend-web/.env.example](snapwrite/frontend-web/.env.example)
- [snapwrite/frontend-web/README.md](snapwrite/frontend-web/README.md)

Other top-level files:

- [.gitignore](.gitignore)
- [snapwrite.sln](snapwrite.sln)
- [snapwrite/snapwrite.http](snapwrite/snapwrite.http)
- [README.md](README.md)

## Core components (symbols)

- [`Program`](snapwrite/Program.cs)
- [`AuthController`](snapwrite/Controllers/AuthController.cs)
- [`DocumentController`](snapwrite/Controllers/DocumentController.cs)
- [`AppDbContext`](snapwrite/Data/AppDbContext.cs)
- [`AuthDTO`](snapwrite/DTOs/AuthDTO.cs)
- [`DocumentDTO`](snapwrite/DTOs/DocumentDTO.cs)
- [`WeatherForecast`](snapwrite/WeatherForecast.cs)

## Database & migrations

- Migrations are in [snapwrite/Migrations/](snapwrite/Migrations/).
- Configure connection strings in [snapwrite/appsettings.json](snapwrite/appsettings.json).
- Typical EF commands:

```sh
dotnet ef migrations add <Name> --project snapwrite/snapwrite.csproj
dotnet ef database update --project snapwrite/snapwrite.csproj
```

## Notes

- Use [snapwrite/snapwrite.http](snapwrite/snapwrite.http) to exercise API endpoints.
- Frontend environment variables: copy [snapwrite/frontend-web/.env.example](snapwrite/frontend-web/.env.example) to `.env.local` and update.

## Links to files

- [.gitignore](.gitignore)
- [README.md](README.md)
- [snapwrite.sln](snapwrite.sln)
- [snapwrite/appsettings.Development.json](snapwrite/appsettings.Development.json)
- [snapwrite/appsettings.json](snapwrite/appsettings.json)
- [snapwrite/Program.cs](snapwrite/Program.cs)
- [snapwrite/snapwrite.csproj](snapwrite/snapwrite.csproj)
- [snapwrite/snapwrite.http](snapwrite/snapwrite.http)
- [snapwrite/WeatherForecast.cs](snapwrite/WeatherForecast.cs)
- [snapwrite/Controllers/AuthController.cs](snapwrite/Controllers/AuthController.cs)
- [snapwrite/Controllers/DocumentController.cs](snapwrite/Controllers/DocumentController.cs)
- [snapwrite/Data/AppDbContext.cs](snapwrite/Data/AppDbContext.cs)
- [snapwrite/DTOs/AuthDTO.cs](snapwrite/DTOs/AuthDTO.cs)
- [snapwrite/DTOs/DocumentDTO.cs](snapwrite/DTOs/DocumentDTO.cs)
- [snapwrite/frontend-web/.env.example](snapwrite/frontend-web/.env.example)
- [snapwrite/frontend-web/.gitignore](snapwrite/frontend-web/.gitignore)
- [snapwrite/frontend-web/components.json](snapwrite/frontend-web/components.json)
- [snapwrite/frontend-web/next.config.ts](snapwrite/frontend-web/next.config.ts)
- [snapwrite/frontend-web/package.json](snapwrite/frontend-web/package.json)
- [snapwrite/frontend-web/pnpm-lock.yaml](snapwrite/frontend-web/pnpm-lock.yaml)
- [snapwrite/frontend-web/postcss.config.js](snapwrite/frontend-web/postcss.config.js)
- [snapwrite/frontend-web/README.md](snapwrite/frontend-web/README.md)
- [snapwrite/frontend-web/tailwind.config.ts](snapwrite/frontend-web/tailwind.config.ts)
- [snapwrite/frontend-web/tsconfig.json](snapwrite/frontend-web/tsconfig.json)
- [snapwrite/Migrations/](snapwrite/Migrations/)
- [snapwrite/Models/](snapwrite/Models/)
- [snapwrite/Properties/](snapwrite/Properties/)

If you want, I can: add endpoint documentation (based on controller methods), generate an OpenAPI/Swagger summary, or create a shorter project README.// filepath: README.md

# SnapWrite

Lightweight ASP.NET Core backend with a Next.js frontend scaffold. This repository contains the API server (C#) and the frontend app (TypeScript/Next.js).

## Quick start

Prerequisites:

- .NET SDK (6+)
- Node.js (16+)
- pnpm (recommended) or npm

Run backend:

```sh
dotnet restore
dotnet build
dotnet run --project snapwrite/snapwrite.csproj
```

Run frontend:

```sh
cd snapwrite/frontend-web
pnpm install    # or: npm install
pnpm run dev    # or: npm run dev
```

API requests examples are in [snapwrite/snapwrite.http](snapwrite/snapwrite.http).

## Project layout

- [snapwrite/Program.cs](snapwrite/Program.cs) — app entry
- [snapwrite/snapwrite.csproj](snapwrite/snapwrite.csproj) — backend project file
- [snapwrite/appsettings.json](snapwrite/appsettings.json), [snapwrite/appsettings.Development.json](snapwrite/appsettings.Development.json) — configuration
- [snapwrite/Controllers/AuthController.cs](snapwrite/Controllers/AuthController.cs) — auth endpoints (`AuthController`)
- [snapwrite/Controllers/DocumentController.cs](snapwrite/Controllers/DocumentController.cs) — document endpoints (`DocumentController`)
- [snapwrite/Data/AppDbContext.cs](snapwrite/Data/AppDbContext.cs) — EF Core DbContext (`AppDbContext`)
- [snapwrite/DTOs/AuthDTO.cs](snapwrite/DTOs/AuthDTO.cs), [snapwrite/DTOs/DocumentDTO.cs](snapwrite/DTOs/DocumentDTO.cs) — request/response DTOs (`AuthDTO`, `DocumentDTO`)
- [snapwrite/WeatherForecast.cs](snapwrite/WeatherForecast.cs) — sample model (`WeatherForecast`)
- [snapwrite/Migrations/](snapwrite/Migrations/) — EF migrations
- [snapwrite/Models/](snapwrite/Models/) — domain models
- [snapwrite/Properties/](snapwrite/Properties/) — assembly properties

Frontend (Next.js + Tailwind):

- [snapwrite/frontend-web/package.json](snapwrite/frontend-web/package.json)
- [snapwrite/frontend-web/next.config.ts](snapwrite/frontend-web/next.config.ts)
- [snapwrite/frontend-web/tsconfig.json](snapwrite/frontend-web/tsconfig.json)
- [snapwrite/frontend-web/tailwind.config.ts](snapwrite/frontend-web/tailwind.config.ts)
- [snapwrite/frontend-web/.env.example](snapwrite/frontend-web/.env.example)
- [snapwrite/frontend-web/README.md](snapwrite/frontend-web/README.md)

Other top-level files:

- [.gitignore](.gitignore)
- [snapwrite.sln](snapwrite.sln)
- [snapwrite/snapwrite.http](snapwrite/snapwrite.http)
- [README.md](README.md)

## Core components (symbols)

- [`Program`](snapwrite/Program.cs)
- [`AuthController`](snapwrite/Controllers/AuthController.cs)
- [`DocumentController`](snapwrite/Controllers/DocumentController.cs)
- [`AppDbContext`](snapwrite/Data/AppDbContext.cs)
- [`AuthDTO`](snapwrite/DTOs/AuthDTO.cs)
- [`DocumentDTO`](snapwrite/DTOs/DocumentDTO.cs)
- [`WeatherForecast`](snapwrite/WeatherForecast.cs)

## Database & migrations

- Migrations are in [snapwrite/Migrations/](snapwrite/Migrations/).
- Configure connection strings in [snapwrite/appsettings.json](snapwrite/appsettings.json).
- Typical EF commands:

```sh
dotnet ef migrations add <Name> --project snapwrite/snapwrite.csproj
dotnet ef database update --project snapwrite/snapwrite.csproj
```

## Notes

- Use [snapwrite/snapwrite.http](snapwrite/snapwrite.http) to exercise API endpoints.
- Frontend environment variables: copy [snapwrite/frontend-web/.env.example](snapwrite/frontend-web/.env.example) to `.env.local` and update.

## Links to files

- [.gitignore](.gitignore)
- [README.md](README.md)
- [snapwrite.sln](snapwrite.sln)
- [snapwrite/appsettings.Development.json](snapwrite/appsettings.Development.json)
- [snapwrite/appsettings.json](snapwrite/appsettings.json)
- [snapwrite/Program.cs](snapwrite/Program.cs)
- [snapwrite/snapwrite.csproj](snapwrite/snapwrite.csproj)
- [snapwrite/snapwrite.http](snapwrite/snapwrite.http)
- [snapwrite/WeatherForecast.cs](snapwrite/WeatherForecast.cs)
- [snapwrite/Controllers/AuthController.cs](snapwrite/Controllers/AuthController.cs)
- [snapwrite/Controllers/DocumentController.cs](snapwrite/Controllers/DocumentController.cs)
- [snapwrite/Data/AppDbContext.cs](snapwrite/Data/AppDbContext.cs)
- [snapwrite/DTOs/AuthDTO.cs](snapwrite/DTOs/AuthDTO.cs)
- [snapwrite/DTOs/DocumentDTO.cs](snapwrite/DTOs/DocumentDTO.cs)
- [snapwrite/frontend-web/.env.example](snapwrite/frontend-web/.env.example)
- [snapwrite/frontend-web/.gitignore](snapwrite/frontend-web/.gitignore)
- [snapwrite/frontend-web/components.json](snapwrite/frontend-web/components.json)
- [snapwrite/frontend-web/next.config.ts](snapwrite/frontend-web/next.config.ts)
- [snapwrite/frontend-web/package.json](snapwrite/frontend-web/package.json)
- [snapwrite/frontend-web/pnpm-lock.yaml](snapwrite/frontend-web/pnpm-lock.yaml)
- [snapwrite/frontend-web/postcss.config.js](snapwrite/frontend-web/postcss.config.js)
- [snapwrite/frontend-web/README.md](snapwrite/frontend-web/README.md)
- [snapwrite/frontend-web/tailwind.config.ts](snapwrite/frontend-web/tailwind.config.ts)
- [snapwrite/frontend-web/tsconfig.json](snapwrite/frontend-web/tsconfig.json)
- [snapwrite/Migrations/](snapwrite/Migrations/)
- [snapwrite/Models/](snapwrite/Models/)
- [snapwrite/Properties/](snapwrite/Properties/)

If you want, I can: add endpoint documentation (based on controller methods), generate an OpenAPI/Swagger summary, or create a shorter project README.
