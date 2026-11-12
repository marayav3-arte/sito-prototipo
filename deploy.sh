#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SCRIPT DE DESPLIEGUE — SIG Mantención Industrial (SITO)
# Repositorio: https://github.com/marayav3-arte/sito-prototipo
# ═══════════════════════════════════════════════════════════════
set -e  # Detener ante cualquier error

REPO_URL="https://github.com/marayav3-arte/sito-prototipo.git"
BRANCH="main"

echo ""
echo "🏭  SIG MANTENCIÓN INDUSTRIAL — Deploy Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── PASO 1: Verificar prerequisitos ───────────────────────────
echo "▶ [1/5] Verificando prerequisitos..."
command -v git >/dev/null 2>&1 || { echo "❌ git no encontrado. Instala Xcode CLT: xcode-select --install"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "⚠️  node no en PATH. Usando build existente en dist/"; }
echo "✅ Git: $(git --version)"

# ── PASO 2: Build de producción (opcional si dist/ ya existe) ─
if [ "$1" == "--rebuild" ] || [ ! -f "dist/index.html" ]; then
  echo ""
  echo "▶ [2/5] Generando build de producción..."
  npx expo export --platform web --output-dir dist
  echo "✅ Build completado → dist/"
else
  echo "▶ [2/5] Build existente encontrado en dist/ ✅ (usa --rebuild para forzar)"
fi

# ── PASO 3: Inicializar/verificar repositorio git ─────────────
echo ""
echo "▶ [3/5] Configurando repositorio git..."

if [ ! -d ".git" ]; then
  git init
  echo "  → Repositorio inicializado"
else
  echo "  → Repositorio git ya existe"
fi

# Configurar identidad si no está establecida
git config user.name  "$(git config user.name  2>/dev/null || echo 'marayav3-arte')"
git config user.email "$(git config user.email 2>/dev/null || echo 'marayav3-arte@users.noreply.github.com')"

# ── PASO 4: Commit ────────────────────────────────────────────
echo ""
echo "▶ [4/5] Preparando commit..."

git add .

# Verificar si hay cambios para commitear
if git diff --cached --quiet; then
  echo "  → Sin cambios nuevos para commitear"
else
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
  git commit -m "🏭 Deploy SITO prototipo — $TIMESTAMP

  - Horómetro General (HorometroBlock + HorometroContext)
  - KPIs de Confiabilidad vinculados al horómetro en tiempo real
  - Barras macro Operación/Detención en módulo Confiabilidad
  - Tabla Estado del Equipo con botones 'Fundamento' acordeón
  - Columnas FUNDAMENTO/IDEAL alineadas pixel-perfect
  - Build Expo web — 2279 módulos — dist/"
  echo "✅ Commit creado"
fi

# ── PASO 5: Push al repositorio remoto ───────────────────────
echo ""
echo "▶ [5/5] Subiendo a GitHub..."

# Configurar remote si no existe
if git remote get-url origin >/dev/null 2>&1; then
  echo "  → Remote 'origin' ya configurado: $(git remote get-url origin)"
else
  git remote add origin "$REPO_URL"
  echo "  → Remote 'origin' agregado: $REPO_URL"
fi

# Renombrar rama a main si es necesario
git branch -M "$BRANCH"

# Push
git push -u origin "$BRANCH"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  DEPLOY COMPLETADO"
echo ""
echo "   Repositorio: $REPO_URL"
echo "   Rama:        $BRANCH"
echo ""
echo "   Para desplegar en Vercel:"
echo "   → Importa el repo en vercel.com/new"
echo "   → Vercel detectará vercel.json automáticamente"
echo ""
echo "   Para desplegar en Netlify:"
echo "   → netlify deploy --dir=dist --prod"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
