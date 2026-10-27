# Diagramas del Sistema (AGRO-SERVICIOS)

Puedes copiar los bloques de código que se encuentran a continuación (lo que está entre los tres acentos graves ````mermaid ````) y pegarlos en [Mermaid Live Editor](https://mermaid.live/) para visualizar, editar y descargar las imágenes para tu presentación.

## 1. Diagrama Entidad-Relación (Base de Datos)

```mermaid
erDiagram
    CLIENTES ||--o{ OPERACIONES_DIARIAS : "solicita (cliente_id)"
    OPERADORES ||--o{ OPERACIONES_DIARIAS : "ejecuta (cedula_operador)"
    UNIDADES ||--o{ OPERACIONES_DIARIAS : "se moviliza en (placa_unidad)"
    OPERADORES ||--o{ COSTOS_MANTENIMIENTO : "registra (cedula_operador)"
    UNIDADES ||--o{ COSTOS_MANTENIMIENTO : "recibe (placa_unidad)"

    CLIENTES {
        int id_cliente PK
        varchar razon_social
        varchar rif UK
        text domicilio_fiscal
        varchar telefono_cliente
        tinyint estado_cliente
    }

    UNIDADES {
        int id_unidad PK
        varchar placa_unidad UK
        char tipo_unidad
        char descripcion_unidad
        char marca_unidad
        char modelo_unidad
        char ano_unidad
        tinyint estado_unidad
    }

    OPERADORES {
        int id_operador PK
        varchar cedula_operador UK
        char nombre_operador
        char apellido_operador
        char telefono_operador
        char direccion_operador
        char cargo_operador
        tinyint estado_operador
    }

    OPERACIONES_DIARIAS {
        int id_operacion PK
        char codigo_operacion
        char tipo_operacion
        date fecha_operacion
        time hora_operacion
        char destino_operacion
        char nombre_atendido
        char apellido_atendido
        varchar cedula_atendido
        varchar placa_unidad FK
        varchar cedula_operador FK
        enum estatus
        decimal precio
        int cliente_id FK
    }

    COSTOS_MANTENIMIENTO {
        int id_costo PK
        varchar placa_unidad FK
        varchar cedula_operador FK
        date fecha
        varchar descripcion
        decimal costo
    }

    SEGURIDAD {
        int id_usuario PK
        char usuario
        char clave
        char email
        char pregunta_secreta
        char respuesta_secreta
        char privilegio_rol
        tinyint perm_clientes
        tinyint perm_operaciones
        tinyint perm_unidades
        tinyint perm_operadores
        tinyint perm_costos
    }
```

---

## 2. Diagrama de Casos de Uso (Roles y Permisos)

```mermaid
flowchart LR
    %% Estilos de los Actores
    classDef actorStyle fill:#2c3e50,stroke:#34495e,stroke-width:2px,color:#fff,shape:circle
    
    %% Actores
    Admin((👨‍💻 Administrador)):::actorStyle
    User((👤 Usuario Operativo)):::actorStyle

    %% Grupo 1: Módulos de Administración y Control
    subgraph Control_y_Administracion ["Control y Administración"]
        UC1([Visualizar KPIs y Rentabilidad])
        UC2([Respaldar Base de Datos])
        UC3([Activar / Desactivar Registros])
        UC4([Eliminar Registros Definitivamente])
    end

    %% Grupo 2: Módulos de Ingreso de Datos (Operaciones, Clientes, etc.)
    subgraph Gestion_Datos ["Gestión de Datos (CRUD)"]
        UC5([Registrar Nueva Información])
        UC6([Editar / Modificar Registros])
    end

    %% Grupo 3: Módulos de Búsqueda y Extracción
    subgraph Consultas_y_Reportes ["Consultas y Reportes"]
        UC7([Navegar por las Tablas])
        UC8([Buscar y Aplicar Filtros])
        UC9([Exportar a CSV / Excel])
        UC10([Imprimir Reportes en Físico])
    end

    %% Conexiones del Administrador (Tiene acceso a TODO)
    Admin ===> UC1
    Admin ===> UC2
    Admin ===> UC3
    Admin ===> UC4
    Admin ===> UC5
    Admin ===> UC6
    Admin ===> UC7
    Admin ===> UC8
    Admin ===> UC9
    Admin ===> UC10

    %% Conexiones del Usuario (Solo tiene acceso a lectura y reportes)
    User ---> UC7
    User ---> UC8
    User ---> UC9
    User ---> UC10
```
