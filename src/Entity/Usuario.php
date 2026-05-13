<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
class Usuario implements UserInterface, PasswordAuthenticatedUserInterface{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nombre = null;

    #[ORM\Column(length: 150)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $passwordHash = null;

    #[ORM\Column(length: 20)]
    private ?string $rol = null;

    #[ORM\Column]
    private ?\DateTime $fechaCreacion = null;

    /**
     * @var Collection<int, Direccion>
     */
    #[ORM\OneToMany(targetEntity: Direccion::class, mappedBy: 'usuario', orphanRemoval: true)]
    private Collection $direcciones;

    /**
     * @var Collection<int, MetodoPago>
     */
    #[ORM\OneToMany(targetEntity: MetodoPago::class, mappedBy: 'usuario', orphanRemoval: true)]
    private Collection $metodoPagos;

    /**
     * @var Collection<int, CarritoItem>
     */
    #[ORM\OneToMany(targetEntity: CarritoItem::class, mappedBy: 'usuario', orphanRemoval: true)]
    private Collection $carritoItems;

    /**
     * @var Collection<int, Pedido>
     */
    #[ORM\OneToMany(targetEntity: Pedido::class, mappedBy: 'usuario', orphanRemoval: true)]
    private Collection $pedidos;

    public function __construct()
    {
        $this->direcciones = new ArrayCollection();
        $this->metodoPagos = new ArrayCollection();
        $this->carritoItems = new ArrayCollection();
        $this->pedidos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPasswordHash(): ?string
    {
        return $this->passwordHash;
    }

    public function setPasswordHash(string $passwordHash): static
    {
        $this->passwordHash = $passwordHash;

        return $this;
    }

    public function getRol(): ?string
    {
        return $this->rol;
    }

    public function setRol(string $rol): static
    {
        $this->rol = $rol;

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

    /**
     * @return Collection<int, Direccion>
     */
    public function getDirecciones(): Collection
    {
        return $this->direcciones;
    }

    public function addDireccione(Direccion $direccione): static
    {
        if (!$this->direcciones->contains($direccione)) {
            $this->direcciones->add($direccione);
            $direccione->setUsuario($this);
        }

        return $this;
    }

    public function removeDireccione(Direccion $direccione): static
    {
        if ($this->direcciones->removeElement($direccione)) {
            // set the owning side to null (unless already changed)
            if ($direccione->getUsuario() === $this) {
                $direccione->setUsuario(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, MetodoPago>
     */
    public function getMetodoPagos(): Collection
    {
        return $this->metodoPagos;
    }

    public function addMetodoPago(MetodoPago $metodoPago): static
    {
        if (!$this->metodoPagos->contains($metodoPago)) {
            $this->metodoPagos->add($metodoPago);
            $metodoPago->setUsuario($this);
        }

        return $this;
    }

    public function removeMetodoPago(MetodoPago $metodoPago): static
    {
        if ($this->metodoPagos->removeElement($metodoPago)) {
            // set the owning side to null (unless already changed)
            if ($metodoPago->getUsuario() === $this) {
                $metodoPago->setUsuario(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, CarritoItem>
     */
    public function getCarritoItems(): Collection
    {
        return $this->carritoItems;
    }

    public function addCarritoItem(CarritoItem $carritoItem): static
    {
        if (!$this->carritoItems->contains($carritoItem)) {
            $this->carritoItems->add($carritoItem);
            $carritoItem->setUsuario($this);
        }

        return $this;
    }

    public function removeCarritoItem(CarritoItem $carritoItem): static
    {
        if ($this->carritoItems->removeElement($carritoItem)) {
            // set the owning side to null (unless already changed)
            if ($carritoItem->getUsuario() === $this) {
                $carritoItem->setUsuario(null);
            }
        }

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
            $pedido->setUsuario($this);
        }

        return $this;
    }

    public function removePedido(Pedido $pedido): static
    {
        if ($this->pedidos->removeElement($pedido)) {
            // set the owning side to null (unless already changed)
            if ($pedido->getUsuario() === $this) {
                $pedido->setUsuario(null);
            }
        }

        return $this;
    }
    public function getRoles(): array
    {
        return [$this->rol === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER'];
    }

    public function getPassword(): ?string
    {
        return $this->passwordHash;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function eraseCredentials(): void
    {
        
    }
}
