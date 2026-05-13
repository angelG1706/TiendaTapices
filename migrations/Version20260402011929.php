<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260402011929 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE carrito_item (id INT AUTO_INCREMENT NOT NULL, cantidad INT NOT NULL, updated_at DATETIME NOT NULL, usuario_id INT NOT NULL, tapiz_id INT NOT NULL, INDEX IDX_3397DFA6DB38439E (usuario_id), INDEX IDX_3397DFA6627B4375 (tapiz_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE coleccion (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(100) NOT NULL, descripcion LONGTEXT DEFAULT NULL, fecha_creacion DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE detalle_pedido (id INT AUTO_INCREMENT NOT NULL, cantidad INT NOT NULL, precio_unitario NUMERIC(10, 2) NOT NULL, tapiz_id INT NOT NULL, pedido_id INT NOT NULL, INDEX IDX_A834F569627B4375 (tapiz_id), INDEX IDX_A834F5694854653A (pedido_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE direccion (id INT AUTO_INCREMENT NOT NULL, calle VARCHAR(200) NOT NULL, colonia VARCHAR(100) NOT NULL, ciudad VARCHAR(100) NOT NULL, estado VARCHAR(100) NOT NULL, codigo_postal VARCHAR(10) NOT NULL, pais VARCHAR(100) NOT NULL, predeterminada TINYINT NOT NULL, usuario_id INT NOT NULL, INDEX IDX_F384BE95DB38439E (usuario_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE metodo_pago (id INT AUTO_INCREMENT NOT NULL, tipo VARCHAR(50) NOT NULL, ultimos4 VARCHAR(4) NOT NULL, token_pasarela VARCHAR(255) NOT NULL, predeterminado TINYINT NOT NULL, usuario_id INT NOT NULL, INDEX IDX_8A0E8868DB38439E (usuario_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE pedido (id INT AUTO_INCREMENT NOT NULL, estado ENUM(\'pendiente\', \'pagado\', \'enviado\', \'entregado\', \'cancelado\') NOT NULL DEFAULT \'pendiente\', total NUMERIC(10, 2) NOT NULL, referencia_pago VARCHAR(255) DEFAULT NULL, fecha_creacion DATETIME NOT NULL, usuario_id INT NOT NULL, direccion_id INT NOT NULL, INDEX IDX_C4EC16CEDB38439E (usuario_id), INDEX IDX_C4EC16CED0A7BD7 (direccion_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');        $this->addSql('CREATE TABLE tapiz (id INT AUTO_INCREMENT NOT NULL, titulo VARCHAR(150) NOT NULL, precio NUMERIC(10, 2) NOT NULL, stock INT NOT NULL, tecnica VARCHAR(100) NOT NULL, medidas VARCHAR(50) NOT NULL, materiales VARCHAR(200) DEFAULT NULL, fecha_elaboracion DATE DEFAULT NULL, lugar_elaboracion VARCHAR(150) DEFAULT NULL, descripcion LONGTEXT DEFAULT NULL, disponible TINYINT NOT NULL, fecha_creacion DATETIME NOT NULL, coleccion_id INT NOT NULL, INDEX IDX_19F401E8A840E940 (coleccion_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE usuario (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL, password_hash VARCHAR(255) NOT NULL, rol ENUM(\'cliente\', \'admin\') NOT NULL DEFAULT \'cliente\', fecha_creacion DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE carrito_item ADD CONSTRAINT FK_3397DFA6DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE carrito_item ADD CONSTRAINT FK_3397DFA6627B4375 FOREIGN KEY (tapiz_id) REFERENCES tapiz (id)');
        $this->addSql('ALTER TABLE detalle_pedido ADD CONSTRAINT FK_A834F569627B4375 FOREIGN KEY (tapiz_id) REFERENCES tapiz (id)');
        $this->addSql('ALTER TABLE detalle_pedido ADD CONSTRAINT FK_A834F5694854653A FOREIGN KEY (pedido_id) REFERENCES pedido (id)');
        $this->addSql('ALTER TABLE direccion ADD CONSTRAINT FK_F384BE95DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE metodo_pago ADD CONSTRAINT FK_8A0E8868DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE pedido ADD CONSTRAINT FK_C4EC16CEDB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE pedido ADD CONSTRAINT FK_C4EC16CED0A7BD7 FOREIGN KEY (direccion_id) REFERENCES direccion (id)');
        $this->addSql('ALTER TABLE tapiz ADD CONSTRAINT FK_19F401E8A840E940 FOREIGN KEY (coleccion_id) REFERENCES coleccion (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE carrito_item DROP FOREIGN KEY FK_3397DFA6DB38439E');
        $this->addSql('ALTER TABLE carrito_item DROP FOREIGN KEY FK_3397DFA6627B4375');
        $this->addSql('ALTER TABLE detalle_pedido DROP FOREIGN KEY FK_A834F569627B4375');
        $this->addSql('ALTER TABLE detalle_pedido DROP FOREIGN KEY FK_A834F5694854653A');
        $this->addSql('ALTER TABLE direccion DROP FOREIGN KEY FK_F384BE95DB38439E');
        $this->addSql('ALTER TABLE metodo_pago DROP FOREIGN KEY FK_8A0E8868DB38439E');
        $this->addSql('ALTER TABLE pedido DROP FOREIGN KEY FK_C4EC16CEDB38439E');
        $this->addSql('ALTER TABLE pedido DROP FOREIGN KEY FK_C4EC16CED0A7BD7');
        $this->addSql('ALTER TABLE tapiz DROP FOREIGN KEY FK_19F401E8A840E940');
        $this->addSql('DROP TABLE carrito_item');
        $this->addSql('DROP TABLE coleccion');
        $this->addSql('DROP TABLE detalle_pedido');
        $this->addSql('DROP TABLE direccion');
        $this->addSql('DROP TABLE metodo_pago');
        $this->addSql('DROP TABLE pedido');
        $this->addSql('DROP TABLE tapiz');
        $this->addSql('DROP TABLE usuario');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
