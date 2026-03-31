# vm
@'
# VisualMath

Monorepo проекта VisualMath.

## Пакеты

- `apps/mobile` — мобильное приложение Expo / React Native
- `packages/shared` — DTO, ошибки, события
- `packages/integration` — HTTP / WebSocket / сервисы
- `packages/graphics` — 2D/3D визуализация
- `packages/server-mock` — mock API для локальной разработки

## Быстрый старт

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev:server
pnpm dev:mobile
