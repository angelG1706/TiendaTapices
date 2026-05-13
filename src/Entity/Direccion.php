<?php

namespace App\Entity;

use App\Repository\DireccionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DireccionRepository::class)]
class Direccion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    private ?string $calle = null;

    #[ORM\Column(length: 100)]
    private ?string $colonia = null;

    #[ORM\Column(length: 100)]
    private ?string $ciudad = null;

    #[ORM\Column(length: 100)]
    private ?string $estado = null;

    #[ORM\Column(length: 10)]
    private ?string $codigoPostal = null;

    #[ORM\Column(length: 100)]
    private ?string $pais = null;

    #[ORM\Column]
    private ?bool $predeterminada = null;

    #[ORM\ManyToOne(inversedBy: 'direcciones')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $usuario = null;

    /**
     * @var Collection<int, Pedido>
     */
    #[ORM\OneToMany(targetEntity: Pedido::class, mappedBy: 'direccion')]
    private Collection $pedidos;

    public function __construct()
    {
        $this->pedidos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCalle(): ?string
    {
        return $this->calle;
    }

    public function setCalle(string $calle): static
    {
        $this->calle = $calle;

        return $this;
    }

    public function getColonia(): ?string
    {
        return $this->colonia;
    }

    public function setColonia(string $colonia): static
    {
        $this->colonia = $colonia;

        return $this;
    }

    public function getCiudad(): ?string
    {
        return $this->ciudad;
    }

    public function setCiudad(string $ciudad): static
    {
        $this->ciudad = $ciudad;

        return $this;
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

    public function getCodigoPostal(): ?string
    {
        return $this->codigoPostal;
    }

    public function setCodigoPostal(string $codigoPostal): static
    {
        $this->codigoPostal = $codigoPostal;

        return $this;
    }

    public function getPais(): ?string
    {
        return $this->pais;
    }

    public function setPais(string $pais): static
    {
        $this->pais = $pais;

        return $this;
    }

    public function isPredeterminada(): ?bool
    {
        return $this->predeterminada;
    }

    public function setPredeterminada(bool $predeterminada): static
    {
        $this->predeterminada = $predeterminada;

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
     * @return Collection<int, Pedido>
     */
    public function getPedidos(): Collection
    {
        return $this->pedidos;
    }

    public function addPedido(Pedido $pedido): static
    {
        if (!$this->pedidos->contains($pedido)) {
            $this->pedidos->add($pedido);
            $pedido->setDireccion($this);
        }

        return $this;
    }

    public function removePedido(Pedido $pedido): static
    {
        if ($this->pedidos->removeElement($pedido)) {
            // set the owning side to null (unless already changed)
            if ($pedido->getDireccion() === $this) {
                $pedido->setDireccion(null);
            }
        }

        return $this;
    }
}
