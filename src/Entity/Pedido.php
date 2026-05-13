<?php

namespace App\Entity;

use App\Repository\PedidoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PedidoRepository::class)]
class Pedido
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    private ?string $estado = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $total = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $referenciaPago = null;

    #[ORM\Column]
    private ?\DateTime $fechaCreacion = null;

    #[ORM\ManyToOne(inversedBy: 'pedidos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $usuario = null;

    /**
     * @var Collection<int, DetallePedido>
     */
    #[ORM\OneToMany(targetEntity: DetallePedido::class, mappedBy: 'pedido', orphanRemoval: true)]
    private Collection $detallePedidos;

    #[ORM\ManyToOne(inversedBy: 'pedidos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Direccion $direccion = null;

    public function __construct()
    {
        $this->detallePedidos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEstado(): ?string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): static
    {
        $this->estado = $estado;

        return $this;
    }

    public function getTotal(): ?string
    {
        return $this->total;
    }

    public function setTotal(string $total): static
    {
        $this->total = $total;

        return $this;
    }

    public function getReferenciaPago(): ?string
    {
        return $this->referenciaPago;
    }

    public function setReferenciaPago(?string $referenciaPago): static
    {
        $this->referenciaPago = $referenciaPago;

        return $this;
    }

    public function getFechaCreacion(): ?\DateTime
    {
        return $this->fechaCreacion;
    }

    public function setFechaCreacion(\DateTime $fechaCreacion): static
    {
        $this->fechaCreacion = $fechaCreacion;

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

    /**
     * @return Collection<int, DetallePedido>
     */
    public function getDetallePedidos(): Collection
    {
        return $this->detallePedidos;
    }

    public function addDetallePedido(DetallePedido $detallePedido): static
    {
        if (!$this->detallePedidos->contains($detallePedido)) {
            $this->detallePedidos->add($detallePedido);
            $detallePedido->setPedido($this);
        }

        return $this;
    }

    public function removeDetallePedido(DetallePedido $detallePedido): static
    {
        if ($this->detallePedidos->removeElement($detallePedido)) {
            // set the owning side to null (unless already changed)
            if ($detallePedido->getPedido() === $this) {
                $detallePedido->setPedido(null);
            }
        }

        return $this;
    }

    public function getDireccion(): ?Direccion
    {
        return $this->direccion;
    }

    public function setDireccion(?Direccion $direccion): static
    {
        $this->direccion = $direccion;

        return $this;
    }
}
