# Casos de Uso por Módulos (Mermaid)

Copia y pega cada bloque en [Mermaid Live Editor](https://mermaid.live/) para generar la gráfica individual de cada módulo de tu sistema.

## 1. Módulo: Dashboard (Inicio)

```mermaid
flowchart LR
    classDef admin fill:#2c3e50,color:#fff,shape:circle
    classDef user fill:#2980b9,color:#fff,shape:circle

    Admin((👨‍💻 Administrador)):::admin
    Usuario((👤 Usuario)):::user
    
    subgraph Módulo Dashboard
        UC1([Visualizar KPIs Generales])
        UC2([Ver Rentabilidad Financiera])
        UC3([Respaldar Base de Datos])
        UC4([Acceso a Panel Básico])
    end
    
    Admin ==> UC1
    Admin ==> UC2
    Admin ==> UC3
    
    Usuario ---> UC4
```

---

## 2. Módulo: Gestión de Operadores

```mermaid
flowchart LR
    classDef admin fill:#2c3e50,color:#fff,shape:circle
    classDef user fill:#2980b9,color:#fff,shape:circle

    Admin((👨‍💻 Administrador)):::admin
    Usuario((👤 Usuario)):::user
    
    subgraph Módulo Operadores
        UC1([Registrar Nuevo Operador])
        UC2([Editar Datos y Cargo])
        UC3([Activar / Desactivar Operador])
        UC4([Eliminar Operador])
        UC5([Buscar y Filtrar Operadores])
        UC6([Exportar Directorio a CSV])
    end
    
    Admin ==> UC1
    Admin ==> UC2
    Admin ==> UC3
    Admin ==> UC4
    Admin ==> UC5
    Admin ==> UC6
    
    Usuario ---> UC5
    Usuario ---> UC6
```

---

## 3. Módulo: Gestión de Unidades

```mermaid
flowchart LR
    classDef admin fill:#2c3e50,color:#fff,shape:circle
    classDef user fill:#2980b9,color:#fff,shape:circle

    Admin((👨‍💻 Administrador)):::admin
    Usuario((👤 Usuario)):::user
    
    subgraph Módulo Unidades
        UC1([Registrar Nueva Unidad])
        UC2([Editar Placa y Detalles])
        UC3([Activar / Desactivar Unidad])
        UC4([Eliminar Unidad])
        UC5([Filtrar por Placa y Tipo])
        UC6([Exportar Flota a CSV])
    end
    
    Admin ==> UC1
    Admin ==> UC2
    Admin ==> UC3
    Admin ==> UC4
    Admin ==> UC5
    Admin ==> UC6
    
    Usuario ---> UC5
    Usuario ---> UC6
```

---

## 4. Módulo: Directorio de Clientes

```mermaid
flowchart LR
    classDef admin fill:#2c3e50,color:#fff,shape:circle
    classDef user fill:#2980b9,color:#fff,shape:circle

    Admin((👨‍💻 Administrador)):::admin
    Usuario((👤 Usuario)):::user
    
    subgraph Módulo Clientes
        UC1([Registrar Nuevo Cliente])
        UC2([Editar RIF y Teléfono])
        UC3([Activar / Desactivar Cliente])
        UC4([Eliminar Cliente])
        UC5([Buscar Clientes por Nombre])
        UC6([Exportar Cartera a CSV])
    end
    
    Admin ==> UC1
    Admin ==> UC2
    Admin ==> UC3
    Admin ==> UC4
    Admin ==> UC5
    Admin ==> UC6
    
    Usuario ---> UC5
    Usuario ---> UC6
```

---

## 5. Módulo: Novedades Diarias (Operaciones)

```mermaid
flowchart LR
    classDef admin fill:#2c3e50,color:#fff,shape:circle
    classDef user fill:#2980b9,color:#fff,shape:circle

    Admin((👨‍💻 Administrador)):::admin
    Usuario((👤 Usuario)):::user
    
    subgraph Módulo Operaciones
        UC1([Registrar Operación Diaria])
        UC2([Asignar Unidad y Operador])
        UC3([Cambiar Estatus de Operación])
        UC4([Editar Costo y Destino])
        UC5([Eliminar Operación Definitiva])
        UC6([Filtrar por Rango de Fechas])
        UC7([Exportar a CSV])
        UC8([Imprimir Informe Físico])
    end
    
    Admin ==> UC1
    Admin ==> UC2
    Admin ==> UC3
    Admin ==> UC4
    Admin ==> UC5
    Admin ==> UC6
    Admin ==> UC7
    Admin ==> UC8
    
    Usuario ---> UC6
    Usuario ---> UC7
    Usuario ---> UC8
```
