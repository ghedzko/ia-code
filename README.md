# IA Code - CLI de IA Multi-Proveedor

CLI completo similar a Codex/Claude/Gemini que permite generar código, leer proyectos, modificar archivos, ejecutar comandos, explicar código y trabajar con múltiples proveedores de IA configurados mediante variables de entorno.

## Características

- **Multi-proveedor**: Soporte para DeepSeek, Grok, OpenAI, Anthropic (Claude) y Google (Gemini)
- **Chat interactivo**: Conversación continua con streaming de respuestas
- **Generación de código**: Crear código nuevo desde instrucciones en lenguaje natural
- **Explicación de código**: Entender código existente con explicaciones detalladas
- **Refactorización**: Modificar y mejorar código existente
- **Análisis de proyectos**: Lectura y análisis de estructura de proyectos
- **Integración Git**: Detección de cambios y estado del repositorio
- **Ejecución segura**: Sistema de políticas para ejecutar comandos del sistema
- **Configuración flexible**: Variables de entorno y archivo de configuración TOML

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd ia-code

# Instalar dependencias
bun install

# Construir el CLI
bun run build
```

## Configuración

### Variables de Entorno

Configura las API keys en tu `.zshrc` o `.bashrc`:

```bash
# Proveedor por defecto
export IA_PROVIDER=deepseek

# API Keys (configura la del proveedor que uses)
export IA_DEEPSEEK_API_KEY=tu_api_key_aqui
export IA_GROK_API_KEY=tu_api_key_aqui
export IA_OPENAI_API_KEY=tu_api_key_aqui
export IA_ANTHROPIC_API_KEY=tu_api_key_aqui
export IA_GOOGLE_API_KEY=tu_api_key_aqui

# Opcional: Modelo específico
export IA_MODEL=deepseek-chat
export IA_TEMPERATURE=0.7
export IA_MAX_TOKENS=4096
```

### Archivo de Configuración

El CLI crea automáticamente un archivo de configuración en `~/.ia-code/config.toml`:

```toml
[default]
provider = "deepseek"
model = "deepseek-chat"
temperature = 0.7
max_tokens = 4096

[execpolicy]
allowed = ["bun", "npm", "git", "test"]
blocked = ["rm", "sudo", "format"]

[context]
max_files = 50
ignore_patterns = ["node_modules", ".git", "dist", "build", ".next"]

[memory]
enabled = true
storage_path = "~/.ia-code/memory"

[mcp]
enabled = false
```

## Uso

### Chat Interactivo

```bash
bun run src/cli/index.ts chat
```

### Generar Código

```bash
bun run src/cli/index.ts generate "crear una función que calcule el factorial" -o factorial.ts
```

### Explicar Código

```bash
bun run src/cli/index.ts explain src/utils/logger.ts
```

### Refactorizar Código

```bash
bun run src/cli/index.ts refactor src/utils/logger.ts "mejorar la legibilidad y agregar tipos"
```

### Ejecutar Comandos

```bash
bun run src/cli/index.ts exec "bun test"
```

### Inicializar Configuración

```bash
bun run src/cli/index.ts init
```

## Desarrollo

```bash
# Modo desarrollo
bun run dev

# Construir para producción
bun run build
```

## Estructura del Proyecto

```
ia-code/
├── src/
│   ├── cli/              # CLI y comandos
│   ├── providers/        # Proveedores de IA
│   ├── context/          # Lectura y análisis de proyectos
│   ├── editor/           # Modificación de archivos
│   ├── memory/           # Memoria persistente
│   ├── tests/            # Generación de tests
│   ├── docs/             # Generación de documentación
│   ├── debugging/        # Análisis de errores
│   ├── analysis/         # Análisis proactivo
│   ├── autofix/          # Corrección automática
│   ├── executor/         # Ejecución de comandos
│   ├── mcp/              # Integración MCP
│   ├── ide/              # Integración con IDEs
│   ├── product/          # Product thinking
│   ├── config/            # Sistema de configuración
│   └── utils/             # Utilidades
├── package.json
└── tsconfig.json
```

## Proveedores Soportados

- **DeepSeek**: `deepseek` (por defecto)
- **Grok (xAI)**: `grok`
- **OpenAI**: `openai`
- **Anthropic (Claude)**: `anthropic`
- **Google (Gemini)**: `google`

## Licencia

MIT
