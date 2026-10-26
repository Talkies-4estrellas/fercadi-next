# ============================================================
#  Exporta los DATOS de la base de Supabase (FERCADI)
#
#  Usa pg_dump directamente (sin CLI de Supabase, sin Docker).
#
#  REQUISITO: pg_dump instalado
#    winget install -e --id PostgreSQL.PostgreSQL.17
#    (elige solo "Command Line Tools"; cierra y reabre la terminal)
#
#  USO:
#    cd "C:\fercadi-next"
#    .\scripts\exportar-datos.ps1
# ============================================================

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '=== Exportar datos de Supabase - FERCADI ===' -ForegroundColor Cyan
Write-Host ''

# ---- Buscar pg_dump ----
$pgDumpCmd = Get-Command pg_dump -ErrorAction SilentlyContinue
$pgDumpExe = if ($pgDumpCmd) { $pgDumpCmd.Source } else { $null }

if (-not $pgDumpExe) {
  $candidatos = @(
    'C:\Program Files\PostgreSQL\*\bin\pg_dump.exe',
    'C:\Program Files (x86)\PostgreSQL\*\bin\pg_dump.exe'
  )
  $encontrado = Get-ChildItem -Path $candidatos -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending | Select-Object -First 1
  if ($encontrado) {
    $pgDumpExe = $encontrado.FullName
    Write-Host "pg_dump encontrado en: $pgDumpExe" -ForegroundColor DarkGray
    Write-Host ''
  }
}

if (-not $pgDumpExe) {
  Write-Host 'ERROR: pg_dump no instalado.' -ForegroundColor Red
  Write-Host 'Instalar:  winget install -e --id PostgreSQL.PostgreSQL.17' -ForegroundColor Yellow
  Write-Host 'Luego cierra y vuelve a abrir la terminal.' -ForegroundColor Yellow
  exit 1
}

Write-Host 'Necesitas la cadena de conexion del proyecto VIEJO.' -ForegroundColor White
Write-Host 'Dashboard -> boton verde Connect -> Connection string -> URI' -ForegroundColor DarkGray
Write-Host '  postgresql://postgres:PASSWORD@db.XXXXXX.supabase.co:5432/postgres' -ForegroundColor DarkGray
Write-Host ''

$secure = Read-Host 'Pega la cadena de conexion' -AsSecureString
$dbUrl = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
)

if (-not $dbUrl -or -not $dbUrl.StartsWith('postgresql://')) {
  Write-Host 'ERROR: debe empezar con postgresql://' -ForegroundColor Red
  exit 1
}

$salida = Join-Path $PSScriptRoot '..\respaldo'
New-Item -ItemType Directory -Force -Path $salida | Out-Null
$fecha = Get-Date -Format 'yyyy-MM-dd'

function Quitar-MetacomandosPsql([string]$Ruta) {
  (Get-Content -Path $Ruta -Encoding UTF8) |
    Where-Object { $_ -notmatch '^\s*\\(restrict|unrestrict)\b' } |
    Set-Content -Path $Ruta -Encoding utf8
}

Write-Host ''
Write-Host '1/2  Exportando ESQUEMA (referencia)...' -ForegroundColor Yellow
$archivoEsquema = Join-Path $salida "esquema-$fecha.sql"
& $pgDumpExe $dbUrl --schema=public --schema-only --no-owner --no-privileges -f $archivoEsquema
if ($LASTEXITCODE -ne 0) { Write-Host 'Fallo el dump de esquema' -ForegroundColor Red; exit 1 }
Quitar-MetacomandosPsql $archivoEsquema

Write-Host ''
Write-Host '2/2  Exportando DATOS como INSERTs...' -ForegroundColor Yellow
$archivoDatos = Join-Path $salida "datos-$fecha.sql"
& $pgDumpExe $dbUrl --schema=public --data-only --column-inserts --no-owner --no-privileges -f $archivoDatos
if ($LASTEXITCODE -ne 0) { Write-Host 'Fallo el dump de datos' -ForegroundColor Red; exit 1 }
Quitar-MetacomandosPsql $archivoDatos

$encabezado = @(
  '-- Desactiva triggers durante la carga (evita efectos en triggers de updated_at).',
  'SET session_replication_role = replica;',
  ''
)
$lineas = $encabezado + (Get-Content $archivoDatos -Encoding UTF8)
Set-Content -Path $archivoDatos -Value $lineas -Encoding utf8

Write-Host ''
Write-Host 'LISTO' -ForegroundColor Green
Write-Host "  Esquema: $archivoEsquema"
Write-Host "  Datos:   $archivoDatos"
Write-Host ''
Write-Host 'SIGUIENTES PASOS:' -ForegroundColor Cyan
Write-Host '  1. SQL Editor (proyecto nuevo) -> pegar database/schema.sql'
Write-Host '  2. SQL Editor (proyecto nuevo) -> pegar el archivo datos-*.sql'
Write-Host '  3. SQL Editor (proyecto nuevo) -> re-ejecutar database/seeds_test.sql'
Write-Host '     (recrea los usuarios de prueba: admin@test.com / Test1234)'
Write-Host '  4. node scripts/copiar-imagenes.mjs  (copia bucket productos)'
Write-Host ''
