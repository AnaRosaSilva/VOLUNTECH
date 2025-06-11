create database Voluntech;
use Voluntech;

CREATE TABLE ONG (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    cnpj VARCHAR(20) UNIQUE,
    area_atuacao VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20),
    senha VARCHAR(255)
);
CREATE TABLE Voluntario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    cpf VARCHAR(20) UNIQUE,
    habilidades TEXT,
    localizacao VARCHAR(100),
    disponibilidade VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20),
    senha VARCHAR(255)
);
CREATE TABLE Oportunidade (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ong_id INT,
    titulo VARCHAR(100),
    descricao TEXT,
    requisitos TEXT,
    data_evento DATE,
    local_evento VARCHAR(100),
    CONSTRAINT fk_oportunidade_ong FOREIGN KEY (ong_id) REFERENCES ONG(id)
);
CREATE TABLE Candidatura (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voluntario_id INT,
    oportunidade_id INT,
    status ENUM('pendente', 'aceito', 'recusado') DEFAULT 'pendente',
    data_candidatura DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidatura_voluntario FOREIGN KEY (voluntario_id) REFERENCES Voluntario(id),
    CONSTRAINT fk_candidatura_oportunidade FOREIGN KEY (oportunidade_id) REFERENCES Oportunidade(id)
);
CREATE TABLE Avaliacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    avaliador_id INT,
    avaliado_id INT,
    tipo ENUM('voluntario', 'ong'),
    nota INT CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Certificado (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voluntario_id INT,
    oportunidade_id INT,
    data_emissao DATE DEFAULT CURRENT_DATE,
    CONSTRAINT fk_certificado_voluntario FOREIGN KEY (voluntario_id) REFERENCES Voluntario(id),
    CONSTRAINT fk_certificado_oportunidade FOREIGN KEY (oportunidade_id) REFERENCES Oportunidade(id)
); 
SELECT * FROM Voluntario;


