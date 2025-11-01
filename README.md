# Proyecto: Plataforma de Eventos (Microservicios Java con Spring Boot) + Frontend React

## Resumen

Proyecto compuesto por varios microservicios desarrollados en **Java con Spring Boot** y un frontend en **React**. Está diseñado para gestionar artistas, eventos y usuarios, con descubrimiento de servicios (Eureka), gateway y configuración centralizada mediante Spring Cloud Config.

---

## Estructura del repositorio

```
/root-del-proyecto
├─ .idea/
├─ microservice-artist/
├─ microservice-config/
├─ microservice-eureka/
├─ microservice-event/
├─ microservice-gateway/
├─ microservice-user/
├─ frontend-react/  (o carpeta donde esté el código React)
├─ .gitignore
└─ pom.xml (parent)
```

> En `frontend-react` se espera encontrar archivos como `HomePage.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`, `DashboardPage.jsx`, `EventEditPage.jsx`, `EventDetailsPage.jsx`, `ArtistListPage.jsx`, `ArtistEditPage.jsx`, `AdminPage.jsx`.

---

## Requisitos

* **Java 17** (o la versión que uses en los microservicios)
* **Spring Boot 3+**
* **Maven 3.6+**
* **Node.js 16+** y npm o yarn (para el frontend)
* **Base de datos** (por ejemplo PostgreSQL o MySQL) 

---

## Configuración rápida (local)

A continuación un flujo paso a paso para levantar el proyecto en modo desarrollo.

### 1. Configurar variables de entorno / bases de datos

* Crea bases de datos para cada servicio si usas DB separadas (opcional).
* Variables típicas (ejemplo para Postgres):

  * `DB_HOST=localhost`
  * `DB_PORT=5432`
  * `DB_NAME=events_db`
  * `DB_USER=user`
  * `DB_PASSWORD=password`

También configura la URL de Eureka en cada microservicio y la del config server si corresponde.

### 2. Levantar Config Server (si existe)

```bash
cd microservice-config
mvn spring-boot:run
```

Si tu proyecto usa `spring.cloud.config.server`, asegúrate de que el `application.properties` o `bootstrap.properties` apunten al repo de configuración.

### 3. Levantar Eureka (Service Discovery)

```bash
cd ../microservice-eureka
mvn spring-boot:run
```

Eureka normalmente corre en `http://localhost:8761` (ajusta según tu configuración).

### 4. Levantar Gateway

```bash
cd ../microservice-gateway
mvn spring-boot:run
```

Gateway enruta las peticiones del frontend a los microservicios.

### 5. Levantar microservicios (artist, event, user)

En terminales separadas:

```bash
cd ../microservice-artist
mvn spring-boot:run
```

```bash
cd ../microservice-event
mvn spring-boot:run
```

```bash
cd ../microservice-user
mvn spring-boot:run
```

Cada servicio deberá registrarse en Eureka si la configuración es correcta.

### 6. Levantar Frontend (React)

```bash
cd ../frontend-react
npm install
npm start
```

Por defecto `npm start` abrirá `http://localhost:3000`. Asegúrate de que las llamadas API apunten al Gateway (ej: `http://localhost:8080/api/...`).

---

## Archivos de configuración importantes

* `application.properties` / `application.yml` en cada microservicio

  * `spring.application.name` (nombre del servicio)
  * `eureka.client.serviceUrl.defaultZone` (URL de Eureka)
  * `spring.datasource.*` (datos de la DB)
* `bootstrap.properties` si usas Spring Cloud Config

Ejemplo mínimo en `microservice-artist/src/main/resources/application.properties`:

```properties
spring.application.name=microservice-artist
server.port=8081
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/
```


--- 

## Autores 
- [@Joaquin Rios (joaquinrios-unnoba)](https://github.com/joaquinrios-unnoba)
- [@Luis Francisco Martinez (Francisco9403)](https://github.com/Francisco9403)


---

