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

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    question TEXT NOT NULL,
    answers JSON NOT NULL,
    correct_answers VARCHAR(255) NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
);
