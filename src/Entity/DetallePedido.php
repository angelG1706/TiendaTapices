<?php

namespace App\Entity;

use App\Repository\DetallePedidoRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DetallePedidoRepository::class)]
class DetallePedido
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $cantidad = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $precioUnitario = null;

    #[ORM\ManyToOne(inversedBy: 'detallePedidos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Tapiz $tapiz = null;

    #[ORM\ManyToOne(inversedBy: 'detallePedidos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Pedido $pedido = null;

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

    public function getPrecioUnitario(): ?string
    {
        return $this->precioUnitario;
    }

    public function setPrecioUnitario(string $precioUnitario): static
    {
        $this->precioUnitario = $precioUnitario;

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

    public function getPedido(): ?Pedido
    {
        return $this->pedido;
    }

    public function setPedido(?Pedido $pedido): static
    {
        $this->pedido = $pedido;

        return $this;
    }
}
