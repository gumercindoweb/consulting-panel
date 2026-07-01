-- Invitation links: admin generates a token per client + accessLevel,
-- shares it manually (WhatsApp/mail), and whoever opens /invite/:token
-- sets their own name, email and password. Single use per token.
CREATE TABLE IF NOT EXISTS invitations (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "clientId" integer NOT NULL,
  token varchar(64) NOT NULL UNIQUE,
  "accessLevel" varchar(16) NOT NULL DEFAULT 'member',
  note varchar(255),
  status varchar(16) NOT NULL DEFAULT 'pending', -- pending | accepted | revoked
  "acceptedByUserId" integer,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "acceptedAt" timestamp
);
