<?php

namespace App\Entity;

use App\Repository\CarritoItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CarritoItemRepository::class)]
class CarritoItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $cantidad = null;

    #[ORM\Column]
    private ?\DateTime $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'carritoItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'carritoItems')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Tapiz $tapiz = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCantidad(): ?int
    {
        return $this->cantidad;
    }

    public function setCantidad(int $cantidad): static
    {
        $this->cantidad = $cantidad;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }

    public function getTapiz(): ?Tapiz
    {
        return $this->tapiz;
    }

    public function setTapiz(?Tapiz $tapiz): static
    {
        $this->tapiz = $tapiz;

        return $this;
    }
}
