-- MySQL dump 10.13  Distrib 9.6.0, for macos26.4 (arm64)
--
-- Host: localhost    Database: sensaciones
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '34bc2b9c-694f-11f1-8717-1eb42fce7c02:1-467';

--
-- Table structure for table `__drizzle_migrations`
--

DROP TABLE IF EXISTS `__drizzle_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__drizzle_migrations`
--

LOCK TABLES `__drizzle_migrations` WRITE;
/*!40000 ALTER TABLE `__drizzle_migrations` DISABLE KEYS */;
INSERT INTO `__drizzle_migrations` VALUES (1,'814a08e40d7fc2bcfd458759d18319198ca8ae394f2fa15617a78678e9c9c93b',1781588219827),(2,'efd84c336c11ba534f4a569e738a27e1232eaa8b9d488422d15d346e5b254005',1781588361664);
/*!40000 ALTER TABLE `__drizzle_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_access`
--

DROP TABLE IF EXISTS `client_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `clientId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_access`
--

LOCK TABLES `client_access` WRITE;
/*!40000 ALTER TABLE `client_access` DISABLE KEYS */;
INSERT INTO `client_access` VALUES (1,1,1,'2026-06-16 06:49:08'),(2,3,1,'2026-06-22 00:03:03'),(3,239,1,'2026-06-22 00:21:25');
/*!40000 ALTER TABLE `client_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logoUrl` text COLLATE utf8mb4_unicode_ci,
  `branding` json DEFAULT NULL,
  `consultorName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `startDate` timestamp NULL DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'sensaciones-de-tango','Sensaciones de Tango','Show de tango íntimo y auténtico en el corazón de Buenos Aires. Café Tortoni, Av. de Mayo 825, CABA.',NULL,'{\"fontBody\": \"Hanken Grotesk\", \"textColor\": \"#F5EFE6\", \"fontAccent\": \"Bebas Neue\", \"accentColor\": \"#D9A441\", \"fontDisplay\": \"Playfair Display\", \"primaryColor\": \"#B32825\", \"backgroundColor\": \"#0B0807\"}','Gumercindo Jiménez','2025-08-01 03:00:00',1,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(2,'FlyFree Urban','FlyFree Urban',NULL,NULL,'{\"fontBody\": \"Hanken Grotesk\", \"textColor\": \"#F5F0E8\", \"accentColor\": \"#E0913F\", \"fontDisplay\": \"Playfair Display\", \"primaryColor\": \"#B32825\", \"backgroundColor\": \"#0B0807\"}','Gumercindo Jiménez',NULL,1,'2026-06-16 06:59:43','2026-06-16 06:59:43');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `learnings`
--

DROP TABLE IF EXISTS `learnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learnings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `phaseId` int DEFAULT NULL,
  `type` enum('learning','obstacle','win') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'learning',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolution` text COLLATE utf8mb4_unicode_ci,
  `date` timestamp NOT NULL,
  `isResolved` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learnings`
--

LOCK TABLES `learnings` WRITE;
/*!40000 ALTER TABLE `learnings` DISABLE KEYS */;
INSERT INTO `learnings` VALUES (1,1,NULL,'learning','El trafico organico del Cafe Tortoni es una ventaja competitiva enorme','El Cafe Tortoni recibe miles de turistas diariamente. La mayoria no sabe que existe el show de tango. La captacion en el punto de contacto fisico es la oportunidad mas grande del negocio.',NULL,'2025-09-01 03:00:00',0,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(2,1,NULL,'learning','El mercado brasileno representa el 58% del publico potencial','Analisis de conversaciones revelo que la mayoria de consultas entrantes son en portugues. Esto define la prioridad de comunicacion y los recursos a desarrollar.',NULL,'2025-10-01 03:00:00',0,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(3,1,NULL,'obstacle','Resistencia inicial al cambio en el equipo de vendedoras','Las vendedoras digitales mostraron resistencia a adoptar nuevas herramientas y protocolos de comunicacion digital.','Se realizaron capacitaciones progresivas con enfoque practico. Se simplificaron los guiones y se redujo la friccion en el uso de las herramientas.','2026-01-15 03:00:00',1,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(4,1,NULL,'obstacle','Falta de datos historicos sistematizados','El negocio opero 20 anos sin registros digitales de clientes, reservas o metricas. No habia baseline de datos para medir el punto de partida.','Se establecio el Q1 2026 como etapa de baseline: comenzar a registrar datos desde cero para tener metricas reales en el Plan 2026.','2026-01-01 03:00:00',1,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(5,1,NULL,'win','Implementacion exitosa de comunicacion trilingue','Las 6 plantillas de mensajes en ES/EN/PT fueron implementadas y estan en uso activo. Reduccion del tiempo de respuesta manual y mejora en la experiencia del turista internacional.',NULL,'2025-09-15 03:00:00',0,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(6,1,NULL,'win','Capacitacion completada del equipo de vendedoras','Dos rondas de capacitacion completadas. El equipo maneja con mayor fluidez los protocolos de reserva digital y los guiones de conversion.',NULL,'2026-03-01 03:00:00',0,'2026-06-16 06:49:08','2026-06-16 06:49:08');
/*!40000 ALTER TABLE `learnings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metrics`
--

DROP TABLE IF EXISTS `metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `previousValue` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trend` enum('up','down','stable') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'stable',
  `description` text COLLATE utf8mb4_unicode_ci,
  `period` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metrics`
--

LOCK TABLES `metrics` WRITE;
/*!40000 ALTER TABLE `metrics` DISABLE KEYS */;
INSERT INTO `metrics` VALUES (1,1,'Capacidad del show','80',NULL,'personas/funcion','stable','Capacidad maxima de la sala del Cafe Tortoni','Permanente',1,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(2,1,'Funciones por semana','14',NULL,'funciones','stable','Lun-Jue: 2 funciones/dia. Vie-Sab: 3 funciones/dia. Dom: cerrado','Permanente',2,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(3,1,'Mercado brasileno','58',NULL,'% del publico','stable','Porcentaje estimado de turistas de habla portuguesa','Estimado 2025',3,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(4,1,'Plantillas activas','6',NULL,'plantillas','up','Plantillas trilingues implementadas en WhatsApp','Activo desde Sep 2025',4,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(5,1,'Duracion del show','60',NULL,'minutos','stable','Duracion estandar del espectaculo','Permanente',5,'2026-06-16 06:49:08','2026-06-16 06:49:08');
/*!40000 ALTER TABLE `metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestones`
--

DROP TABLE IF EXISTS `milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `milestones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `phaseId` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date` timestamp NOT NULL,
  `status` enum('completed','in_progress','pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `category` enum('strategy','implementation','training','automation','content','analytics','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `impact` enum('high','medium','low') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestones`
--

LOCK TABLES `milestones` WRITE;
/*!40000 ALTER TABLE `milestones` DISABLE KEYS */;
INSERT INTO `milestones` VALUES (1,1,NULL,'Auditoria inicial del negocio','Relevamiento completo de la situacion actual: flujos de reserva manuales por WhatsApp, ausencia de base de datos de clientes, canales de comunicacion activos y oportunidades de automatizacion. Identificacion de los principales puntos de friccion en la experiencia del cliente.','2025-08-15 03:00:00','completed','strategy','high','2026-06-16 06:49:08','2026-06-16 06:49:08'),(2,1,NULL,'Conexion de ManyChat a WhatsApp e Instagram','Implementacion tecnica de la integracion de ManyChat con los canales de comunicacion del show. Configuracion inicial del bot y definicion de los flujos de respuesta automatica.','2025-09-01 03:00:00','completed','automation','high','2026-06-16 06:49:08','2026-06-16 06:49:08'),(3,1,NULL,'Creacion de 6 plantillas de mensajes trilingues','Desarrollo y activacion de 6 plantillas de mensajes en espanol, ingles y portugues para el flujo de reservas por WhatsApp. Cobertura de los principales escenarios: consulta de disponibilidad, confirmacion de reserva, recordatorio de show y seguimiento post-show.','2025-09-15 03:00:00','completed','content','high','2026-06-16 06:49:08','2026-06-16 06:49:08'),(4,1,NULL,'Identificacion del mercado brasileno como prioridad','Analisis de conversaciones entrantes revelo que el 58% del publico potencial es de habla portuguesa. Este hallazgo redefinio la estrategia de comunicacion y la prioridad de los recursos a desarrollar.','2025-10-01 03:00:00','completed','analytics','high','2026-06-16 06:49:08','2026-06-16 06:49:08'),(5,1,NULL,'Primera ronda de capacitacion a vendedoras digitales','Capacitacion del equipo de vendedoras en el uso de herramientas digitales, guiones de venta y protocolos de atencion al cliente. Foco en la adopcion de ManyChat y los nuevos flujos de comunicacion.','2026-01-15 03:00:00','completed','training','medium','2026-06-16 06:49:08','2026-06-16 06:49:08'),(6,1,NULL,'Documentacion de protocolos de reserva','Creacion del manual de protocolos de reserva y comunicacion. Estandarizacion de los procesos de atencion al cliente para garantizar consistencia en la experiencia del turista.','2026-02-01 03:00:00','completed','implementation','medium','2026-06-16 06:49:08','2026-06-16 06:49:08'),(7,1,NULL,'Segunda ronda de capacitacion y refinamiento de guiones','Segunda instancia de capacitacion con el equipo. Ajuste de guiones de conversion basado en los aprendizajes del Q1. Simplificacion de los flujos de atencion para reducir la friccion operativa.','2026-03-01 03:00:00','completed','training','medium','2026-06-16 06:49:08','2026-06-16 06:49:08'),(8,1,NULL,'Lanzamiento del Plan Estrategico 2026','Presentacion y activacion del Plan Estrategico 2026 con tres fases definidas: Auditoria en caliente, Bot minimo viable y Marketing Solido 360. Inicio de la Fase 1: relevamiento de datos reales de trafico y conversion.','2026-05-01 03:00:00','in_progress','strategy','high','2026-06-16 06:49:08','2026-06-16 06:49:08');
/*!40000 ALTER TABLE `milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `okrs`
--

DROP TABLE IF EXISTS `okrs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `okrs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `phaseId` int DEFAULT NULL,
  `objective` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `keyResult` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetValue` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currentValue` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `progressPct` int NOT NULL DEFAULT '0',
  `status` enum('on_track','at_risk','off_track','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'on_track',
  `period` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `okrs`
--

LOCK TABLES `okrs` WRITE;
/*!40000 ALTER TABLE `okrs` DISABLE KEYS */;
INSERT INTO `okrs` VALUES (1,1,NULL,'Automatizar reservas por WhatsApp','Bot de reservas con respuesta menor a 2 minutos','100','30','%',80,'on_track','Q2 2026',NULL,'2026-06-16 06:49:08','2026-06-16 07:27:39'),(2,1,NULL,'Aumentar tasa de conversion','Pasar de 15% al 35% de conversion','35','15','%',15,'at_risk','Q2-Q3 2026',NULL,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(3,1,NULL,'Activar mercado brasileno','Flujo especifico en portugues para turistas','100','60','%',60,'on_track','Q2 2026',NULL,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(4,1,NULL,'Construir base de datos de clientes','Capturar datos de 500 visitantes del Cafe Tortoni','500','0','contactos',0,'on_track','Q2-Q3 2026',NULL,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(5,1,NULL,'Posicionamiento en redes sociales','Alcanzar 10.000 seguidores en Instagram','10000','0','seguidores',0,'on_track','Q3 2026',NULL,'2026-06-16 06:49:08','2026-06-16 06:49:08');
/*!40000 ALTER TABLE `okrs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_phases`
--

DROP TABLE IF EXISTS `project_phases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_phases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('completed','in_progress','pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `startDate` timestamp NULL DEFAULT NULL,
  `endDate` timestamp NULL DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `color` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_phases`
--

LOCK TABLES `project_phases` WRITE;
/*!40000 ALTER TABLE `project_phases` DISABLE KEYS */;
INSERT INTO `project_phases` VALUES (1,1,'DiagnÃ³stico + Estrategia + ImplementaciÃ³n Inicial','Auditoría inicial del negocio: relevamiento de flujos, canales y oportunidades.','completed','2025-08-01 03:00:00','2025-12-31 03:00:00',1,'#D9A441','2026-06-16 06:49:08','2026-06-22 06:31:43'),(2,1,'EjecuciÃ³n/ImplementaciÃ³n + Primera OptimizaciÃ³n','Capacitación del equipo, plantillas trilingües y protocolos de reserva.','completed','2026-01-01 03:00:00','2026-05-31 03:00:00',2,'#E0913F','2026-06-16 06:49:08','2026-06-22 06:31:43'),(3,1,'ConsolidaciÃ³n + OptimizaciÃ³n Avanzada','Auditoría en caliente: relevamiento de datos reales de tráfico y conversión.','in_progress','2026-06-01 03:00:00','2026-08-31 03:00:00',3,'#B32825','2026-06-16 06:49:08','2026-06-22 06:31:43');
/*!40000 ALTER TABLE `project_phases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` enum('document','template','script','training','guide','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `fileUrl` text COLLATE utf8mb4_unicode_ci,
  `externalUrl` text COLLATE utf8mb4_unicode_ci,
  `content` text COLLATE utf8mb4_unicode_ci,
  `isPublic` tinyint(1) NOT NULL DEFAULT '1',
  `order` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (1,1,'Guion de atencion al cliente en WhatsApp','Protocolo completo de respuesta a consultas de reserva en espanol, ingles y portugues.','script',NULL,NULL,NULL,1,1,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(2,1,'Sistema de tickets online','Plataforma de venta de entradas online del show.','guide',NULL,'https://tickets.sensacionesdetango.com',NULL,1,2,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(3,1,'Sitio web oficial','Sitio web de Sensaciones de Tango con informacion del show, horarios y reservas.','guide',NULL,'https://sensacionesdetango.com',NULL,1,3,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(4,1,'WhatsApp de reservas','Canal principal de reservas y atencion al cliente por WhatsApp.','guide',NULL,'https://wa.me/5491150108040',NULL,1,4,'2026-06-16 06:49:08','2026-06-16 06:49:08');
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scope_items`
--

DROP TABLE IF EXISTS `scope_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scope_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `inScope` tinyint(1) NOT NULL DEFAULT '1',
  `category` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scope_items`
--

LOCK TABLES `scope_items` WRITE;
/*!40000 ALTER TABLE `scope_items` DISABLE KEYS */;
INSERT INTO `scope_items` VALUES (1,1,'Estrategia de marketing digital','Definicion y ejecucion de estrategia en redes sociales, contenido y posicionamiento.',1,'Marketing',1,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(2,1,'Automatizacion de reservas por WhatsApp','Implementacion de bots y flujos automaticos de atencion y reserva.',1,'Automatizacion',2,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(3,1,'Capacitacion del equipo de vendedoras','Formacion en herramientas digitales, guiones de venta y protocolos de atencion.',1,'Capacitacion',3,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(4,1,'Comunicacion trilingue ES/EN/PT','Desarrollo de materiales y guiones en espanol, ingles y portugues.',1,'Contenido',4,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(5,1,'Analisis de datos y metricas de conversion','Seguimiento de tasas de conversion, trafico y comportamiento de clientes.',1,'Analitica',5,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(6,1,'Gestion del sistema de tickets online','Integracion y optimizacion del sistema tickets.sensacionesdetango.com.',1,'Tecnologia',6,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(7,1,'Desarrollo del sitio web','Diseno, desarrollo o rediseno del sitio web del show.',0,'Tecnologia',7,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(8,1,'Gestion de la produccion artistica del show','Direccion artistica, coreografias, casting o produccion del espectaculo.',0,'Produccion',8,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(9,1,'Negociacion con el Cafe Tortoni','Gestion del contrato o relacion comercial con el venue.',0,'Operaciones',9,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(10,1,'Publicidad paga Meta Ads Google Ads','Gestion de campanas de publicidad pagada en plataformas digitales.',0,'Marketing',10,'2026-06-16 06:49:08','2026-06-16 06:49:08'),(11,1,'Servicios de diseño gráfico y video','Para contenido en redes sociales y otras acciones',0,'',10,'2026-06-16 07:31:48','2026-06-16 07:31:48'),(12,1,'Soporte y ayuda vía whatsapp','Para resolución de dudas, fallas o aclaraciones ',1,'Soporte y asistencia',11,'2026-06-16 07:36:47','2026-06-16 07:36:47');
/*!40000 ALTER TABLE `scope_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loginMethod` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB AUTO_INCREMENT=405 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'dev-admin','Gumercindo Jiménez','gumercindoweb@gmail.com','password','scrypt:e0730f019d86d5a2b65a62a418686f60:4eeb7c65e206b7acb5d39f36bacb94324ee807588de04e835569bc344ab9a46e2afd9094dc2cfed20e8c900062ebf8b7a29584cba561eb1a8b674ff519e05211','admin','2026-06-16 06:49:08','2026-06-22 02:34:46','2026-06-22 05:34:46'),(3,'local:cliente@sensacionesdetango.com','Sensaciones de Tango','cliente@sensacionesdetango.com','password','scrypt:9406ec6bb89d30e80e37b81b7b59e41e:35e5be703c4b6bed2acaf687e7c955664fb5ea39cc26086143c0461a5842ba989a1ee7b156eef36ee560b1f79a02ee76f778b518e0ef53f141ff8d2c2536bf80','user','2026-06-22 00:03:03','2026-06-22 00:08:36','2026-06-22 03:08:36'),(239,'local:sensacionesdetango.mkt@gmail.com','Sensaciones de Tango','sensacionesdetango.mkt@gmail.com','password','scrypt:22ac21292b310059edff94d5e788c02d:dc139286f718734ce1fcbf9c40bd243a8487ee2b43af0fef9950d3775a6930c086105875398f2b38eb6cdc256d6e940c61539d42dc00a4aa18aceade7803ecbd','user','2026-06-22 00:21:25','2026-06-22 00:21:25','2026-06-22 00:21:25');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-22  3:44:23
