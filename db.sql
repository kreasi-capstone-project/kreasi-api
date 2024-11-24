CREATE DATABASE IF NOT EXISTS kreasi ;

USE kreasi;

CREATE TABLE users (
	id VARCHAR(36) NOT NULL PRIMARY KEY,
	fullname VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(300) NOT NULL,
	token VARCHAR(1000),

	UNIQUE(email)
)
